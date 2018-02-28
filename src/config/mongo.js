const mongoose = require('mongoose');
const config = require('../config/config');
mongoose.connect(config.db);
const db = mongoose.connection;
db.on('error', () => {
  throw new Error('unable to connect to database at ' + config.db);
});

module.exports = db;
