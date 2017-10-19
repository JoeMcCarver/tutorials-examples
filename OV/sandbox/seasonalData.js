var config = require('../../_config/config');
var logger = require('../../_util/logger');

var express = require('express');
var router = express.Router();

var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;

var co = require('co');
var Promise = require('promise');

var url = 'mongodb://localhost:27017/seasonalData';
var dbname = 'seasonalData';

router.get('/seasonal/?', function (req, res) {

    var query = `${req.query.seasonData}`;

    var queryObjects = [];

    function getData(collectionName) {

        logger.log(`Router --> Seasonal Request Received: ${collectionName}`);

        return new Promise(function (resolve, reject) {
            MongoClient.connect(url, function (err, db) {
                if (err) {
                    logger.log(`DB Connection ERROR --> ${err}`);
                    return reject(err);
                } else {
                    logger.log(`DB Connection Success`);
                    var collection = db.collection(collectionName);
                    collection.count(function (err, count) {
                        logger.log(`Collection --> ${count}`);
                    });

                    collection.find().toArray(function (err, results) {
                        if (err) {
                            logger.log(`Collection Find ERROR --> ${err}`);
                            return reject(err);
                        } else if (results.length) {
                            results.forEach(function (data) {
                                queryObjects.push(data);
                            });
                            logger.log(`Query Complete --> ${queryObjects.length} results returned`);
                            db.close();
                            return resolve(queryObjects);
                        }
                    });
                }
            });
        });
    }

    var results = getData(query);

    results.then(() => {
        res.send(queryObjects);
        res.end();
    });

});

module.exports = router;
