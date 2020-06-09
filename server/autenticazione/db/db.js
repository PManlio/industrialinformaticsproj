let hostname = 'cluster-industrialinformatics-txsew.mongodb.net';
let usrname = 'manlio';
let password = 'passw0rd'
let dbname = 'industrialInformatics';

module.exports = {
    uri: `mongodb+srv://${usrname}:${password}@${hostname}/${dbname}?retryWrites=true&w=majority`
}
