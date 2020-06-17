const opcua = require("node-opcua");

async function getEndpoints(endpointUrl) {

    let client = new opcua.OPCUAClient();
    await client.connect(endpointUrl);
    const endpoints =  await client.getEndpoints();

    const reducedEndpoints = endpoints.map(endpoint => ({ 
        endpointUrl: endpoint.endpointUrl, 
        securityMode: endpoint.securityMode.toString(), 
        securityPolicy: endpoint.securityPolicyUri.toString(),
    }));
    await client.disconnect();
    return reducedEndpoints;
}

async function main() {
  const endpoints = await getEndpoints("opc.tcp://LAPTOP-R8KA8A3K:5000/UA/IndustrialInformaticsServer");
    console.log(endpoints);
}
main().then();