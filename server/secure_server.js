const opcua = require("node-opcua");
const cities = require("./utility/cities_list");
const getWeather = require("./utility/utility");
const { SecurityPolicy, MessageSecurityMode } = require("node-opcua");

// funzione per la gestione del login al server (singolo user -> inserire lettura MongoDB)
const userManager = {
    isValidUser: (userName, password) => {
        if (userName === "user1" && password === "password1") {
            return true;
        }
        if (userName === "user2" && password === "password2") {
            return true;
        }
        return false;
    }
};

// certificato e private key (maybe useless)
/* const server_certificate_file = constructFilename("certificates/server_selfsigned_cert_2048.pem");
const server_certificate_privatekey_file = constructFilename("certificates/server_key_2048.pem"); */

// parametri da passare per la creazione del server sicuro
const conn_par = {

    securityPolicies: [
        SecurityPolicy.Basic128Rsa15,
        SecurityPolicy.Basic256
    ],

    SecurityModes: [
        MessageSecurityMode.Sign,
        MessageSecurityMode.SignAndEncrypt
    ],
    
    port: 5000,


  resourcePath: "/UA/IndustrialInformaticsServer",
  buildInfo: {
    productName: "OPCUAProjectServer",
    buildNumber: "1",
    buildDate: new Date()
  },

  userManager,
  allowAnonymous: false,

  isAuditing: false
};

// creazione del server, con passaggio di parametri
let server = new opcua.OPCUAServer(conn_par);

let build_my_address_space = (server) => {
  const addressSpace = server.engine.addressSpace;
  const namespace = addressSpace.getOwnNamespace();

  const citiesNode = namespace.addObject({
    organizedBy: addressSpace.rootFolder.objects,
    browseName: "Cities"
  });

  for (let city_name of cities) {

    const cityNode = namespace.addObject({
      organizedBy: citiesNode,
      browseName: city_name
    });

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
          let tempValue = parseFloat(returnValue.temperature) - 273.15;
          callback(null, new opcua.DataValue({
            value: new opcua.Variant({ dataType: opcua.DataType.Double, value: tempValue }),
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
            value: new opcua.Variant({ dataType: opcua.DataType.Double, value: preValue }),
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
            value: new opcua.Variant({ dataType: opcua.DataType.Double, value: humValue }),
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
            value: new opcua.Variant({ dataType: opcua.DataType.String, value: weaValue }),
            statusCode: opcua.StatusCodes.Good,
            sourceTimestamp: new Date(),
          })
          );
        }
      }
    });

  }
}

// avvio campionamento ciclico
setInterval(((callback) => {
  async (err) => {
    let result = await provaUtility.execution(city_name);
    if (err != null) throw err;
    else {
      callback(null, result);
    }
  } 
}), 3000);

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
