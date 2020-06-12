const MongoClient = require('../../node_modules/mongodb').MongoClient;
const mutils = require('./db.js');
const client = new MongoClient(mutils.uri, { useNewUrlParser: true, useUnifiedTopology: true });

var query = { username: "test_user" }
var user = require('../schema/user.js');

module.exports = {
    findUser: async () => {
        const client = await MongoClient.connect(mutils.uri, { useNewUrlParser: true, useUnifiedTopology: true })
            .catch(err => console.log(err));

        if(!client) return;

        try {
            let database = client.db(mutils.dbn);
            let collection = database.collection('user');
            let res = await collection.find(query).toArray();

            let res_data = JSON.stringify(res[0]);
            let parsed_data = JSON.parse(res_data);
            
            user = {
                _id:        String(parsed_data._id),
                username:   parsed_data.username,
                password:   parsed_data.password
            };
        } 
        catch (err) {console.log(err)}
        finally {
            client.close();
            return user;
        }
    }
}
