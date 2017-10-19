var config = require('../../../_config/config');
var oracledb = require('oracledb');
var bodyParser = require('body-parser');
var logger = require('../../../_util/logger');

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
    var sql = "SELECT * FROM (SELECT A.*, ROWNUM AS MY_RNUM FROM" +
        "(" + queryString + ") A " +
        "WHERE ROWNUM <= :maxnumrows + :offset) WHERE MY_RNUM > :offset";

    oracledb.outFormat = oracledb.OBJECT;

    oracledb.getConnection(auth, function (err, connection) {
        if (err) throw err;
        dbConnection = connection;
        logger.log(`Oracle Connection --> successfully connected to ${dbName}`);

        dbConnection.execute(
            sql, {
                offset: 1,
                maxnumrows: 1
            }, {
                maxRows: 1
            },
            function (err, results) {
                logger.log(`Executed: ${queryString}`);
                logger.log(`Number of rows returned: ${results.rows.length}`);
                logger.log(`Query Result --> ${results.rows}`);
                results.rows.forEach(function (result) {
                    addData(result);
                });
                dbConnection.release(function (err, then) {
                    if (err) {
                        logger.log(`OracleDB ${dbName} close connection --> ERROR: ${err.message}`);
                    } else {
                        logger.log(`OracleDB ${dbName} close connection --> success!`);
                    }
                });
            });
    });

/* TODO: implememt appropriate db connection */
  
    function addData(data) {

        var spId = data.SERVICEPOINT;

        logger.log(`spId: ${spId}`);

        var meterModel = voltq.model('meter', meterSchema);

        var meterID;

        meterModel.findOne({
            'spId': `${spId}`
        }, function (err, meter) {
            if (err) {
                logger.log(`Find ERROR --> ${err.message}`);
            }
            logger.log(`Meter: ${meter}`);
            var amiModel = voltq.model(`ami_${year}_${name}_below${voltLT}`, amiSchema);

            amiModel.create({
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
                    logger.log(`${data} added to collection`);
                    count++;
                }
            });
            if (count > 0 && count % 1000 === 0) {
                logger.log(`${count} data entries added to collection`);
            }
        });

    }
}

getSeasonalData(seasons[3], 13, 60, 117);
