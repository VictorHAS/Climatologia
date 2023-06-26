import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  Box,
  IconButton,
  InputBase,
  List,
  Paper,
  Tooltip,
  autocompleteClasses,
  styled,
  useAutocomplete,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LocationIcon from "@mui/icons-material/ShareLocation";
import Spinner from "@/components/Spinner/Spinner";
import WeatherStatus, { Weather } from "@/components/Wheater";
import { format, parse } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import Router, { useRouter } from "next/router";
import useDebounce from "@/utils/useDebounce";

type City = {
  name: string;
  lat: number;
  lon: number;
  region: string;
  id: number;
};

const Input = styled("input")(({ theme }) => ({
  backgroundColor: theme.palette.mode === "light" ? "#fff" : "#000",
  color: theme.palette.mode === "light" ? "#000" : "#fff",
  flex: 1,
  padding: "10px 0",
  border: "none",
  outline: "none",
  height: "1.4375em",
  fontWeight: 400,
  fontSize: "1rem",
  lineHeight: "1.4375em",
  letterSpacing: "0.00938em",
  "&::placeholder": {
    color: "#ccc",
  },
}));

const Listbox = styled("ul")(
  ({ theme }) => `
  width: 300px;
  margin: 2px 0 0;
  padding: 0;
  position: absolute;
  list-style: none;
  background-color: ${theme.palette.mode === "dark" ? "#141414" : "#fff"};
  overflow: auto;
  max-height: 250px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1;
  cursor: pointer;

  & li {
    padding: 5px 12px;
    display: flex;

    & span {
      flex-grow: 1;
    }

    & svg {
      color: transparent;
    }
  }

  & li[aria-selected='true'] {
    background-color: ${theme.palette.mode === "dark" ? "#2b2b2b" : "#fafafa"};
    font-weight: 600;

    & svg {
      color: #1890ff;
    }
  }

  & li.${autocompleteClasses.focused} {
    background-color: ${theme.palette.mode === "dark" ? "#003b57" : "#e6f7ff"};
    cursor: pointer;

    & svg {
      color: currentColor;
    }
  }
`
);

export default function Home() {
  const [weatherData, setWeatherData] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  const [options, setOptions] = useState<City[]>([]);

  const fetchWeatherData = useCallback(
    async (q?: string) => {
      setError("");
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

  const {
    getRootProps,
    getInputProps,
    getListboxProps,
    getOptionProps,
    groupedOptions,
    inputValue,
    focused,
  } = useAutocomplete<City>({
    options: options,
    getOptionLabel: (option) => option.name || "",
    id: "use-city-search",
    isOptionEqualToValue: (option, value) => option.id === value.id,
    onChange: (_, newValue) => {
      if (newValue) {
        fetchWeatherData(`${newValue.lat},${newValue.lon}`);
      }
    },
  });

  const fetchCities = async (inputValue: string) => {
    try {
      const response = await fetch(
        `http://api.weatherapi.com/v1/search.json?key=0b9777b11df14ee099732107232106&q=${inputValue}`
      ).then((res) => res.json());

      if (response.error) throw response;
      return response;
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  const debouncedValue = useDebounce(inputValue, 600);

  useEffect(() => {
    let active = true;

    if (debouncedValue === "") {
      setOptions([]);
      return undefined;
    }

    (async () => {
      const cities = await fetchCities(debouncedValue);

      if (active) {
        setOptions(cities || []);
      }
    })();

    return () => {
      active = false;
    };
  }, [debouncedValue]);

  const router = useRouter();

  useEffect(() => {
    router.events.on("beforeHistoryChange", () => {
      setLoading(true);
    });
    router.events.on("routeChangeComplete", () => {
      setLoading(false);
    });
  }, [router.events]);

  useEffect(() => {
    if (Router.query.q) {
      fetchWeatherData(Router.query.q as string);
    } else if (localStorage.getItem("location")) {
      fetchWeatherData(localStorage.getItem("location") as string);
    }
  }, [fetchWeatherData]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inputValue !== "") {
      setError("");
      fetchWeatherData(inputValue);
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
          py: 3,
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
            <Box
              {...getRootProps()}
              sx={{
                flex: 1,
              }}
            >
              <Input {...getInputProps()} placeholder="Busque por uma cidade" />
              {groupedOptions.length > 0 ? (
                <Listbox {...getListboxProps()}>
                  {(groupedOptions as typeof options).map((option, index) => (
                    <li {...getOptionProps({ option, index })} key={option.id}>
                      {option.name} - {option.region}
                    </li>
                  ))}
                </Listbox>
              ) : null}

              {options.length === 0 && focused && (
                <Listbox {...getListboxProps()}>
                  <li style={{ cursor: "not-allowed" }}>
                    Nenhuma cidade encontrada
                  </li>
                </Listbox>
              )}
            </Box>
            <IconButton type="submit">
              <SearchIcon />
            </IconButton>
            <Tooltip title="Usar sua localização">
              <IconButton
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((position) => {
                      setError("");
                      const location = `${position.coords.latitude},${position.coords.longitude}`;
                      localStorage.setItem("location", location);
                      fetchWeatherData(location);
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
