const opcua = require("node-opcua");
const cities = require("./utility/cities_list");
const getWeather = require("./utility/utility");
const path = require("path");

// assegnazione della porta per deploy/localhost
let PORT =  parseInt(process.env.PORT) || 5000;

//let user = require('./autenticazione/schema/user.js');
let query = require('./autenticazione/db/connection.js');

// funzione per la gestione del login al server
let userManager = {
  isValidUserAsync: (userName, password, callback) => {
    query.findUser(userName, password)
    .then((user) => {
      callback(null, user);
    })
    .catch((err) => {
      console.log(err);
      callback(err, null);
    })
  }
};

// funzione per la gestione dei certificati 
const certificateManager = new opcua.OPCUACertificateManager({
  automaticallyAcceptUnknownCertificate: true,
  rootFolder: path.join("./", "certificate"),
});

// parametri da passare per la creazione del server sicuro
const conn_par = {

  port: PORT,

  serverCertificateManager: certificateManager,

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