const mongoose = require('../../node_modules/mongoose');
const mongourl = require('./db.js');

mongoose.connect(mongourl.url, {useNewUrlParser: true});

