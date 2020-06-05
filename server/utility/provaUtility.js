// node provaUtility.js

const fs = require("fs");
const key = fs.readFileSync("openWeatherAPI.key");
const unirest = require("unirest");

//funzione per il recupero delle previsioni meteo
let getWeather = async (city) => {

    let result = await new Promise((resolve) => {
        unirest.get(
            `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}`
            )
            .end(
                (response) => resolve(response)
            );
    });
    if (result.status !== 200) {
        throw new Error("API error");
    }
    return result.body;
    // console.log(result.body)
}

// funzione per sistemare la data
function unixEpoqToDate(unixDate) {
    const d = new Date(0);
    d.setUTCSeconds(unixDate);
    return d;
}

// funzione per l'elaborazione dei dati sotto forma di oggetto
let extractUsefulData = async () => {
    let data = await getWeather('Catania');
    return  {
        city:               data.city,
        date:               new Date(),
        observation_time:   unixEpoqToDate(data.dt),
        temperature:        data.main.temp,
        humidity:           data.main.humidity,
        pressure:           data.main.pressure,
        weather:            data.weather[0].main
    };
}

// funzione eseguibile da esportare
module.exports = async function execution() {
    const roba = await extractUsefulData();
    console.log(roba);
}