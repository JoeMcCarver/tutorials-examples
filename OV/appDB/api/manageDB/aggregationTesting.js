var config = require('../../../_config/config');
var logger = require('../../../_util/logger');

var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var Server = mongodb.Server;

this.volt = MongoClient.connect('mongodb://localhost:27017/voltq', {
  native_parser: true
});

var readDateSchema = {
  readObj: {
    readDate: {
      type: Date,
      required: true
    },
    voltsA: {
      type: Number,
      required: false,
      min: 60
    },
    voltsB: {
      type: Number,
      required: false,
      min: 60
    },
    voltsC: {
      type: Number,
      required: false,
      min: 60
    }
  }
};

var queryObjSchema = {
  spId: {
    type: Number,
    required: true
  },
  amiMeta: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ami',
    required: true
  },
  coords: {
    long: {
      type: Number,
      required: true
    },
    lat: {
      type: Number,
      required: true
    }
  },
  reads: [readDateSchema]
};

this.get = 'ami_16_winter_below114';
this.set = 'data_00_testing';

module.export = this;
