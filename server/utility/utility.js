let opcua = require("node-opcua");
let os = require("os");
let exec = require("child_process").exec;

const fs = require("fs");
const key = fs.readFileSync("openWeatherAPI.key");
const unirest = require("unirest");

//funzione per il recupero delle previsioni meteo
module.exports.getWeather = function(city) {

    const result = await new Promise((resolve) => {
        unirest.get(
            "http://api.openweathermap.org/data/2.5/weather?"
            + `q=${city}`)
        //.header("X-RapidAPI-Host", "community-open-weather-map.p.rapidapi.com")
        //.header("X-RapidAPI-Key", key)
        .end(
            (response) => resolve(response)
        );
    });
    if (result.status !== 200) {
        throw new Error("API error");
    }
    return result.body;
}

// http://api.openweathermap.org/data/2.5/weather?q={city_name}&appid={key}