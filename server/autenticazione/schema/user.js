const mongoose = require('../../node_modules/mongoose');

let userSchema = {
    username: String,
    password: String,
};

module.exports = mongoose.model('User', userSchema);