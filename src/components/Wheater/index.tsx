import { Box } from "@mui/material";
import CurrentStatus from "./CurrentStatus";
import SimpleForecast from "./SimpleForecast";

export type CurrentWeather = {
  condition: {
    text: string;
    icon: string;
  };
  air_quality: {
    "us-epa-index": number;
  };
  feelslike_c: number;
  humidity: number;
  temp_c: number;
  wind_kph: number;
  last_updated: string;
};

export type Forecast = {
  forecastday: Array<{
    date: string;
    weekDay: string;
    astro: {
      moonrise: string;
      moonset: string;
      sunrise: string;
      sunset: string;
    };
    day: {
      daily_chance_of_rain: number;
      avghumidity: number;
      avgtemp_c: number;
      avgvis_km: number;
      maxtemp_c: number;
      mintemp_c: number;
      condition: {
        icon: string;
        text: string;
      };
    };
    hour: Array<
      {
        chance_of_rain: string;
        time: string;
      } & CurrentWeather
    >;
  }>;
};

export type Weather = {
  current: CurrentWeather;
  location: {
    country: string;
    name: string;
    region: string;
    localtime: string;
    lat: number;
    lon: number;
  };
  forecast: Forecast;
};

const Wheater = ({ weather }: { weather: Weather }) => {
  return (
    <>
      <Box mt={2}>
        <CurrentStatus weather={weather} />
      </Box>
      <Box mt={2}>
        <SimpleForecast weather={weather} />
      </Box>
    </>
  );
};

export default Wheater;
