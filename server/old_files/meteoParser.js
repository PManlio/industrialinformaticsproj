const esecuzione = require("./provaUtility-old.js")
const opcua = require("../node_modules/node-opcua");
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
    getTemperature: async (callback) => {
        let datiMeteo = await esecuzione();
        let tempValue = parseFloat(datiMeteo.temperature);

        let returnValue = new opcua.DataValue({
            value: new opcua.Variant({dataType: opcua.DataType.Double, value: tempValue}),
            statusCode: opcua.StatusCodes.Good,
            sourceTimestamp: new Date(),
        });

        callback(null, returnValue);
    },
    getHumidity: async (callback) => {
        let datiMeteo = await esecuzione();
        let humiValue = parseInt(datiMeteo.humidity);

        let returnValue = new opcua.DataValue({
            value: new opcua.Variant({dataType: opcua.DataType.Double, value: humiValue}),
            statusCode: opcua.StatusCodes.Good,
            sourceTimestamp: new Date(),
        });

        callback(null, returnValue);
    },
    getPressure: async (callback) => {
        let datiMeteo = await esecuzione();
        let presValue = parseInt(datiMeteo.pressure);

        let returnValue = new opcua.DataValue({
            value: new opcua.Variant({dataType: opcua.DataType.Double, value: presValue}),
            statusCode: opcua.StatusCodes.Good,
            sourceTimestamp: new Date(),
        });

        callback(null, returnValue);
    },
    getWeather: async (callback) => {
        let datiMeteo = await esecuzione();
        let weatValue = String(datiMeteo.weather);

        let returnValue = new opcua.DataValue({
            value: new opcua.Variant({dataType: opcua.DataType.String, value: weatValue}),
            statusCode: opcua.StatusCodes.Good,
            sourceTimestamp: new Date(),
        });

        callback(null, returnValue);
    }
}