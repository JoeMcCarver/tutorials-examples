var config = require('../../../_config/config');
var bodyParser = require('body-parser');
var logger = require('../../../_util/logger');
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;

var voltq = 'mongodb://localhost:27017/voltq';
var test = 'mongodb://localhost:27017/test';

var count = 0;

function main() {

  function getRegions() {
    /* TODO: no and THEN */

    var regionObjects = [];

    MongoClient.connect(voltq, function (err, db) {
      if (err) {
        logger.log(`Mongo DB ERROR --> ${err}`);
      }

      var regions = db.collection('regions');

      regions.find()
        .toArray(function (err, docs) {
          docs.forEach(function (doc) {
            regionObjects.push({
              code: doc.stationCode,
              region: doc.region
            });
          });
          db.close(function () {
            logger.log(`Fetched Regions`);
            return resolve(regionObjects);
          });
        });

    });

  });
}

function getMeters() {
  /* TODO: no and THEN */

  var meterObjects = [];

  MongoClient.connect(voltq, function (err, db) {
    if (err) {
      logger.log(`Mongo DB ERROR --> ${err}`);
    }

    var meters = db.collection('meters');

    meters.find()
      .toArray(function (err, docs) {
        docs.forEach(function (object) {
          var meterObject = {
            spId: object.spId,
            gisoNumber: object.gisoNumber,
            meterNumber: object.meterNumber,
            station: object.station,
            feederId: object.feederId,
            region: '',
            operatingVoltage: object.operatingVoltage,
            phaseDesignation: object.phaseDesignation,
            long: object.long,
            lat: object.lat,
            county: object.county
          };

          meterObjects.push(meterObject);

        });
        db.close(function () {
          logger.log(`Fetched ${meterObjects.length} meters`);
          return resolve(meterObjects);
        });
      });
  });
});
}

function addToDB(merged) {

  logger.log(`Getting ready to write ${merged.length} objects to test_meters`);

  /* TODO: no and THEN */

  var db = MongoClient.connect(test);
  logger.log(`Connected successfully to test DB`);

  db.createCollection('test_meters');

  var meters = db.collection('test_meters');

  var bulk = meters.initializeUnorderedBulkOp();

  merged.forEach(function (meter) {
    bulk.insert(meter);
  });

  var result = bulk.execute();

  logger.log(`Inserted ${result.insertedCount} into test_meters collection`);

  db.close(function () {
    logger.log(`DB write request complete`);
  });
})
.catch(function (err) {
  logger.log(`addToDB ERROR --> ${err.message}`);
});

}

function mergeResults(meters, regions) {
  logger.log(`Adding ${regions.length} code regions to ${meters.length} meters`);
  return new Promise(function (resolve, reject) {

    var meterCount = meters.length;

    function findRegion(meter) {
      return new Promise(function (resolve, reject) {
        var code = meter.station;
        var region = regions.filter(function (obj) {
          return obj.code === code;
        });
        if (region[0].length < 1) {
          var meterObject = {
            spId: meter.spId,
            gisoNumber: meter.gisoNumber,
            meterNumber: meter.meterNumber,
            station: meter.station,
            feederId: meter.feederId,
            region: 'UNKNOWN',
            operatingVoltage: meter.operatingVoltage,
            phaseDesignation: meter.phaseDesignation,
            long: meter.long,
            lat: meter.lat,
            county: meter.county
          };
          return resolve(meterObject);
        }
        var meterObject = {
          spId: meter.spId,
          gisoNumber: meter.gisoNumber,
          meterNumber: meter.meterNumber,
          station: meter.station,
          feederId: meter.feederId,
          region: region[0].region,
          operatingVoltage: meter.operatingVoltage,
          phaseDesignation: meter.phaseDesignation,
          long: meter.long,
          lat: meter.lat,
          county: meter.county
        };
        return resolve(meterObject);
      });
    }

    function mergeAll() {
      return new Promise(function (resolve, reject) {
        var mergedResults = [];

        meters.forEach(function (meter) {
          findRegion(meter)
            .then(function (newMeter) {
              mergedResults.push(newMeter);
              if (mergedResults.length % 100000 === 0) {
                logger.log(`${mergedResults.length} of ${meterCount} objects merged`);
              }
            });
          count++;
        });

        return resolve(mergedResults);
      });
    }

    mergeAll()
      .then(function (merged) {
        logger.log(`Merge Complete`);
        return resolve(merged);
      });
  });
}

function merge() {
  getRegions()
    .then(function (regions) {
      getMeters()
        .then(function (meters) {
          mergeResults(meters, regions)
            .then(function (mergedresults) {
              addToDB(mergedresults);
            });
        });
    })
    .catch(function (err) {
      logger.log(`ERROR --> ${err.message}`);
    });
}

merge();
}

main();
