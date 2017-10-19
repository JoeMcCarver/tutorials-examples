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

function getData(region, voltGT, voltLT, start, end) {

    Query.results = [];

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

        var voltq = mongoose.connect('mongodb://localhost/queryLog', function (err, connection) {
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

        function addData(data) {
            var spId = data.SERVICEPOINT;

            var meterModel = voltq.model('meter', meterSchema);

            meterModel.findOne({
                'spId': `${spId}`
            }, function (err, meter) {
                if (err) {
                    logger.log(`Find ERROR --> ${err.message}`);
                } else if (meter === null) {
                    // logger.log(`Could not find meter --> spId: ${spId}`);
                } else {
                    // logger.log(`Found Meter --> meter ${meter}`);

                    var amiModel = voltq.model(`tempQuery_${start}_${end}_${voltLT}volts`, amiSchema);

                    Query.results.push(amiModel.create({
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
                            meter: meter._id
                        }, function (err, data) {
                            if (err) {
                                logger.log(`ERROR --> ${err}`);
                            } else {
                                // logger.log(`${data} added to collection`);
                                count++;
                            }
                        })

                    );
                }
            });
        }
    })
}

function convertDate(date) {
    var month, day, year;

    month = date.substr(0,2);    
    day = date.substr(3,2);
    year = date.substr(8,2);

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

Query.new = function (region, min, max, start, end) {

    logger.log(`region: ${region}, min: ${min}, max: ${max}, start: ${start}, end: ${end}`);


    var sDate = convertDate(start);
    var eDate = convertDate(end);

    var getRegion = '';

    return getData(region, min, max, sDate, eDate);

}

module.exports = Query;
