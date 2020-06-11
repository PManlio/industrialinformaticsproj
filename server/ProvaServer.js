const opcua = require("node-opcua");
let getWeatherData = require("./utility/provaUtility");
const cities = require("./utility/cities_list");

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

    const citiesNode = namespace.addObject({
        organizedBy: addressSpace.rootFolder.objects,
        browseName: "Cities"});
    
    for (let city of cities) {
        const cityNode = namespace.addObject({
            organizedBy: citiesNode,
            browseName: city});

    // variabili
    // temperatura
    namespace.addVariable({
        componentOf: cityNode,
        browseName: "temperature",
        nodeId: `s=${city}-Temperature`,
        dataType: "Double",

        value: {refreshFunc : getWeatherData(opcua.dataType.Double, city, "temperature") }
    });

    // umidità
    namespace.addVariable({
        componentOf: cityNode,
        browseName: "humidity",
        nodeId: `s=${city}-Humidity`,
        dataType: "Double",

        value: {refreshFunc: getWeatherData(opcua.dataType.Double, city, "humidity") }
    });

    // Weather
    namespace.addVariable({
        componentOf: cityNode,
        browseName: "weather",
        nodeId: `s=${city}-Weather`,
        dataType: "String",

        value: {refreshFunc : getWeatherData(opcua.dataType.String, city, "weather") }
    });
    }
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
