const config = require('../../_config/config');
const logger = require('../../_util/logger');

const express = require('express');
const router = express.Router();
const assert = require('assert');

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const co = require('co');
const Promise = require('promise');

const url = 'mongodb://localhost:27017/querylog';
const dbname = 'querylog';

let mdb;

MongoClient.connect(url, (err, db) => {
  assert.equal(null, err);
  logger.log(`DB Connection Success`);
  mdb = db;
});

router.get('/amiData/?', (req, res) => {

  let query = `${req.query.seasonData}`;

  let queryObjects = [];

  let getData = (collectionName) => {

    logger.log(`Router --> Seasonal Request Received: ${collectionName}`);

    return new Promise((resolve, reject) => {
      let collection = mdb.collection(collectionName);
      collection.find().each((err, result) => {
        assert.equal(null, err);
        if (!result) {
          logger.log(`Query Complete --> ${queryObjects.length} results returned`);
          db.close();
          return resolve(queryObjects);          
        }
        queryObjects.push(result);
      });
    });
  };
  
  var results = getData(query);

  results.then(() => {
    res.send(queryObjects);
    res.end();

  });
});

module.exports = router;
