var oracledb = require('oracledb');
var bodyParser = require('body-parser');
var logger = require('../../../_util/logger');
var config = require('../../../_config/config');
var volt = config.volt;

function getFeederMeters(FeederID) {

  /* TODO: db connection */
  
  var meterCollection = voltq.model('meter', meterSchema);

  var cursor = meterCollection.find({ feederID: BOMT41 })
    .cursor();

  var count = 0;

  cursor.on('data', function (meterData) {
    if (meterData === null) {
      // logger.log(`Could not find meter --> spId: ${spId}`);
    } else {
      // logger.log(`Found Meter --> meter ${meter}`);

      var sp_Id = meterData.spId;
      var meterID = meterData._id;

      addData(sp_Id);

      //            logger.log(`amiData --> read: ${read_Date}, volts: [ ${volt_A}, ${volt_B}, ${volt_C}]`);

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

  function addData(sp_Id) {
    oracledb.outFormat = oracledb.OBJECT;

    oracledb.getConnection(auth, function (err, connection) {
        if (err) throw err;
        logger.log(`Oracle Connection --> successfully connected to ${dbName}`);

        var stream = connection.queryStream(queryString);

        var voltq = mongoose.connect('mongodb://localhost/voltq', function (err, connection) {
          if (err) {
            logger.log('VoltQ DB connection --> ERROR: ' + err.message);
          } else {
            logger.log('VoltQ DB connection --> success!');
          }
        });

        stream.on('metadata', function (metadata) {
          logger.log("Query --> metadata");
          logger.log('meta: ', metadata);
        });

        stream.on('data', function (data) {
          //            logger.log(data);
          codes.push(data);
        });

        stream.on('end', function () {
          logger.log("Query --> result returned");
          connection.release(
            function (err, result) {
              if (err) {
                logger.log(`${dbName} Close Connection --> ERROR`);
                logger.log(err.message);
                return;
              } else {
                logger.log(`${dbName} Close Connection --> Success`);
                addData(codes);
              }
            }
          )
        });

      }

      cursor.on('close', function () {
        logger.log(`Cursor --> closed`);
        process.exit(0);
      });

    }

    /* 
     * Canyon
     * Capital
     * Eastern
     * Western
     * Southern
     */

    updateRegions('Southern');
