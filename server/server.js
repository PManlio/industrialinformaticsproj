const opcua = require("node-opcua");
const meteoParser = require("./utility/meteoParser.js")

// parametri da passare per la creazione del server
const conn_par = {
    port: 5000,
    resourcePath: "/UA/IndustrialInformaticsServer",
    // @TODO: add certificate file and private key file
    // certificateFile: "certificates/cert.pem",
    // privateKeyFile: "certificates/key.pem",
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

    // qui bisogna dichiarare i nuovi oggetti
    // per esempio, per ora prendiamo il nome del device in cui runna il server
    const device = namespace.addObject({
        organizedBy: addressSpace.rootFolder.objects,
        browseName: "MyObjectDevice",
    });


    // qui bisogna aggiungere le variabili
    // ad esempio, per ora aggiungiamo la variabile riguardante l'architettura del server
    namespace.addVariable({
        propertyOf: device, // con propertyOf abbiamo collegato la variabile all'oggetto device (definito sopra)
        browseName: "CPU_Architecture",
        dataType: "String",
        value: {
            get: () => {
                return new opcua.Variant({ // Variant è il contenitore generico per tutti i dati
                    dataType: opcua.DataType.String, // i DataType sono definiti in Root/Types/DataTypes/BaseDataType
                    value: process.arch
                });
            },
        }
    });

    // temperatura
    namespace.addVariable({
        componentOf: device, // probabilmente è propertyOf, dato che "component" si riferisce più ad un elemento hw
        browseName: "temperature",
        dataType: "Double",
        value: {
            refreshFunc: meteoParser.getTemperature
        }
    });

    // umidità
    namespace.addVariable({
        componentOf: device, // probabilmente è propertyOf, dato che "component" si riferisce più ad un elemento hw
        browseName: "humidity",
        dataType: "Double",
        value: {
            refreshFunc: meteoParser.getHumidity
        }
    });

    // pressione
    namespace.addVariable({
        componentOf: device, // probabilmente è propertyOf, dato che "component" si riferisce più ad un elemento hw
        browseName: "pressure",
        dataType: "Double",
        value: {
            refreshFunc: meteoParser.getPressure
        }
    });

    // tempo
    namespace.addVariable({
        componentOf: device, // probabilmente è propertyOf, dato che "component" si riferisce più ad un elemento hw
        browseName: "weather",
        dataType: "String",
        value: {
            refreshFunc: meteoParser.getWeather
        }
    });

    // qui si aggiungono le variabili che dipendono dall'ambiente in cui runna il server

}

// inizializzazione del server
server.initialize(() => {
    console.log(`OPCUA server start init--`);

    // riempiamo l'address space (è una callback)
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