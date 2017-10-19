var oracledb = require('oracledb');
var bodyParser = require('body-parser');
var logger = require('../../../_util/logger');
var config = require('../../../_config/config');

var auth = config.arcfm;

var tableName = 'ACE.STATIONINFO';
var dbName = 'ArcFM';

function updateRegions(region) {

    var count = 0;
    var oldCount = 0;
    var codes = [];
    var queryString = `
                    SELECT LOCATIONCODE 
                    FROM ${tableName}
                    WHERE REGION = '${region}'
                    `;

    oracledb.outFormat = oracledb.OBJECT;

    oracledb.getConnection(auth, function (err, connection) {
        if (err) throw err;
        logger.log(`Oracle Connection --> successfully connected to ${dbName}`);


        var stream = connection.queryStream(queryString);

      
      /* TODO: implememt appropriate db connection */

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

        function addData(items) {
            logger.log(`${items.length} codes for ${region} region.`);
            items.forEach(function (item) {

                var code = item.LOCATIONCODE;
                logger.log(`code: ${code}`);

                var regionModel = voltq.model('region', regionSchema);

                regionModel.create({
                    stationCode: code,
                    region: region
                }, function (err, data) {
                    if (err) {
                        logger.log(`ERROR --> ${err}`);
                    } else {
//                        logger.log(`${data} added to collection`);
                    }
                });
            });
        }
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
