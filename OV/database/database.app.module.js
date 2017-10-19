const config = require('../_config/config');
const logger = require('../_util/logger');

var App = require('./app/database.app.module');

var DB = {
  app: App
};

module.exports = DB;
