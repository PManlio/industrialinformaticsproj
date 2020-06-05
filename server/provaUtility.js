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
    return result.body;
    // console.log(result.body)
}

function unixEpoqToDate(unixDate) {
    const d = new Date(0);
    d.setUTCSeconds(unixDate);
    return d;
}

/*
function extractUsefulData(data) {
    //await data;
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

//console.log(extractUsefulData(await getWeather('Catania')));

const esecuzione = async () => {
    const data = await getWeather('Catania');
    console.log(`
    city:               ${data.city},
    date:               ${new Date()},
    observation_time:   ${unixEpoqToDate(data.dt)},
    temperature:        ${data.main.temp},
    humidity:           ${data.main.humidity},
    pressure:           ${data.main.pressure},
    weather:            ${data.weather[0].main}
    `);
}
*/

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

(async function execution() {
    const roba = await extractUsefulData();
    console.log(roba);
})();