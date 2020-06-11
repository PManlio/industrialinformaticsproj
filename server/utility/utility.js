const fs = require("fs");
const key = fs.readFileSync("./utility/openWeatherAPI.key");
const unirest = require("unirest");
// const cities = require("./cities_list");

//funzione per il recupero delle previsioni meteo
let getCityWeather = async (city) => {

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
}

// funzione per correggere data
function unixEpoqToDate(unixDate) {
    const d = new Date(0);
    d.setUTCSeconds(unixDate);
    return d;
}

// funzione per l'estrazione dei dati interessanti
let extractUsefulData = async(city) => {
    let data = await getCityWeather(city);
    return  {
        city:               data.name,
        date:               new Date(),
        observation_time:   unixEpoqToDate(data.dt),
        temperature:        data.main.temp,
        humidity:           data.main.humidity,
        pressure:           data.main.pressure,
        weather:            data.weather[0].main
    };
}

module.exports = {
    execution: async (city) => {
        const roba = await extractUsefulData(city);
        // console.log(roba);s
        return roba;
    }
}