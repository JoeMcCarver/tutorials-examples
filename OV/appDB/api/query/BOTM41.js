var oracledb = require('oracledb');
var bodyParser = require('body-parser');
var logger = require('../../../_util/logger');
var config = require('../../../_config/config');

var mongoose = require('mongoose');
var amiSchema = require('../ami/amiSchema');
var meterSchema = require('../meters/meterSchema');

var auth = config.volt;

var tableName = 'VOLT.VOLTAGE_FACT';
var dbName = 'VOLT';

var Query = {};

function getData(voltGT, voltLT, start, end) {

    logger.log(`min: ${voltGT}, max: ${voltLT}, start: ${start}, end: ${end}`);

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
                    SUBSTATION = 'BOMT'
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
                    SUBSTATION = 'BOMT'
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
                    SUBSTATION = 'BOMT'
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
            logger.log(`Query Data --> ${data}`);
            addData(data);
        });

        stream.on('end', function () {
            logger.log("Query --> result returned");
            connection.release(
                function (err, result) {
                    if (err) {
                        logger.log(`${dbName} Close Connection --> ERROR`);
                        logger.log(err.message);
                    } else {
                        logger.log(`${dbName} Close Connection --> Success`);
                    }
                }
            )
        });

        function addData(data) {
            var sp_Id = data.SERVICEPOINT,
                merter_Number = data.METERNUMBER,
                read_Time = data.READTIME,
                _district = data.DISTRICT,
                _bus = data.BUS,
                feeder_Id = `${data.SUBSTATION}${data.FEEDID}`,
                _phase = data.PHASE,
                _type = data.TYPE,
                _volts = {
                    A: data.VOLTS_A,
                    B: data.VOLTS_B,
                    C: data.VOLTS_C
                };

            var voltq = mongoose.connect('mongodb://localhost/voltq', function (err, connection) {
                if (err) {
                    logger.log('VoltQ DB connection --> ERROR: ' + err.message);
                } else {
                    logger.log('VoltQ DB connection --> success!');
                }
            });

            var meterModel = voltq.model('meter', meterSchema);

            var querylog = mongoose.connect('mongodb://localhost/querylog', function (err, connection) {
                if (err) {
                    logger.log('VoltQ DB connection --> ERROR: ' + err.message);
                } else {
                    logger.log('VoltQ DB connection --> success!');
                }
            });

            meterModel.findOne({
                'spId': `${sp_Id}`
            }, function (err, meter) {
                if (err) {
                    logger.log(`Find ERROR --> ${err.message}`);
                } else if (meter === null) {
                    logger.log(`Could not find meter --> spId: ${sp_Id}`);
                } else {
//                    logger.log(`Found Meter --> meter ${meter}`);

                    var meter_ID = meter._id,
                        _coords = {
                            lat: meter.lat,
                            long: meter.long
                        };
                    
                    logger.log(`Coords --> ${JSON.stringify(_coords)}`);


                    var amiModel = querylog.model(`tempQuery_BOMT41`, amiSchema);

                    amiModel.create({
                        spId: sp_Id,
                        merterNumber: merter_Number,
                        readTime: read_Time,
                        district: _district,
                        bus: _bus,
                        feederId: feeder_Id,
                        phase: _phase,
                        type: _type,
                        volts: _volts,
                        meter: meter_ID,
                        coords: _coords
                    }, function (err, data) {
                        if (err) {
                            logger.log(`ERROR --> ${err}`);
                        } else {
                            logger.log(`${data} added to collection`);
                        }
                    });
                }
            });

        }
    })
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

Query.new = function (min, max, start, end) {

    logger.log(`min: ${min}, max: ${max}, start: ${start}, end: ${end}`);


    var sDate = convertDate(start);
    var eDate = convertDate(end);

    return getData(min, max, sDate, eDate);

}

Query.new(0, 116, '07/06/2017', '07/08/2017');
