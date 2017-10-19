var logger = require('../../../_util/logger');
var config = require('../../../_config/config');
var oracledb = require('oracledb');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;

var voltq = 'mongodb://localhost:27017/voltq';
var qDB = 'mongodb://localhost:27017/querylog';
var volt = config.volt;
var dbname = 'querylog';

var tableName = volt.vFacts;
var dbName = volt.name;

var Query = {};

var dateRef = {};

function getData(region, voltGT, voltLT, start, end) {

  Query.dataSetName = `temp_query_${dateRef.year}${dateRef.month}_LT${voltLT}_${config.dateTime()}`;

  logger.log(`dataSetName --> ${Query.dataSetName}`);

  var voltdb, meters;

  var name, start, end;

  Query.results = [];

  var dbConnection;
  var count = 0;
  var queryString = `
                    SELECT *
                    FROM ${tableName}
                    WHERE
                    VOLTS_A > ${voltGT}
                    AND
                    VOLTS_A < ${voltLT}
                    AND
                    READTIME > TO_DATE('${start}')
                    AND
                    READTIME < TO_DATE('${end}')
                    UNION SELECT *
                    FROM ${tableName}
                    WHERE
                    VOLTS_B > ${voltGT}
                    AND
                    VOLTS_B < ${voltLT}
                    AND
                    READTIME > TO_DATE('${start}')
                    AND
                    READTIME < TO_DATE('${end}')
                    UNION SELECT *
                    FROM ${tableName}
                    WHERE
                    VOLTS_C > ${voltGT}
                    AND
                    VOLTS_C < ${voltLT}
                    AND
                    READTIME > TO_DATE('${start}')
                    AND
                    READTIME < TO_DATE('${end}')
                    `;

  oracledb.outFormat = oracledb.OBJECT;

  function init() {
    voltdb = MongoClient.connect(voltq);
    logger.log(`Connected successfully to voltq DB`);
    meters = voltdb.collection('meters');
    if (!meters) {
      logger.log(`meters collection --> ${meters}`);
    }

    if (meters) {
      logger.log(`meters collection --> ${meters}`);
    }
  }

  init();

  function getMeter(_spId) {
    /* TODO: implememt this thing to do a thing to another thing */
  }

  function addData(data) {
    var _spId = data.SERVICEPOINT,
      _readObj = {
        readDate: data.READTIME,
        voltsA: data.VOLTS_A,
        voltsB: data.VOLTS_B,
        voltsC: data.VOLTS_C
      };

    var meterObject = {},
      queryObject = {};

    function newQueryObj(SPID) {
      getMeter(SPID)
        .then(function (meter) {
          queryObject = {
            spId: data.SERVICEPOINT,
            district: data.DISTRICT,
            bus: data.BUS,
            station: meter.station,
            feederId: meter.feederId,
            region: meter.region,
            phase: data.PHASE,
            type: data.TYPE,
            lat: meter.lat,
            long: meter.long,
            reads: []
          };
          queryObject.reads.push(_readObj);
          Query.results.push(queryObject);
        });
      return queryObject;
    }

    if (Query.results.length < 1) {
      newQueryObj(_spId);
    } else {
      var object = Query.results.filter(function (obj) {
        return obj.spId === _spId;
      });
      if (object[0].length < 1) {
        newQueryObj(_spId);
      } else {
        queryObject = object[0];
        queryObject.reads.push(_readObj);
        return queryObject;
      }
    }
  }

  function writeData() {
    var resultsCount = Query.results.length;
    if (resultsCount > 0) {
      logger.log(`Getting ready to write ${resultsCount} objects to ${Query.dataSetName}`);

      var db = MongoClient.connect(qDB);
      logger.log(`Connected successfully to ${dbname}`);

      db.createCollection(`${Query.dataSetName}`);

      var dataSet = db.collection(`${Query.dataSetName}`);

      var bulk = dataSet.initializeUnorderedBulkOp();

      Query.results.forEach(function (meter) {
        bulk.insert(meter);
      });

      var result = bulk.execute();

      logger.log(`Inserted ${toString(result)} of ${count} total hits into ${Query.dataSetName} collection`);

      db.close(function () {
          voltdb.close(function () {
            logger.log(`voltq DB connection closed`);
            return Query.dataSetName;
          });
          logger.log(`seasonalData DB write request complete`);
        })
        .catch(function (err) {
          logger.log(`writeData ERROR --> ${err.message}`);
        });
    } else {
      logger.log(`Nothing to write --> No Matches Found`);
      return Query.dataSetName;
    }

    oracledb.getConnection(volt.auth, function (err, connection) {
      if (err) throw err;
      dbConnection = connection;
      logger.log(`Oracle Connection --> successfully connected to ${dbName}`);

      var stream = dbConnection.queryStream(queryString);

      stream.on('metadata', function (metadata) {
        logger.log("Query --> metadata");
        logger.log('meta: ', metadata);
      });

      stream.on('data', function (data) {
        addData(data);
      });

      stream.on('end', function () {
        logger.log("Query --> result returned");
        voltdb.close();
        writeData();
        connection.release(function (err, result) {
          if (err) {
            logger.log(`${dbName} Close Connection --> ERROR`);
            logger.log(err.message);
          } else {
            logger.log(`${dbName} Close Connection --> Success`);
            logger.log(`temp query --> completed`);
            return Query.dataSetName;
          }
        });
      });
    });
  }
}

function convertDate(date) {
  var month, day, year;

  month = date.substr(0, 2);
  day = date.substr(3, 2);
  year = date.substr(8, 2);

  switch (month) {
    case '01':
      month = 'JAN';
      break;
    case '02':
      month = 'FEB';
      break;
    case '03':
      month = 'MAR';
      break;
    case '04':
      month = 'APR';
      break;
    case '05':
      month = 'MAY';
      break;
    case '06':
      month = 'JUN';
      break;
    case '07':
      month = 'JUL';
      break;
    case '08':
      month = 'AUG';
      break;
    case '09':
      month = 'SEP';
      break;
    case '10':
      month = 'OCT';
      break;
    case '11':
      month = 'NOV';
      break;
    case '12':
      month = 'DEC';
      break;
  }

  if (dateRef.day === undefined) {
    dateRef = {
      day: `${day}`,
      month: `${month}`,
      year: `${year}`
    };
  }

  return `${day}-${month}-${year}`;
}

Query.new = function (region, min, max, start, end) {

  logger.log(`region: ${region}, min: ${min}, max: ${max}, start: ${start}, end: ${end}`);

  var sDate = convertDate(start);
  var eDate = convertDate(end);

  var getRegion = '';

  return getData(region, min, max, sDate, eDate);

}

module.exports = Query;
