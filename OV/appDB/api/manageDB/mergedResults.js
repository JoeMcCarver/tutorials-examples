var config = require('../../../_config/config');
var logger = require('../../../_util/logger');

var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var Server = mongodb.Server;

var dbs = [
  {
    get: 'ami_16_fall_below114',
    set: 'data_00_test'
    },
  {
    get: 'ami_13_summer_below117',
    set: 'data_13_02_summer_below117'
    },
  {
    get: 'ami_13_winter_below117',
    set: 'data_13_04_winter_below117'
    },
  {
    get: 'ami_14_summer_below117',
    set: 'data_14_02_summer_below117'
    },
  {
    get: 'ami_15_summer_below117',
    set: 'data_15_02_summer_below117'
    },
  {
    get: 'ami_16_summer_below114',
    set: 'data_16_02_summer_below114'
    },
  {
    get: 'ami_16_summer_below117',
    set: 'data_16_02_summer_below117'
    },
  {
    get: 'ami_16_fall_below114',
    set: 'data_16_03_fall_below114'
    },
  {
    get: 'ami_16_fall_below117',
    set: 'data_16_03_fall_below117'
    },
  {
    get: 'ami_16_winter_below114',
    set: 'data_16_02_winter_below114'
    },
  {
    get: 'ami_16_winter_below117',
    set: 'data_16_02_winter_below117'
    },
  {
    get: 'ami_17_spring_below114',
    set: 'data_17_02_spring_below114'
    },
  {
    get: 'ami_17_spring_below117',
    set: 'data_17_02_spring_below117'
    }
];

var voltq = { /* TODO: db connection */ };

var seasonalData = { /* TODO: db connection */ };

function merge(num) {

  var get = dbs[num].get;
  var set = dbs[num].set;

  var cursor = amiCollection.find({})
    .cursor();

  var count = 0;

  cursor.on('data', function (amiData) {
    if (amiData === null) {
      // logger.log(`Could not find meter --> spId: ${spId}`);
    } else {
      // logger.log(`Found Meter --> meter ${meter}`);

      var sp_Id = amiData.spId;
      var amiID = amiData._id;

      var read_Date = amiData.readTime;
      var volt_A = amiData.volts.A;
      var volt_B = amiData.volts.B;
      var volt_C = amiData.volts.C;

      var readObj = {
        readDate: read_Date,
        voltsA: volt_A,
        voltsB: volt_B,
        voltsC: volt_C
      };

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

  cursor.on('close', function () {
    logger.log(`Cursor --> closed`);
    process.exit(0);
  });

}

merge(0);
