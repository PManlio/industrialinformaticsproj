const MongoClient = require('../../node_modules/mongodb').MongoClient;
const mutils = require('./db.js');
const client = new MongoClient(mutils.uri, { useNewUrlParser: true, useUnifiedTopology: true });

var query = { username: "test_user" }
var user = require('../schema/user.js');

client.connect((err, db) => {
    if(err) throw err;
    let database = db.db(mutils.dbn);
    let collection = database.collection('user');
    
    collection.find(query).toArray((err, res) => {
        if(err) throw err;
        res_data = JSON.stringify(res[0]);
        parsed_data = JSON.parse(res_data);
        user = parsed_data;
        console.log(`user object found:
            _id: ${user._id}
            name: ${user.username}
            pass: ${user.password}`);
        db.close();
    });
});