var oracledb = require('oracledb');
var bodyParser = require('body-parser');
var logger = require('../../../_util/logger');
var config = require('../../../_config/config');
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;

var voltq = 'mongodb://localhost:27017/voltq';
var sDB = 'mongodb://localhost:27017/seasonalData';
var volt = config.volt;
var dbname = 'seasonalData';

var y = 0,
  s = 0;

var seasons = [
  {
    "name": "spring",
    "date": {
      "start": "01-MAR",
      "end": "01-JUN"
    }
    },
  {
    "name": "summer",
    "date": {
      "start": "01-JUN",
      "end": "01-SEP"
    }
    },
  {
    "name": "fall",
    "date": {
      "start": "01-SEP",
      "end": "01-NOV"
    }
    },
  {
    "name": "winter",
    "date": {
      "start": "01-NOV",
      "end": "01-MAR"
    }
    }
];

var tableName = volt.vFact;
var dbName = volt.name;

function getSeasonalData(season, year, voltGT, voltLT) {

  var queryResults = [];

  var voltdb, meters;

  var name, start, end;

  name = season.name;

  start = `${season.date.start}-${year}`;

  if (name === 'winter') {
    end = `${season.date.end}-${year + 1}`;
  } else {
    end = `${season.date.end}-${year}`;
  }

  var dataSetName = `data${year}_${s}${name}LT${voltLT}`;

  function init() {
    /* TODO: no and THEN */
    voltdb = yield MongoClient.connect(voltq);
    logger.log(`Connected successfully to voltq DB`);
    meters = voltdb.collection('meters');
    if (!meters) {
      logger.log(`meters collection --> ${meters}`);
      return reject(true);
    }

    if (meters) {
      logger.log(`meters collection --> ${meters}`);
      return resolve(true);
    }

  });

});
}

init()
  .then(function (resolve, reject) {
    if (resolve) {
      logger.log(`**her**\n are you in yet?\n**hacker voice**\n we're in...`);
    } else {
      logger.log(`**her**\n are you in yet?\n**hacker voice**\n thatswhatshesaid();`);
    }

    function getMeter(_spId) {
      return new Promise(function (resolve, reject) {
        meters.findOne({
          spId: _spId
        }, function (err, meter) {
          if (err || !meter) {
            return reject(meter);
          }
          return resolve(meter);
        });
      });
    }

    function addData(data) {
      return new Promise(function (resolve, reject) {
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
              queryResults.push(queryObject);
            });
          return resolve(queryObject);
        }

        if (queryResults.length < 1) {
          newQueryObj(_spId);
        } else {
          var object = queryResults.filter(function (obj) {
            return obj.spId === _spId;
          });
          if (object[0].length < 1) {
            newQueryObj(_spId);
          } else {
            queryObject = object[0];
            queryObject.reads.push(_readObj);
            return resolve(queryObject);
          }
        }
      });
    }

    function writeData() {
      var resultsCount = queryResults.length;
      return new Promise(function (resolve, reject) {
        if (resultsCount > 0) {
          logger.log(`Getting ready to write ${resultsCount} objects to ${dataSetName}`);

          co(function* () {

              var db = yield MongoClient.connect(sDB);
              logger.log(`Connected successfully to seasonalData DB`);

              db.createCollection(`${dataSetName}`);

              var dataSet = db.collection(`${dataSetName}`);

              var bulk = dataSet.initializeUnorderedBulkOp();

              queryResults.forEach(function (meter) {
                bulk.insert(meter);
              });

              var result = yield bulk.execute();

              logger.log(`Inserted ${toString(result)} of ${count} total hits into ${dataSetName} collection`);

              db.close(function () {
                voltdb.close(function () {
                  logger.log(`voltq DB connection closed`);
                  return resolve(true);
                });
                logger.log(`seasonalData DB write request complete`);
              });
            })
            .catch(function (err) {
              logger.log(`writeData ERROR --> ${err.message}`);
            });
        } else {
          logger.log(`Nothing to write --> No Matches Found`);
          return resolve(true);
        }
      });
    }

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

    oracledb.getConnection(volt.auth, function (err, connection) {
      if (err) throw err;
      logger.log(`Oracle Connection --> successfully connected to ${volt.name}`);

      var stream = connection.queryStream(queryString);

      stream.on('metadata', function (metadata) {
        logger.log("Query --> metadata");
      });

      stream.on('data', function (data) {
        addData(data)
          .then(function (queryObject) {
            count++;
            var dataCount = queryResults.length;
            if (dataCount > 0 && dataCount % 1000 === 0) {
              logger.log(`${dataCount} Results so far`);
            }
          });

      });

      stream.on('end', function () {
        logger.log("Query --> result returned");
        voltdb.close();
        writeData()
          .then(function () {
            connection.release(function (err, result) {
              if (err) {
                logger.log(`${dbName} Close Connection --> ERROR`);
                logger.log(err.message);
              } else {
                logger.log(`${dbName} Close Connection --> Success`);
                logger.log(`Seasonal query ${y}, ${s} --> completed`);
                process.exit(0);
              }
            });
          });
      });

    });
  });
}

/* 
 *   <<args>> 
 * 
 * --REQUIRED--
 * First - Year
 * Second - Season
 * 
 * --OPTIONAL--
 * ----VOLT----
 * Third - MAX: query lt MAX
 * Third & Fourth - MIN & MAX: query gt MIN and lt MAX
 * 
 * seasons: 
 * 0 - spring   (mar, apr, may)
 * 1 - summer   (jun, jul, aug)
 * 2 - fall     (sep, oct)
 * 3 - winter   (nov, dec, jan, feb)
 * 
 */
function init(year, season, ...volt) {
  y = year;
  s = season;

  var low = 60;
  var high = 117;

  var getSeason = seasons[season];

  switch (volt.length) {
    case 0:
      break;
    case 1:
      high = volt[0] > low ? volt[0] : high;
      break;
    case 2:
      low = (volt[0] > 0 && volt[0] < volt[1]) ? volt[0] : volt[1];
      high = (volt[1] > low) ? volt[1] : high;
      break;
  }

  getSeasonalData(getSeason, year, low, high)

}

init(17, 1, 114);
