const opcua = require("node-opcua");
const os = require("os");
const exec = require("child_process").exec;

const fs = require("fs");
const key = fs.readFileSync("openWeatherAPI.key");
const unirest = require("unirest");

//funzione per il recupero delle previsioni meteo
let getWeather = async (city) => {

    const result = await new Promise((resolve) => {
        // http://api.openweathermap.org/data/2.5/weather?q={city_name}&appid={key}
        unirest.get(
            "http://api.openweathermap.org/data/2.5/weather?"
            + `q=${city}`
            + `&appid=${key}`)
        .end(
            (response) => resolve(response)
        );
    });
    if (result.status !== 200) {
        throw new Error("API error");
    }
    return result.body;
}

function extractData(data) {
    return  {
        date:               new Date(),
        temperature:        data.main.temp,
        humidity:           data.main.humidity,
        weather:            data.weather[0].main
    };
}

