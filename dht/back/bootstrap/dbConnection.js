const Mongoose = require('mongoose');
require("dotenv").config()
const { MONGO_HOST, MONGO_PORT, MONGO_DB, MONGO_USERNAME, MONGO_PASSWORD} = process.env;
//mongodb://username:password@host:port/database?options...
const URL = `mongodb://${MONGO_HOST || '127.0.0.1'}:${MONGO_PORT || '27017'}/${MONGO_DB}`;


Mongoose.connect(URL, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
const db = Mongoose.connection;
db.on('error', (err) => { console.log(err); });
module.exports = db;
