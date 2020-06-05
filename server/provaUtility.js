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
            //.header("X-RapidAPI-Host", "community-open-weather-map.p.rapidapi.com")
            //.header("X-RapidAPI-Key", key)
            .end(
                (response) => resolve(response)
            );
    });
    if (result.status !== 200) {
        throw new Error("API error");
    }
    // return result.body;
    console.log(result.body)
}

getWeather(`Catania`);