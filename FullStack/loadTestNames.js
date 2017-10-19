import {
  MongoClient
} from 'mongodb';
import assert from 'assert';
import config from './config';

MongoClient.connect(config.mongodbUri, (err, db) => {
  assert.equal(null, err);

  db.collection('names').insertMany([
    {
      id: 101,
      name: 'Mind Assembly',
      timestamp: new Date()
    },
    {
      id: 102,
      name: 'Brain Scaffold',
      timestamp: new Date()
    },
    {
      id: 103,
      name: 'Cash View',
      timestamp: new Date()
    },
    {
      id: 104,
      name: 'Currency Map',
      timestamp: new Date()
    },
    {
      id: 105,
      name: 'Cash Board',
      timestamp: new Date()
    },
    {
      id: 106,
      name: 'RootLib',
      timestamp: new Date()
    },
  ]).then(response => {
    console.info('Names', response.insertedCount);
    db.close();
  });
});
