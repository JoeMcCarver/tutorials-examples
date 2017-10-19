var DB = {};
var config = require('../_config/config');
var logger = require('../_util/logger');
var express = require('express');
DB.appDB = express();
var port = config.port2;

var io = require('socket.io')();

// setup the api
DB.appDB.use('/', require('./api/api'));
DB.appDB.use(express.static('/api/index/views'));

DB.appDB.locals.siteTitle = 'VoltQ DB';
DB.appDB.locals.appName = 'DB API';

// setup the app middleware
require('./middleware/appMiddleWare')(DB.appDB);

DB.server = DB.appDB.listen(port, function () {
  logger.log(`VoltQ DB listening on http://localhost:${port}`);
});

io.on('connect', function (socket) {

  logger.log('DB socket --> New Connection');

  socket.on('ami-query', function (data) {
    logger.log('DB App --> AMI Query');
  });

  socket.on('disconnect', function () {
    logger.log('DB socket --> disconnect');
  });

});

// export the app for testing
module.exports = DB;
