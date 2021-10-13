import { Search } from "@mui/icons-material";
import { TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { KeyboardEvent, useCallback, useEffect, useState } from "react";

import "./index.css";
import citiesData from "./utils/city.list.json";

const api = {
  key: "727b661c93e9c793512104a5ee12978c",
  baseUrl: "http://api.openweathermap.org/data/2.5",
};

type Measurement = {
  dt_txt: string;
  date: Date;
  main: {
    temp: number;
    humidity: number;
  };
};

type Weather = Measurement[];

type Temperature = {
  morning?: number;
  day?: number;
  night?: number;
};

type Humidity = number | null;

type Day = {
  date: string;
  temperature: Temperature;
  humidity: Humidity;
};

type City = {
  id: number;
  name: string;
};

function App() {
  const cities = citiesData as City[];

  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<Weather>();
  const [days, setDays] = useState<Day[]>();
  const [error, setError] = useState("");
  const morningHour = 6;
  const dayHour = 12;
  const nightHour = 21;

  const search = (e: KeyboardEvent) => {
    if (city) {
      const cityId = cities.find((item, id) => item.name === city)?.id;

      !cityId ? setError("Please provide a valid city name") : setError("");

      if (e.key === "Enter")
        fetch(
          `${api.baseUrl}/forecast?id=${cityId}&units=metric&appid=${api.key}`
        )
          .then((res) => res.json())
          .then((res) => setWeather(res.list))
          .catch((e) => console.log(e));
    }
  };

  const loadData = useCallback(() => {
    if (weather) {
      const formattedList = weather.map((item: Measurement) => {
        item.date = new Date(item.dt_txt.replace(" ", "T"));
        return item;
      });

      const currentDay = formattedList[0].date.getDate();
      const forecastLength = 5;

      const forecastData: Measurement[][] = new Array(forecastLength)
        .fill({})
        .map((item, dayId) =>
          formattedList.filter(
            (measurement) => measurement.date.getDate() - currentDay === dayId
          )
        );

      let forecast: Day[] = [];

      forecastData.forEach((measurements, id) => {
        const date = new Date(
          new Date().setDate(formattedList[0].date.getDate() + id)
        ).toDateString();

        const vitalMeasurements = measurements.filter(
          (measurement) =>
            measurement.date.getHours() === morningHour ||
            measurement.date.getHours() === dayHour ||
            measurement.date.getHours() === nightHour
        );

        const temperature: Temperature = {};
        const humidityValues: number[] = [];

        vitalMeasurements.forEach((measurement, id) => {
          const { temp } = measurement.main;

          switch (measurement.date.getHours()) {
            case morningHour:
              temperature.morning = temp;
              break;
            case dayHour:
              temperature.day = temp;
              break;
            case nightHour:
              temperature.night = temp;
              break;
          }

          humidityValues.push(measurement.main.humidity);
        });

        const humidity = Math.round(
          humidityValues.reduce((prev, current) => prev + current) /
            humidityValues.length
        );

        forecast.push({ date, temperature, humidity });
      });

      setDays([...forecast]);
    }
  }, [weather]);

  useEffect(() => {
    loadData();
  }, [weather, loadData]);

  return (
    <div className="app">
      <main>
        <Typography
          variant="h2"
          component="h1"
          color="primary"
          sx={{ textShadow: "3px 3px rgba(50,50,70, 0.5)" }}
        >
          CheckUrWeather
        </Typography>

        <Box
          sx={{
            color: "white",
            display: "flex",
            alignItems: "flex-end",
          }}
        >
          <Search
            sx={{ color: "action.active", fontSize: 40, mr: 0.5, my: 0.5 }}
          />
          <TextField
            onChange={(e) => setCity(e.target.value)}
            value={city}
            onKeyPress={(e) => search(e)}
            id="search"
            variant="standard"
            type="search"
            label="City..."
            size="medium"
            inputProps={{
              style: { fontSize: 30, height: 50 },
            }}
            InputLabelProps={{
              style: { fontSize: 30 },
            }}
          />
        </Box>

        {error && <Typography color="red">{error}</Typography>}

        <Box display="flex">
          {days &&
            days.map((day, id) => (
              <Box
                key={id}
                margin="20px"
                bgcolor="rgba(200,200,200, 0.5)"
                textAlign="center"
                p="10px"
                borderRadius="10px"
                boxShadow="5px 5px rgba(50,50,70, 0.7)"
              >
                <Typography fontWeight={700}>{day.date}</Typography>
                <Typography>
                  Morning: {day.temperature.morning} &#8451;
                </Typography>
                <Typography>Day: {day.temperature.day} &#8451;</Typography>
                <Typography>Night: {day.temperature.night} &#8451;</Typography>
                <Typography>Humidity: {day.humidity} &#8451;</Typography>
              </Box>
            ))}
        </Box>
      </main>
    </div>
  );
}

export default App;
