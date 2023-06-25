import { Weather } from "@/components/Wheater";
import { format, parse } from "date-fns";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import ptBR from "date-fns/locale/pt-BR";
import CurrentStatus from "@/components/Wheater/CurrentStatus";
import { Box, Button, Chip, Paper, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeviceThermostatIcon from "@mui/icons-material/DeviceThermostat";
import HumidityMidIcon from "@mui/icons-material/Opacity";
import Link from "next/link";
import Router from "next/router";
import {
  AreaChart,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { roundedTemp } from "@/utils/parseDate";
import { useEffect, useState } from "react";
import Spinner from "@/components/Spinner/Spinner";

export const getServerSideProps: GetServerSideProps<{
  weather: Weather;
  tempGraphData: { time: string; temp_c: number }[];
  humidityGraphData: { time: string; humidity: number }[];
}> = async (context) => {
  const { params, query } = context;

  if (!params || !query.dt) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const { lat, long } = params;
  const { dt } = query;

  const response: Response & Weather & { error: any } = await fetch(
    `https://api.weatherapi.com/v1/forecast.json?key=0b9777b11df14ee099732107232106&q=${lat},${long}&dt=${dt}&&aqi=yes&alerts=no&lang=pt`
  ).then((res) => res.json());

  if (response.error) throw response;

  const weather = {
    current: response.current,
    location: response.location,
    forecast: {
      forecastday: response.forecast.forecastday.map((forecast) => ({
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

  const tempGraphData = response.forecast.forecastday[0].hour.map((hour) => ({
    time: hour.time.split(" ")[1],
    temp_c: roundedTemp(hour.temp_c),
  }));

  const humidityGraphData = response.forecast.forecastday[0].hour.map(
    (hour) => ({
      time: hour.time.split(" ")[1],
      humidity: roundedTemp(hour.humidity),
    })
  );

  return {
    props: { weather, tempGraphData, humidityGraphData },
  };
};

export default function DetailedWeather({
  weather,
  tempGraphData,
  humidityGraphData,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [loading, setLoading] = useState(true);
  const [showTemperature, setShowTemperature] = useState(true);

  const refreshData = () => {
    Router.replace(Router.asPath);
    setLoading(true);
  };

  useEffect(() => {
    setLoading(false);
  }, [weather]);

  const formattedDate = format(
    parse(weather?.forecast?.forecastday[0]?.date, "yyyy-MM-dd", new Date()),
    "dd/MM/yyyy",
    {
      locale: ptBR,
    }
  );

  const formattedLastUpdate = format(
    parse(weather?.current?.last_updated, "yyyy-MM-dd HH:mm", new Date()),
    "dd/MM/yyyy HH:mm'h",
    {
      locale: ptBR,
    }
  );

  return (
    <Box
      sx={{
        maxWidth: "960px",
        width: "100%",
        px: { xs: 3, lg: 0 },
      }}
    >
      {loading && <Spinner />}
      <Box
        mb={2}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
        <Box
          display="flex"
          alignItems="center"
          color="white"
          sx={{
            cursor: "pointer",
            width: "80px",
          }}
          onClick={() =>
            Router.replace(
              `/?q=${weather.location.lat},${weather.location.lon}`
            )
          }
        >
          <ArrowBackIcon />
          Voltar
        </Box>
        <Button
          variant="outlined"
          color="inherit"
          sx={{
            color: "white",
          }}
          type="button"
          onClick={() => refreshData()}
        >
          Atualizar dados
        </Button>
      </Box>
      <CurrentStatus
        weather={weather}
        title={`Clima do dia ${formattedDate} - Ultima atualização em: ${formattedLastUpdate}`}
      />
      <Paper sx={{ mt: 2, py: 2, px: 4, borderRadius: "10px" }}>
        <Box display="flex" alignItems="center" mb={1}>
          <Typography color="#707070" fontWeight={500}>
            {showTemperature ? "Temperatura" : "Umidade do ar"}
          </Typography>
          <Typography color="#b7b6b6" ml={1} fontSize="1rem">
            {showTemperature ? " Celsius (°C)" : " Porcentagem (%)"}
          </Typography>
        </Box>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart
            data={showTemperature ? tempGraphData : humidityGraphData}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" tickLine={false} axisLine={false} />
            <YAxis
              tickFormatter={(value) =>
                `${value}${showTemperature ? "°C" : "%"}`
              }
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value) => [
                `${value}${showTemperature ? "°C" : "%"}`,
                showTemperature ? "Temperatura" : "Umidade",
              ]}
              labelFormatter={(value) => `${value}h`}
            />
            <Area
              type="monotone"
              dataKey={showTemperature ? "temp_c" : "humidity"}
              stroke={showTemperature ? "#e03737" : "#02B2E4"}
              fill={showTemperature ? "#e24646" : "#CAEEF9"}
            />
          </AreaChart>
        </ResponsiveContainer>
        <Box mt={2} display="flex" justifyContent="center">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              cursor: "pointer",
            }}
            onClick={() => setShowTemperature(true)}
          >
            <Box
              sx={{
                p: "4px 6px",
                borderRadius: "10px",
                backgroundColor: showTemperature ? "#E47366" : "#C2C3C5",
                color: "white",
              }}
            >
              <DeviceThermostatIcon />
            </Box>
            <Box
              component="span"
              sx={{
                color: "#707070",
                fontWeight: "bold",
              }}
            >
              Temperatura
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              p: 2,
              ml: 2,
              cursor: "pointer",
            }}
            onClick={() => setShowTemperature(false)}
          >
            <Box
              sx={{
                p: "4px 6px",
                borderRadius: "10px",
                backgroundColor: showTemperature ? "#C2C3C5" : "#B3DBF9",
                color: "white",
              }}
            >
              <HumidityMidIcon />
            </Box>
            <Box
              component="span"
              sx={{
                mt: "auto",
                color: "#707070",
                fontWeight: 500,
              }}
            >
              Umidade
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
