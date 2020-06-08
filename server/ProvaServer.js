const opcua = require("node-opcua");
const meteoParser = require("./utility/meteoParser.js")

// parametri da passare per la creazione del server
const conn_par = {
    port: 5000,
    resourcePath: "/UA/IndustrialInformaticsServer",
    buildInfo: {
        productName: "OPCUAProjectServer",
        buildNumber: "1",
        buildDate: new Date()
    }
};

// creazione del server, con passaggio di parametri
let server = new opcua.OPCUAServer(conn_par);


let build_my_address_space = (server) => {
    const addressSpace = server.engine.addressSpace;
    const namespace = addressSpace.getOwnNamespace();

    //dichiarare i nuovi oggetti
    const device = namespace.addObject({
        organizedBy: addressSpace.rootFolder.objects,
        browseName: "MyObjectDevice",
    });


    // variabili
    // temperatura
    namespace.addVariable({
        componentOf: device,
        browseName: "temperature",
        nodeId: "s=Temperature",
        dataType: "Float",

        value: {
            refreshFunc: function(callback) {

                let temperature = meteoParser.getTemperature();
                let DataValue = new opcua.DataValue({
                     value: new opcua.Variant({ dataType: opcua.DataType.Float, value: temperature}),
                     statusCode: opcua.StatusCodes.Good,
                     sourceTimestamp: new Date()
                });
                
                callback(null, DataValue);
            }
        }
    });

    // umidità
    namespace.addVariable({
        componentOf: device,
        browseName: "humidity",
        nodeId: "s=Humidity",
        dataType: "Double",

        value: {
            refreshFunc: function(callback) {

                let humidity = meteoParser.getHumidity();
                let DataValue = new opcua.DataValue({
                     value: new opcua.Variant({ dataType: opcua.DataType.Double, value: humidity}),
                     statusCode: opcua.StatusCodes.Good,
                     sourceTimestamp: new Date()
                });

                callback(null, DataValue);
            }
        }
    });

    // pressione
    namespace.addVariable({
        componentOf: device,
        browseName: "pressure",
        nodeId: "s=Pressure",
        dataType: "Double",

        value: {
            refreshFunc: function(callback) {

                let pressure = meteoParser.getPressure();
                let DataValue = new opcua.DataValue({
                     value: new opcua.Variant({ dataType: opcua.DataType.Double, value: pressure}),
                     statusCode: opcua.StatusCodes.Good,
                     sourceTimestamp: new Date()
                });
                
                callback(null, DataValue);
            }
        }
    });

    // tempo
    namespace.addVariable({
        componentOf: device,
        browseName: "weather",
        nodeId: "s=Weather",
        dataType: "String",

        value: {
            refreshFunc: function(callback) {

                let weahter = meteoParser.getWeather();
                let DataValue = new opcua.DataValue({
                     value: new opcua.Variant({ dataType: opcua.DataType.String, value: weahter}),
                     statusCode: opcua.StatusCodes.Good,
                     sourceTimestamp: new Date()
                });
                
                callback(null, DataValue);
            }
        }
    });
}

// inizializzazione del server
server.initialize(() => {
    console.log(`OPCUA server start init--`);

    // riempiamo l'address space
    build_my_address_space(server);
    console.log("Address space initialized. Starting server...");

    // avviamo il server:
    server.start(() => {
        console.log(`Server started.
        listening to port: 
            ${server.endpoints[0].port}
        pimary server endpoint url is:
            ${server.endpoints[0].endpointDescriptions()[0].endpointUrl}
        Press Ctrl+C to stop server`);
    });
});
