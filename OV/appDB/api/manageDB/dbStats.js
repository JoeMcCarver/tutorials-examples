var logger = require('../../../_util/logger');
var MongoClient = require('mongodb').MongoClient;

/* TODO: implememt this thing to do a thing to another thing */

function (err, connection) {
    if (err) {
        logger.log(`VoltQ DB connection --> ERROR: ${err.message}`);
    } else {
        logger.log(`VoltQ DB connection --> success!`);
        logger.log(`Connection --> ${dbConnection}`);
    }

    var collections = dbConnection.db.collections();

    collections.then(function (db) {
        db.forEach(function (collection) {
            var name = collection.collectionName;
            logger.log(`DB collection name: ${name}`);
            var stats = dbConnection.db.collection(name).stats(function(err, data) {
                if (err) logger.log(`ERROR --> ${err.message}`);
                logger.log(`${name} stats: ${data}`);
            });
            dbConnection.db.collection(name).count({}, function (err, count) {
                if (err) logger.log(`ERROR --> ${err.message}`);
                logger.log(`${name} contains ${count} entries`);
            });
        });
    });

    dbConnection.close();
});
