var config = require('../../../_config/config');
var oracledb = require('oracledb');
oracledb.outFormat = oracledb.OBJECT;
oracledb.extendedMetaData = true;
var bodyParser = require('body-parser');
var logger = require('../../../_util/logger');

var arc = config.arcfm;
var volt = config.volt;

function updateMeters(tableName) {

  var count = 0;

  var queryString = `
                SELECT
                SERVICEPOINTID,
                GISONUMBER,
                METERNUMBER,
                FEEDERID,
                OPERATINGVOLTAGE,
                PHASEDESIGNATION,
                X_COORDINATE,
                Y_COORDINATE,
                COUNTY
                FROM ${tableName}
            `;

  oracledb.getConnection(arc.auth, function (err, dbConnection) {
      if (err) throw err;
      logger.log(`Oracle Connection --> successfully connected to ${arc.name}`);
      logger.log(`Oracle Connection --> successfully connected to ${JSON.stringify(dbConnection)}`);

      var stream = dbConnection.queryStream(queryString);

      function getRegion(code) {

        return new Promise(function (resolve, reject) {
          regionModel.findOne({
            stationCode: code
          }, function (err, reg) {
            if (err || !reg) return reject(err);
            return resolve(reg.region);
          });
        });
      }

      function getStationData(id) {
        /* TODO: no and THEN */

        var station = {};
        oracledb.getConnection(arc.auth, function (err, connection) {
          if (err) return reject(err);
          var qStr = `
                SELECT
                FACILITYCD
                FROM
                FROM ${arc.spA.toString().trim()}
                WHERE
                DEVICE_ID = ${id}
                UNION SELECT
                FACILITYCD
                FROM ${arc.spB.toString().trim()}
                WHERE
                DEVICE_ID = ${id}
              `;
          connection.execute(qStr, function (err, result) {
            if (result) {
              station.code = result.FACILITYCD.substr(0, 4);
              station.id = result.FACILITYCD.substr(4, 2);
              station.region = getRegion(station.code);
            } else {
              station.code = 'UNKN';
              station.id = 0;
              station.region = 'UNKN';
            }
          });
        });
        return resolve(station);
      });
  }

  function getFeederInfo(spId) {
    var _feeder, _station, _id, region;

    /* TODO: no and THEN */
    _feeder = getStationData(spId)
      .then(function () {
        _station = _feeder.code;
        _id = _feeder.id;
        region = _feeder.reg;

        var feederInfo = {
          code: _station,
          id: _id,
          reg: region
        }
        // logger.log(`Feeder Info --> code: ${_station}, id: ${_id}, region: ${region}`);

        return resolve(feederInfo);

      })
      .catch(console.error);

  });
}

function createMeterObject(meter) {
  var _spId = meter.SERVICEPOINTID,
    _gisoNumber = meter.GISONUMBER,
    _meterNumber = meter.METERNUMBER;
  if (_spId === null) {

  }
  var _feederId = meter.FEEDERID;
  var _code, _id;
  if (_feederId) {
    _code = _feederId.substr(0, 4);
    _id = _feederId.substr(4, 2);
  } else {
    _code = 'UNKN';
    _id = 0;
  }

  var _operatingVoltage = meter.OPERATINGVOLTAGE,
    _phaseDesignation = meter.PHASEDESIGNATION,
    _long = meter.X_COORDINATE,
    _lat = meter.Y_COORDINATE,
    _county = meter.COUNTY;
  if (!_spId || !_gisoNumber || !_meterNumber) {
    //                logger.log(`Missing Identifier --> sp: ${_spId}, meter: ${_meterNumber}`);
  }
  // logger.log(`_feederId --> ${_feederId}`);
  var meterObject = {
    spId: _spId,
    gisoNumber: _gisoNumber,
    meterNumber: _meterNumber,
    station: _code,
    feederId: _id,
    //                region: _feederId.reg,
    operatingVoltage: _operatingVoltage,
    phaseDesignation: _phaseDesignation,
    long: _long,
    lat: _lat,
    county: _county
  };
  return meterObject;
}

function addData(meter) {

  meterModel.create(meter, function (err, meter) {
    if (err) {
      // logger.log(`ERROR --> ${err}`);
    } else {
      count++;
      if (count % 10000 === 0) {
        logger.log(`${count} meters added to collection`);
      }
    }
  });
}

stream.on('metadata', function (metadata) {
  logger.log("Query --> metadata");
  logger.log('meta: ', metadata);
});

stream.on('data', function (data) {
  var meterObject = createMeterObject(data);
  addData(meterObject);
});

stream.on('end', function () {
logger.log("Query --> result returned");
voltq.close(function (err) {
  if (err) {
    logger.log('DB close connection --> ERROR: ' + err.message);
  } else {
    logger.log('DB close connection --> success!');
  }
});
dbConnection.release(
  function (err, result) {
    if (err) {
      logger.log(`${arc.name} Close Connection --> ERROR`);
      logger.log(err.message);
    } else {
      logger.log(`${arc.name} Close Connection --> Success`);
    }
  }
)
});

});
}

updateMeters(arc.sMeter);
