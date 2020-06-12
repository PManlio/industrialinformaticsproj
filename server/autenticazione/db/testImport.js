let req = require('./connection.js');
let usr = require('../schema/user.js');

(async () => {
    usr = await req.findUser();
    console.log(usr);
})();