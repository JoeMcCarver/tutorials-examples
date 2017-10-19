const logger = require('../../../../_util/logger');
var AMI = require('../shared/connections/ami/ami-connection.service');
const config = require('../../../../_config/config');

const volt = config.volt;

const tableName = volt.vFacts;

const Query = {
  new: (args, conn) => {
    /* TODO: implememt dynamic query */
    var region = args[0],
      min = args[1],
      max = args[2],
      start = args[3],
      end = args[4];

    var queryString = `
          SELECT * 
          FROM ${tableName}
          WHERE
          VOLTS_A > ${min}
          AND
          VOLTS_A < ${max}
          AND 
          READTIME > TO_DATE('${start}')
          AND 
          READTIME < TO_DATE('${end}')`;

    logger.log(`region: ${region}, min: ${min}, max: ${max}, start: ${start}, end: ${end}`);

    return AMI.initateQuery(queryString, conn);
  }
};

connect = () => {
  return AMI.newConnection();
};

module.exports = Query;

function test() {

  logger.log(`AMI --> ${AMI}`);

  var connection = connect()
    .then((conn) => {
      logger.log(`Dynamically Connected! --> conn: ${conn}`);
      var items = ['all', 60, 117, '05-JUL-17', '08-JUL-17'];

      Query.new(items, conn)
        .then((results) => {
          logger.log(`results --> ${JSON.stringify(results)}`);
          return results;
        });
    });

}

test();
