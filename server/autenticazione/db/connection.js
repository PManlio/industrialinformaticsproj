const MongoClient = require('../../node_modules/mongodb').MongoClient;
const mongouri = require('./db.js');

const client = new MongoClient(mongouri, { useNewUrlParser: true });
client.connect(err => {
  const collection = client.db("industrialInformatics").collection("user");
  // perform actions on the collection object
  
  client.close();
});

