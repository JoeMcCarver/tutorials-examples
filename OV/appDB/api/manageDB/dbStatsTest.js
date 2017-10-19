var logger = require('../../../_util/logger');
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient,
  Server = mongodb.Server,
  ReplSetServers = mongodb.ReplSetServers,
  ObjectID = mongodb.ObjectID,
  Binary = mongodb.Binary,
  GridStore = mongodb.GridStore,
  Grid = mongodb.Grid,
  Code = mongodb.Code,
  assert = require('assert');

var collectionBag = [];

MongoClient.connect('mongodb://localhost:27017/voltq', {
  native_parser: true
}, function (err, db) {
  if (err) {
    logger.log(`VoltQ DB connection --> ERROR: ${err.message}`);
  } else {
    logger.log(`VoltQ DB connection --> success!`);
    logger.log(`Connection --> ${db.databaseName}`);
  }

  //    function showInfo(array1, array2) {
  //        for (var i = 0; i < array1.length; i++) {
  //            logger.log(`Collection name: ${array1[i]}`);
  //            logger.log(`Contains ${array2[i]} entries`);
  //        }
  //    }

  //    db.collections(function (err, collections) {
  //        var collectionNames = [];
  //        var collectionCounts = [];
  //
  //        collections.forEach(function (collection) {
  //            var name = collection.collectionName;
  //            logger.log(`Collection Name: ${name}`);
  //            collectionNames.push(name);
  //            db.collection(name, function (err, collection) {
  //                if (err) {
  //                    // logger.log(`Counting ERROR --> ${err.message}`);
  //                }
  //                var count = collection.count();
  //                logger.log(`Contains ${count} entries`);
  //                collectionCounts.push(count);
  //            });
  //        });
  //        showInfo(collectionNames, collectionCounts);
  //    });

  db.collections(function (err, collection) {
    if (err) {
      //            console.log(`Collections ERROR --> ${err.message}`);
    }
    collection.forEach(function (collection) {
      var name = collection.collectionName;
      console.log(`Collection: ${name}`);
      //            collection.count(function(err, collec){
      //                if (err) {
      //                    console.log(`Counting ERROR --> ${err.message}`);
      //                }
      //                console.log(collec);
      //            });
      console.log(collection.findOne({}));
      //            collection.findOne().count(function(err, collec){
      //                if (err) {
      //                    console.log(`Counting ERROR --> ${err.message}`);
      //                }
      //                console.log(collec);
      //            });
    });

  });

  db.close();
});
