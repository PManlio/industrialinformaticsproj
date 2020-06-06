const esecuzione = require("./provaUtility.js")

/* 
// test query
async function parsing () {
    let datiMeteo = await esecuzione();
    console.log(`Questa è una query di prova.
    temperatura: ${datiMeteo.temperature},
    umidità: ${datiMeteo.humidity},
    pressione: ${datiMeteo.pressure},
    tempo: ${datiMeteo.weather}`);
}
parsing();
*/

module.exports = {
    getTemperature: async () => {
        let datiMeteo = await esecuzione();
        return datiMeteo.temperature.parseFloat; // Float
    },
    getHumidity: async () => {
        let datiMeteo = await esecuzione();
        return datiMeteo.humidity.parseInt; // Double
    },
    getPressure: async () => {
        let datiMeteo = await esecuzione();
        return datiMeteo.pressure.parseInt; // Double
    },
    getWeather: async () => {
        let datiMeteo = await esecuzione();
        return datiMeteo.weather.toString; // String
    }
}