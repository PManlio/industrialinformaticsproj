let os = require("os");
let opcua = require("node-opcua");
let getWeather = require("./utility/provaUtility");

data_weather = {};
data_weather = getWeather();
//data_weather structure:
/* {
    date:               new Date(),
    observation_time:   unixEpoqToDate(data.dt),
    temperature:        data.main.temp,
    humidity:           data.main.humidity,
    weather:            data.weather[0].main
}; */

//connection parameters
const conn_par = {
    port: 5000,
    resourcePath: "/UA/IndustrialInformaticsServer",
    buildInfo: {
        productName: "OPCUAProjectServer",
        buildNumber: "1",
        buildDate: new Date()
    }
};

//OPCUAserver instance creation
let server = new opcua.OPCUAServer(conn_par);

//address space creation
let build_my_address_space = (server) => {
    const addressSpace = server.engine.addressSpace;
    const namespace = addressSpace.getOwnNamespace();

    //new object declaration
    const device = namespace.addObject({
        organizedBy: addressSpace.rootFolder.objects,
        browseName: "MyObjectDevice",
    });

    namespace.addVariable({
        propertyOf: device,
        browseName: "temperature",
        dataType: "Double",
        value: {
            get: () => {
                return new opcua.Variant({ 
                    dataType: opcua.DataType.Double, 
                    value: data_weather.temperature,
                });
            }
        }
    });

    namespace.addVariable({
        propertyOf: device,
        browseName: "humidity",
        dataType: "Double",
        value: {
            get: () => {
                return new opcua.Variant({ 
                    dataType: opcua.DataType.Double, 
                    value: data_weather.humidity,
                });
            }
        }
    });

    namespace.addVariable({
        propertyOf: device,
        browseName: "weather",
        dataType: "String",
        value: {
            get: () => {
                return new opcua.Variant({ 
                    dataType: opcua.DataType.String, 
                    value: data_weather.weather,
                });
            }
        }
    });
}

//server initilaization
server.initialize(() => {
    console.log(`OPCUA server start init--`);

    build_my_address_space(server);
    console.log("Address space initialized. Starting server...");

    //server start
    server.start(() => {
        console.log(`Server started.
        listening to port: 
            ${server.endpoints[0].port}
        pimary server endpoint url is:
            ${server.endpoints[0].endpointDescriptions()[0].endpointUrl}
        Press Ctrl+C to stop server`);
    });
});