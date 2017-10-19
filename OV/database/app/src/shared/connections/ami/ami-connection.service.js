const oracledb = require('oracledb');

const logger = require('../../../../../../_util/logger');
const config = require('../../../../../../_config/config');

const volt = config.volt;

const tableName = volt.vFacts;
const dbName = volt.name;

var AMI = {

  newConnection: () => {
    AMI.connection = oracledb.getConnection(volt.auth);
    return AMI.connection;
    logger.log(`Oracle Connection --> successfully connected to ${dbName}`);
  },
  initateQuery: (queryString, db) => {
    return db.execute(queryString);
  },

  next: () => {
    let stream = AMI.stream;
    if (!stream) {
      return null;
    }
    stream.resume();
    stream.on('metadata', function (metadata) {
      logger.log("Query --> metadata");
      logger.log('meta: ', metadata);
    });
    stream.on('data', (chunk) => {
      stream.pause();
      return chunk;
    });
    stream.on('end', function () {
      logger.log("Query --> stream closed");
      AMI.connection.close(function (err) {
        if (err) {
          logger.log(`${dbName} Close Connection --> ERROR`);
          logger.log(err.message);
        } else {
          logger.log(`${dbName} Close Connection --> Success`);
        }
      });
    });
  }

};

process.on('unhandledRejection', (reason, p) => {
  console.error("Unhandled Rejection at: ", p, " reason: ", reason);
  // application specific logging, throwing an error, or other logic here
});

module.exports = {
  newConnection: AMI.newConnection,
  initateQuery: AMI.initateQuery,
  next: AMI.next
};

function test() {
  logger.log(`AMI exporting --> ${JSON.stringify(module.exports)}`);
  
  AMI.newConnection().then((conn) => {
    logger.log(`Connection --> ${conn}`);
  });
  
};

test();
