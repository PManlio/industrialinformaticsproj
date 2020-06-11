const opcua = require("node-opcua");
const parser = require("./utility/provaParser");
const cities = require("./utility/cities_list");
const getWeather = require("./utility/provaUtility");

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
    
    for (let city_name of cities) {

        const cityNode = namespace.addObject({
            organizedBy: citiesNode,
            browseName: city_name});

            (async () => {
                const city = await provaUtility.execution(city_name);
            })()
            


    // variabili
    // temperatura
    namespace.addVariable({
        componentOf: cityNode,
        browseName: "temperature",
        nodeId: `s=${city_name}-Temperature`,
        dataType: "Double",
    
        value: {
        refreshFunc: async (callback) => {
          returnValue = await getWeather.execution(city_name);
          let tempValue = parseFloat(returnValue.temperature)-273.15;
          callback(null, new opcua.DataValue({
                value: new opcua.Variant({dataType: opcua.DataType.Double, value: tempValue}),
                statusCode: opcua.StatusCodes.Good,
                sourceTimestamp: new Date(),
              })
            );
        }
      }
    });

       // pressure
   namespace.addVariable({
    componentOf: cityNode,
    browseName: "pressure",
    nodeId: `s=${city_name}-Pressure`,
    dataType: "Double",

    value: {
    refreshFunc: async (callback) => {
      returnValue = await getWeather.execution(city_name);
      let preValue = parseFloat(returnValue.pressure);
      callback(null, new opcua.DataValue({
            value: new opcua.Variant({dataType: opcua.DataType.Double, value: preValue}),
            statusCode: opcua.StatusCodes.Good,
            sourceTimestamp: new Date(),
          })
        );
    }
  }
});

   // umidità
   namespace.addVariable({
    componentOf: cityNode,
    browseName: "humidity",
    nodeId: `s=${city_name}-Humidity`,
    dataType: "Double",

    value: {
    refreshFunc: async (callback) => {
      returnValue = await getWeather.execution(city_name);
      let humValue = parseFloat(returnValue.humidity);
      callback(null, new opcua.DataValue({
            value: new opcua.Variant({dataType: opcua.DataType.Double, value: humValue}),
            statusCode: opcua.StatusCodes.Good,
            sourceTimestamp: new Date(),
          })
        );
    }
  }
});


    // Weather
    namespace.addVariable({
        componentOf: cityNode,
        browseName: "weather",
        nodeId: `s=${city_name}-Weather`,
        dataType: "String",
    
        value: {
        refreshFunc: async (callback) => {
          returnValue = await getWeather.execution(city_name);
          let weaValue = String(returnValue.weather);
          callback(null, new opcua.DataValue({
                value: new opcua.Variant({dataType: opcua.DataType.String, value: weaValue}),
                statusCode: opcua.StatusCodes.Good,
                sourceTimestamp: new Date(),
              })
            );
        }
      }
    });

}}

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
