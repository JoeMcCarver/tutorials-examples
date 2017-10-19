var oracledb = require('oracledb');
var bodyParser = require('body-parser');
var logger = require('../../../_util/logger');
var config = require('../../../_config/config');

var auth = config.volt;

var tableName = 'VOLT.VOLTAGE_FACT';
var dbName = 'VOLT';

var Query = {};

function getData(region, voltGT, voltLT, start, end) {

  /* TODO: db connection */

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
        AND
        SUBSTATION = 'BMOT'
        AND 
        FEEDERID = '41'
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
        AND
        SUBSTATION = 'BMOT'
        AND 
        FEEDERID = '41'
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
        AND
        SUBSTATION = 'BMOT'
        AND 
        FEEDERID = '41'
      `;

  oracledb.outFormat = oracledb.OBJECT;

  oracledb.getConnection(auth, function (err, connection) {
    if (err) throw err;
    logger.log(`Oracle Connection --> successfully connected to ${dbName}`);

    var stream = connection.queryStream(queryString);

    stream.on('metadata', function (metadata) {
      logger.log("Query --> metadata");
      logger.log('meta: ', metadata);
    });

    stream.on('data', function (data) {
      addData(data);
    });

    stream.on('end', function () {
      logger.log("Query --> result returned");
      dbConnection.release(
        function (err, result) {
          if (err) {
            logger.log(`${dbName} Close Connection --> ERROR`);
            logger.log(err.message);
          } else {
            logger.log(`${dbName} Close Connection --> Success`);
            return Query.results;
          }
        }
      )
    });

    function addData(dataVal) {
      var sp_Id = dataVal.SERVICEPOINT;
      var cursor = meterCollection.find({
          spId: `${sp_Id}`
        })
        .cursor();

      cursor.on('data', function (meter) {
        if (meter === null) {
          // logger.log(`Could not find meter --> spId: ${spId}`);
        } else {
          // logger.log(`Found Meter --> meter ${meter}`);

          var sp_Id = meter.spId;

          var readObj = {
            readDate: read_Date,
            voltsA: volt_A,
            voltsB: volt_B,
            voltsC: volt_C
          };

          dataCollection.find({
            spId: sp_Id
          }, function (err, result) {
            if (err) {
              logger.log(`dataCollection find ERROR --> ${err.message}`);
            } else if (result === null) {
              logger.log(`Add to data collection --> ${sp_Id}`);
              addToCollection(sp_Id, readObj);
              // logger.log(`Could not find meter --> spId: ${spId}`);
            } else {
              logger.log(`Result --> ${result}`);
              //                    result.reads.push(readObj);
              //                    result.save();
            }

            var readData = mongoose.model('readData', readDateSchema);

            function addToCollection(id, readObj) {
              meterCollection.find({
                spId: id
              }, function (err, meter) {
                if (err) {
                  logger.log(`dataCollection find ERROR --> ${err.message}`);
                } else if (meter === null) {
                  logger.log(`Could not find meter --> spId: ${id}`);
                } else {
                  dataCollection.create({
                    spId: id,
                    amiMeta: amiID,
                    coords: {
                      long: meter.long,
                      lat: meter.lat
                    },
                    reads: readObj
                  }, function (err, data) {
                    if (err) {
                      // logger.log(`ERROR --> ${err}`);
                    } else {
                      // logger.log(`${data} added to collection`);
                      count++;
                      logger.log(`${count} data entries added to collection`);
                    }
                  });
                }
              });
            }
          });

        }
      });

    }

    cursor.on('close', function () {
      logger.log(`Cursor --> closed`);
      process.exit(0);
    });

    function addData(data) {
      var spId = data.SERVICEPOINT;

      var meterModel = voltq.model('meter', meterSchema);

      meterModel.findOne({
        'spId': `${spId}`
      }, function (err, meter) {
        if (err) {
          logger.log(`Find ERROR --> ${err.message}`);
        } else if (meter === null) {
          logger.log(`Could not find meter --> spId: ${spId}`);
        } else {
          logger.log(`Found Meter --> meter ${meter}`);

          var queryModel = querylog.model(`tempQuery_BMOT41volts`, amiSchema);

          queryModel.create({
            spId: spId,
            merterNumber: data.METERNUMBER,
            readTime: data.READTIME,
            district: data.DISTRICT,
            bus: data.BUS,
            feederId: `${data.SUBSTATION}${data.FEEDID}`,
            phase: data.PHASE,
            type: data.TYPE,
            volts: {
              A: data.VOLTS_A,
              B: data.VOLTS_B,
              C: data.VOLTS_C
            },
            meter: meter._id,
            coords: {
              lat: meter.lat,
              long: meter.long
            }
          }, function (err, data) {
            if (err) {
              logger.log(`ERROR --> ${err}`);
            } else {
              logger.log(`${data} added to collection`);
            }

          });
        }
      })
    }
  });
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

  return `${day}-${month}-${year}`;
}

var newQuery = function (region, min, max, start, end) {

  logger.log(`region: ${region}, min: ${min}, max: ${max}, start: ${start}, end: ${end}`);

  var sDate = convertDate(start);
  var eDate = convertDate(end);

  var getRegion = '';

  return getData(region, min, max, sDate, eDate);

}

newQuery('BMOT41', 60, 114, '07/06/2017', '07/08/2017');
