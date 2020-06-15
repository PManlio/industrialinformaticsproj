let req = require('../autenticazione/db/connection.js');
let usr = require('../autenticazione/schema/user.js');

(async () => {
    usr = await req.findUser();
    console.log(usr);
})();