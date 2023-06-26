import { Box, Icon, Paper, SxProps, Typography } from "@mui/material";
import Image from "next/image";

import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import { convertTo24HourFormat, roundedTemp } from "@/utils/parseDate";
import { Weather } from ".";
import { useMemo } from "react";

type StatusProps = {
  icon: string;
  type: string;
  info: any;
  sx?: SxProps;
};

const Status = ({ icon, info, type, sx }: StatusProps) => {
  return (
    <Box display="flex" alignItems="center" sx={sx}>
      <Box display="flex" alignItems="center" width="12rem">
        <Icon
          sx={{
            mr: 2,
            color: "#a1b9ce",
            fontSize: "1rem",
          }}
        >
          {icon}
        </Icon>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 300,
            color: "#a1b9ce",
            fontSize: "1.25rem",
          }}
        >
          {type}
        </Typography>
      </Box>
      <Typography
        variant="body2"
        sx={{
          ml: 4,
          fontWeight: 500,
          fontSize: "1.25rem",
          color: "#3a86ca",
        }}
      >
        {info}
      </Typography>
    </Box>
  );
};

const airQuality = [
  "Boa",
  "Moderado",
  "Alerta para grupo sensível",
  "Ruim",
  "Muito Ruim",
  "Perigoso",
];

const CurrentStatus = ({
  weather,
  title,
}: {
  weather: Weather;
  title?: string;
}) => {
  const { current, location, forecast } = weather;

  return (
    <Paper sx={{ py: 2, px: 4, borderRadius: "10px" }}>
      <Typography
        variant="h6"
        sx={{
          color: "#727e8e",
          textAlign: { xs: "center", md: "left" },
          mb: 2,
        }}
      >
        {title ?? `Clima atual - Ultima atualização às ${current.last_updated}`}
      </Typography>
      <Box
        display="flex"
        flexWrap="wrap"
        sx={{
          justifyContent: {
            xs: "center",
            md: "space-between",
          },
          alignItems: "center",
        }}
      >
        <Box
          display="flex"
          flexDirection="column"
          sx={{ margin: "2rem 1.5rem" }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              color: "#396bae",
              fontSize: "1.25rem",
              mb: 2,
            }}
          >
            {location.name} - {location.region} - {location.country}
          </Typography>
          <Box display="flex" alignItems="center">
            <Image
              src={"http:" + current.condition.icon}
              alt="Icon"
              width={64}
              height={64}
            />
            <Typography
              variant="body2"
              sx={{
                fontWeight: 200,
                fontSize: "5rem",
                color: "#4a6fa1",
                marginLeft: "1.5rem",
                lineHeight: 1,
              }}
            >
              {roundedTemp(current.temp_c)}°
            </Typography>
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontSize: "1.375rem",
              textAlign: "left",
              color: "#7b98b2",
            }}
          >
            {current.condition.text}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column">
          <Box
            component="p"
            sx={{
              fontSize: "1.25rem",
              color: "#4a6fa1",
              textAlign: {
                xs: "center",
                md: "left",
              },
            }}
          >
            Sensação de {roundedTemp(current.feelslike_c)}°
          </Box>
          <Box
            display="flex"
            mt={2}
            sx={{
              justifyContent: {
                xs: "center",
                md: "left",
              },
            }}
          >
            <Box
              display="flex"
              alignItems="center"
              sx={{
                fontWeight: "bold",
                fontSize: "1.25rem",
                color: "#3a86ca",
                mr: 4,
              }}
            >
              <ArrowDownwardRoundedIcon
                sx={{
                  mr: 2,
                  color: "#a1b9ce",
                }}
              />
              {roundedTemp(forecast.forecastday[0].day.mintemp_c)}°
            </Box>
            <Box
              display="flex"
              alignItems="center"
              sx={{
                fontWeight: "bold",
                fontSize: "1.25rem",
                color: "#3a86ca",
              }}
            >
              <ArrowUpwardRoundedIcon
                sx={{
                  mr: 2,
                  color: "#a1b9ce",
                }}
              />
              {roundedTemp(forecast.forecastday[0].day.maxtemp_c)}°
            </Box>
          </Box>

          <Status
            icon="water_drop"
            info={`${current.humidity}%`}
            type="Umidade"
            sx={{ mt: 4 }}
          />
          <Status
            icon="airwave"
            info={`${current.wind_kph} km/h`}
            type="Vento"
            sx={{ mt: 1 }}
          />
          <Status
            icon="wb_twilight"
            info={`${convertTo24HourFormat(
              forecast.forecastday[0].astro.sunrise
            )}h - ${convertTo24HourFormat(
              forecast.forecastday[0].astro.sunset
            )}h`}
            type="Sol"
            sx={{ mt: 1 }}
          />
          <Status
            icon="masks"
            info={airQuality[current.air_quality["us-epa-index"] - 1]}
            type="Qualidade do ar"
            sx={{ mt: 1 }}
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default CurrentStatus;
