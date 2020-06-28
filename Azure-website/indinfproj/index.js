const express = require('express');
const opcua = require("node-opcua");
const { coerceMessageSecurityMode } = require("node-opcua");
var path = require('path');
// var endpointport = require('./secure_server').port;


const app = express();
app.use(express.urlencoded());
app.set('view engine', 'ejs');

// express server start
let expressPort = process.env.PORT || 5050;
app.listen(expressPort, () => {
    console.log(`express part is now running on port ${expressPort}`);
})

// landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});



// OPC UA CLIENT
let cities = ['Catania', 'Messina', 'Palermo'];
let c_variables = ['Temperature', 'Pressure', 'Humidity', 'Weather'];

// let dataArray = [];

// localhost:
// const endpointUrl = "opc.tcp://manlio-XPS-15-9570:5000/UA/IndustrialInformaticsServer";
const endpointUrl = "opc.tcp://localhost:5000/UA/IndustrialInformaticsServer";
const securityMode = coerceMessageSecurityMode(1);

const connectionOption = {
    securityMode,
    endpoint_must_exist: false,
    keepSessionAlive: true,
}

let client = opcua.OPCUAClient.create(connectionOption);
client.connect(endpointUrl);

app.post('/', (req, res) => {

    let userIdentity = {
        userName: req.body.username,
        password: req.body.password
    };

    //res.sendFile(path.join(__dirname + '/client.html'));
    console.log(`input form contained: ${req.body.username} and ${req.body.password}`);



    client.createSession(userIdentity, async (err, session) => {
        if (err) {
            console.error(err);
            return res.sendFile(path.join(__dirname + '/index.html'));
        }

        let dataArray = [];

        session.browse("RootFolder", async (err, browseResult) => {
            if (!err) {
                console.log("Browsing rootfolder: ");
                for (let reference of browseResult.references) {
                    console.log(reference.browseName.toString(), reference.nodeId.toString());
                }

                cities.forEach(async (city, c_index) => {

                    let dataObject = {
                        city: String,
                        temp: String,
                        pres: String,
                        humi: String,
                        weat: String,
                    };

                    dataObject.city = city;

                    c_variables.forEach(async (variable, v_index) => {
                        session.readVariableValue(`ns=1;s=${city}-${variable}`, async (err, dataValue) => {
                            if (err) {
                                callback(err);
                            }


                            switch (variable) {
                                case 'Temperature':
                                    dataObject.temp = dataValue.value.value.toString();
                                    break;

                                case 'Pressure':
                                    dataObject.pres = dataValue.value.value.toString();
                                    break;

                                case 'Humidity':
                                    dataObject.humi = dataValue.value.value.toString();
                                    break;

                                case 'Weather':
                                    dataObject.weat = dataValue.value.value.toString();
                                    break;
                            }



                            // accede a value -> accedi a variant -> accedi a value
                            console.log(`${city} ${variable}: `, dataValue.value.value.toString());
                            //let value = await dataValue.value.value.toString();

                            if (parseInt(v_index) == 3) {
                                try {
                                    let jsonDataRow = JSON.stringify(dataObject);

                                    dataArray.push(dataObject);

                                    if (v_index == 3 && c_index == 2) {
                                        let jsonResponse = JSON.stringify(dataArray);
                                        console.log("jsonResponse: "+jsonResponse);
                                        // res.sendFile(path.join(__dirname + '/client.html'));
                                        res.render('client.ejs', {jsonRes: dataArray});
                                    }
                                    
                                    console.log(`DOPO CICLO: ${jsonDataRow}`)
                                } catch (error) {
                                    console.log(error);
                                }
                            }

                        });
                    });
                });
            }
        });
    });

});
