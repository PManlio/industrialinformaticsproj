// node provaUtility.js

const fs = require("fs");
const key = fs.readFileSync("./openWeatherAPI.key");
const unirest = require("unirest");
const cities = require("./cities_list");
const opcua = require("node-opcua");

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
function extractUsefulData(data) {
    return  {
        city:               data.name,
        date:               new Date(),
        observation_time:   unixEpoqToDate(data.dt),
        temperature:        data.main.temp,
        humidity:           data.main.humidity,
        weather:            data.weather[0].main
    };
}


// mando chiamate API periodicamente, evitando di intasare il web-server
/* let catania_data = {};
setInterval(async () => {
   catania_data = extractUsefulData(await getCityWeather("Catania"));
   console.log(catania_data);
},5*1000); */


// costruisco una map in cui raccogliere le informazioni di ogni citta
const city_map = {};

/* const next_city  = ((arr) => {
    let counter = arr.length;
    return function() {
       counter += 1;
       if (counter>=arr.length) {
         counter = 0;
       }
       return arr[counter];
    };
})(cities); */

 async function update_city_data(city) {

    try {
        const data  = await getCityWeather(city);
        city_map[city] = extractUsefulData(data);
    }
    catch(err) {
        console.log("error city",city , err);
        return ;
    }
}

// effettuo una chiamata API ogni 5 secondi (non intaso il web server di richieste)
/* function fill_map() {
    const interval = 5*1000;
    setInterval(async () => {

         const city = next_city();
         console.log("updating city =",city);
         await update_city_data(city);

        // console.log(city_map[city]);
    }, interval);  
} */


// ritorno i dati in base alla citta 
module.exports = async function getValues(city_name) {

    await update_city_data(city_name);
    // const value = city[property];
    console.log(city_map[city_name])

    }