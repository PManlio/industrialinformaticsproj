const opcua = require("node-opcua");
const async = require("async");

const clientFromConnectionString = require('azure-iot-device-http').clientFromConnectionString;
const Message = require('azure-iot-device').Message;

let userIdentity = {
    userName: 'test_user',
    password: 'test'
};

let cities = ['Catania', 'Messina', 'Palermo'];
let c_variables = ['Temperature', 'Pressure', 'Humidity', 'Weather'];

const endpointUrl = "opc.tcp://LAPTOP-R8KA8A3K:5000/UA/IndustrialInformaticsServer";
const securityMode = opcua.coerceMessageSecurityMode(1);

const connectionOption = {
    securityMode,
    endpoint_must_exist: false,
    keepSessionAlive: true,
}

var client = opcua.OPCUAClient.create(connectionOption);
var the_session = null;

var connectionString = 'HostName=Iot-Hub-project.azure-devices.net;DeviceId=Server-OPCUA;SharedAccessKey=iJbpOufj9Il/qvfVW0LF0ogMGePKx0gJiT3GWiQGmPY='; //change
var aclient = clientFromConnectionString(connectionString);

var opc_items = new Array();
var items_idx = 0;
var monitored_items = new Array();
var newDP = null;

async.series([
    // step 1a : connect to OPC-UA server
    function (callback) {
        client.connect(endpointUrl, function (err) {
            if (err) {
                console.log("OPC-UA: cannot connect to endpoint:", endpointUrl);
            } else {
                console.log("OPC-UA: connected");
            }
            callback(err);
        });
    },
    // step 1b : connect to Azure IoT Hub
    function (callback) {
        aclient.open(function (err) {
            if (err) {
                console.log('IoT Hub: could not connect: ' + err);
            } else {
                console.log('IoT Hub: client connected');
            }
            callback(err);
        });
    },
    // step 2 : createSession
    function (callback) {
        client.createSession(userIdentity, function (err, session) {
            if (!err) {
                the_session = session;
            }
            callback(err);
        });
    },

    // step 3 : browse
    function (callback) {
        the_session.browse("RootFolder", function (err, browseResult) {
            if (!err) {
                console.log("Browsing rootfolder: ");
                for (let reference of browseResult.references) {
                    console.log(reference.browseName.toString(), reference.nodeId.toString());
                }
            }
            callback(err);
        });
    },

    // step 4a: create subscription
    function (callback) {
        the_subscription = new opcua.ClientSubscription(the_session, {
            requestedPublishingInterval: 1000,
            requestedLifetimeCount: 10,
            requestedMaxKeepAliveCount: 2,
            maxNotificationsPerPublish: 10,
            publishingEnabled: true,
            priority: 10
        });

        the_subscription.on("started", function () {
            console.log("subscription started - subscriptionId=", the_subscription.subscriptionId);
        }).on("keepalive", function () {
            console.log("keepalive");
        }).on("terminated", function () {
            console.log("terminated");
            callback();
        });
        setTimeout(function () {
            the_subscription.terminate();
            console.log("timeout");
        }, 3600000);

        //step 4b: install monitored item and send values
        items_idx = 0;

        cities.forEach(city => {
            c_variables.forEach(variable => {
                the_session.readVariableValue(`ns=1;s=${city}-${variable}`, function (err, dataValue) {
                    if (err) {
                        callback(err);
                    };
                    monitored_items[items_idx] = the_subscription.monitor({
                        nodeId: opcua.resolveNodeId(`ns=1;s=${city}-${variable}`),
                        attributeId: 13
                    },
                        {
                            samplingInterval: 100,
                            discardOldest: true,
                            queueSize: 10
                        });

                    monitored_items[items_idx].on("changed", function (dataValue) {
                        let jsonstrg = {
                            deviceId: "Server-OPCUA",
                            city: city,
                            variable: variable,
                            value: dataValue.value.value.toString()
                        }

                        var data = JSON.stringify(jsonstrg);
                        var message = new Message(data);
                        console.log(" sending message: " + message.getData());

                        aclient.sendEvent(message, function (err) {
                            if (err) {
                                console.error('send error: ' + err.toString());
                            } else {
                                console.log('message sent');
                            };
                        });
                    });
                });
                items_idx = items_idx + 1;
            });
        });
    },          // end of subscription

    function (callback) {
        // wait a little bit : 10 seconds
        setTimeout(() => callback(), 10 * 1000);
    },
    // terminate session
    function (callback) {
        the_subscription.terminate(callback);;
    },
    // close session
    function (callback) {
        the_session.close(function (err) {
            if (err) {
                console.log("closing session failed ?");
            }
            callback();
        });
    }

],
    function (err) {
        if (err) {
            console.log(" failure ", err);
        } else {
            console.log("done!");
        }
        client.disconnect(function () { });
    });
