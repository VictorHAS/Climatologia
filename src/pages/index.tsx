import { FormEvent, useCallback, useEffect, useState } from "react";
import { Box, IconButton, InputBase, Paper, Tooltip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LocationIcon from "@mui/icons-material/ShareLocation";
import Spinner from "@/components/Spinner/Spinner";
import WeatherStatus, { Weather } from "@/components/Wheater";
import { format, parse } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import Router, { useRouter } from "next/router";

export default function Home() {
  const [weatherData, setWeatherData] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  useEffect(() => {
    router.events.on("beforeHistoryChange", () => {
      setLoading(true);
    });
    router.events.on("routeChangeComplete", () => {
      setLoading(false);
    });
  }, [router.events]);

  const fetchWeatherData = useCallback(
    async (q?: string) => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://api.weatherapi.com/v1/forecast.json?key=0b9777b11df14ee099732107232106&q=${
            q ?? query
          }&days=8&aqi=yes&alerts=no&lang=pt`
        ).then((res) => res.json());

        if (response.error) throw response;

        const weather = {
          current: response.current,
          location: response.location,
          forecast: {
            forecastday: response.forecast.forecastday.map((forecast: any) => ({
              ...forecast,
              weekDay: format(
                parse(forecast.date, "yyyy-MM-dd", new Date()),
                "EEEE",
                {
                  locale: ptBR,
                }
              ),
            })),
          },
        };
        setWeatherData(weather);
        setLoading(false);
        setQuery("");
      } catch (error: any) {
        console.error("Error fetching weather data: ", error);
        setLoading(false);
        setError("Não foi possível encontrar a cidade.");
      }
    },
    [query]
  );

  useEffect(() => {
    if (Router.query.q) {
      fetchWeatherData(Router.query.q as string);
    }
  }, [fetchWeatherData]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (query !== "") {
      setError("");
      fetchWeatherData();
    } else {
      setWeatherData(null);
      setError("Por favor, digite uma cidade.");
    }
  };
  return (
    <>
      {loading && <Spinner />}
      <Box
        sx={{
          maxWidth: "960px",
          width: "100%",
          px: { xs: 3, lg: 0 },
        }}
      >
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              height: "4rem",
            }}
          >
            <Box
              component="h1"
              sx={{
                color: "white",
                fontSize: "2.2rem",
              }}
            >
              Dados climáticos
            </Box>
          </Box>
          <Paper
            component="form"
            onSubmit={handleSearch}
            sx={{
              p: "4px 8px",
              display: "flex",
              alignItems: "center",
              border: error !== "" ? "1px solid red" : "none",
            }}
          >
            <InputBase
              sx={{ flex: 1 }}
              placeholder="Busque por uma cidade"
              inputProps={{
                "aria-label": "Busque por uma cidade",
              }}
              error={error !== ""}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <IconButton type="submit">
              <SearchIcon />
            </IconButton>
            <Tooltip title="Usar sua localização">
              <IconButton
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((position) => {
                      setError("");
                      fetchWeatherData(
                        `${position.coords.latitude},${position.coords.longitude}`
                      );
                    });
                  } else {
                    alert("Este navegador não suporta Geolocalização.");
                  }
                }}
              >
                <LocationIcon />
              </IconButton>
            </Tooltip>
          </Paper>
          {error !== "" && (
            <Box
              sx={{
                color: "red",
                fontSize: "1rem",
                mt: "8px",
              }}
            >
              {error}
            </Box>
          )}
        </Box>

        {weatherData && <WeatherStatus weather={weatherData} />}
      </Box>
    </>
  );
}
