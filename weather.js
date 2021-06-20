import axios from "axios";
const appID = "28420d0d82cb35240f648cd22425217f";

//WEATHER COMMAND
const weatherEndpoint = (city) =>
  `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&&appid=${appID}`;

// Template for weather response
const weatherHtmlTemplate = (name, main, weather, wind, clouds) =>
  `The weather in <b>${name}</b>:
<b>${weather.main}</b> - ${weather.description}
Temperature: <b>${main.temp} °C</b>
Pressure: <b>${main.pressure} hPa</b>
Humidity: <b>${main.humidity} %</b>
Wind: <b>${wind.speed} meter/sec</b>
Clouds: <b>${clouds.all} %</b>
`;

// Function that gets the weather by the city name and stores the user ID
export async function getWeather(city) {
  const endpoint = weatherEndpoint(city);
  try {
    const data = await axios.get(endpoint);
    const { name, main, weather, wind, clouds } = data.data;
    return weatherHtmlTemplate (name, main, weather[0], wind, clouds);
  } catch (error) {
    console.log("error", error);
    return `Weather not available for: <b>${city}</b>`
  }
   
  /*axios.get(endpoint).then(
    (resp) => {
      const { name, main, weather, wind, clouds } = resp.data;
      console.log(weatherHtmlTemplate(name, main, weather[0], wind, clouds))
      return 'test';
    },
    (error) => {
      console.log("error", error);
      return `Weather not available for: <b>${city}</b>`
    });*/
};

