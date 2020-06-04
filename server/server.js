const os = require("os");
const opcua = require("node-opcua");

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
    })

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