import { Box, Paper, Tooltip, Typography } from "@mui/material";
import { Weather } from ".";
import Image from "next/image";
import { roundedTemp } from "@/utils/parseDate";
import Link from "next/link";

const SimpleForecast = ({ weather }: { weather: Weather }) => {
  const {
    forecast: { forecastday },
    location,
  } = weather;

  const forecast = forecastday.slice(1);

  return (
    <Paper
      sx={{
        py: 2,
        px: 4,
        borderRadius: "10px",
        backgroundColor: "rgba(255,255,255,0.75)",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          color: "#727e8e",
          textAlign: { xs: "center", md: "left" },
        }}
      >
        Previsão 7 dias
      </Typography>
      <Box
        mt={2}
        component="ul"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          overflowX: "auto",
          flexWrap: "wrap",
          flexDirection: {
            xs: "column",
            md: "row",
          },
        }}
      >
        {forecast.map((forecast) => (
          <Tooltip key={forecast.weekDay} title="Clique para ver mais detalhes">
            <Link
              href={`/previsao/${location.lat}/${location.lon}?dt=${forecast.date}`}
            >
              <Box
                component="li"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flex: {
                    xs: 1,
                    sm: "unset",
                  },
                  p: 2,
                  ":hover": {
                    cursor: "pointer",
                    backgroundColor: "#fff",
                    borderRadius: "10px",
                    transition: "all 0.3s ease-in-out",
                  },
                }}
              >
                <Typography
                  sx={{
                    fontWeight: "bold",
                    fontSize: "1.125rem",
                    color: "#4581c5",
                  }}
                >
                  {forecast.weekDay.charAt(0).toUpperCase() +
                    forecast.weekDay.split("-")[0].slice(1)}
                </Typography>
                <Image
                  src={"http:" + forecast.day.condition.icon}
                  alt="Icon"
                  width={64}
                  height={64}
                  style={{
                    filter: "drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))",
                    margin: "0.5rem 0",
                  }}
                />
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    maxWidth: "5rem",
                    textAlign: "center",
                    mt: "auto",
                    color: "#4a6fa1",
                  }}
                >
                  {forecast.day.condition.text}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "1.125rem",
                    color: "#4a6fa1",
                    width: "5rem",
                    textAlign: "center",
                    mt: "auto",
                  }}
                >
                  {roundedTemp(forecast.day.mintemp_c)}°{" / "}
                  {roundedTemp(forecast.day.maxtemp_c)}°
                </Typography>
              </Box>
            </Link>
          </Tooltip>
        ))}
      </Box>
    </Paper>
  );
};

export default SimpleForecast;
