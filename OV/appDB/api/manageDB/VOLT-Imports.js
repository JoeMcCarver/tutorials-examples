var oracledb = require('oracledb');
var bodyParser = require('body-parser');
var logger = require('../../../_util/logger');
var config = require('../../../_config/config');

var dbname = `test`;

var y = 0,
    s = 0;

var auth = config.volt;

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

var tableName = 'VOLT.VOLTAGE_FACT';
var dbName = 'VOLT';

function getSeasonalData(season, year, voltGT, voltLT) {

    var name, start, end;
    name = season.name;
    start = `${season.date.start}-${year}`;
    if (name === 'winter') {
        end = `${season.date.end}-${year + 1}`;
    } else {
        end = `${season.date.end}-${year}`;
    }

    var myDB = mongoose.connect(`mongodb://localhost/${dbname}`, function (err, connection) {
        if (err) {
            logger.log(`${dbname} connection --> ERROR: ${err.message}`);
        } else {
            logger.log(`${dbname} DB connection --> success!`);
        }
    });

    var queryModel = myDB.model(`query_${year}_${name}_below${voltLT}`, querySchema);
    var meterModel = myDB.model('meter', meterSchema);

    var dbConnection;
    var count = 0;
    var oldCount = 0;
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

    oracledb.getConnection(auth, function (err, connection) {
        if (err) throw err;
        dbConnection = connection;
        logger.log(`Oracle Connection --> successfully connected to ${dbName}`);


        var stream = dbConnection.queryStream(queryString);

        stream.on('metadata', function (metadata) {
            logger.log("Query --> metadata");
            logger.log('meta: ', metadata);
        });

        stream.on('data', function (data) {
            var _spId = data.SERVICEPOINT,
                _readObj = {
                    readDate: data.READTIME,
                    voltsA: data.VOLTS_A,
                    voltsB: data.VOLTS_B,
                    voltsC: data.VOLTS_C
                };
            queryModel.findOne({
                'spId': `${_spId}`
            }, function (err, item) {
                if (err) {
                    logger.log(`Find ERROR --> ${err.message}`);
                } else if (item === null) {
                    newData(data, _readObj);
                } else {
                    var storedReads = item.reads;
                    storedReads.push(_readObj);
                    item.update({
                        $set: {
                            reads: storedReads
                        }
                    });
                }
            });




        });

        stream.on('end', function () {
            logger.log("Query --> result returned");
            dbConnection.release(
                function (err, result) {
                    if (err) {
                        logger.log(`${dbName} Close Connection --> ERROR`);
                        logger.log(err.message);
                        return;
                    } else {
                        logger.log(`${dbName} Close Connection --> Success`);
                        logger.log(`Seasonal query ${y}, ${s} --> completed`);
                        process.exit(0);
                    }
                }
            )
        });

        function newData(data, read) {
            var _spId = data.SERVICEPOINT,
                _merterNumber = data.METERNUMBER,
                _readTime = data.READTIME,
                _district = data.DISTRICT,
                _bus = data.BUS,
                _phase = data.PHASE,
                _type = data.TYPE;

            meterModel.findOne({
                'spId': `${_spId}`
            }, function (err, meter) {
                if (err) {
                    logger.log(`Find ERROR --> ${err.message}`);
                } else if (meter === null) {
                    // logger.log(`Could not find meter --> spId: ${spId}`);
                } else {
                    // logger.log(`Found Meter --> meter ${meter}`);

                    var _lat = meter.lat,
                        _long = meter.long,
                        _region = meter.region,
                        _county = meter.county,
                        _station = meter.station,
                        _feederId = meter.feederId;

                    queryModel.create({
                        spId: _spId,
                        merterNumber: _merterNumber,
                        readTime: _readTime,
                        district: _district,
                        bus: _bus,
                        station: _station,
                        feederId: _feederId,
                        phase: _phase,
                        type: _type,
                        region: _region,
                        county: _county,
                        lat: _lat,
                        long: _long,
                        reads: [read]
                    }, function (err, data) {
                        if (err) {
                            logger.log(`ERROR --> ${err}`);
                        } else {
                            count++;
                        }
                    });
                    if (count > oldCount && count % 1000 === 0) {
                        oldCount = count;
                        logger.log(`${count} data entries added to collection`);
                    }
                }
            });
        }
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

init(16, 3, 114);
