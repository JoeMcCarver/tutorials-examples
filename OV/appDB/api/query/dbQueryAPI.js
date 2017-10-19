var config = require('../../../_config/config');
var logger = require('../../../_util/logger');

var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

var co = require('co');
var Promise = require('promise');

var amiQuery = require('./amiQueryV2');
var seasonalQuery = require('./seasonalQuery');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
    extended: true
}));

router.use('/cleandb', require('./queryClean'));

router.get('/ami/?', (req, res) => {
    logger.log(`DB query request: ${JSON.stringify(req.query)}`);

    co(function* () {
        var query = req.query;

        var region = query.region,
            min = query.min,
            max = query.max,
            start = query.start,
            end = query.end;

        var dbResults = yield amiQuery.new(region, min, max, start, end);

        if (!dbResults) {
            logger.log(`Query Returned --> ${dbResults}`);
            res.send(dbResults);
        }

        if (meters) {
            logger.log(`Query Returned --> ${dbResults}`);
            res.send(dbResults);
        }

    });

});

router.get('/seasonal/?', (req, res) => {

    var query = `${req.query.seasonData}`;

    var queryObjects = [];

    function getData(collectionName) {

        logger.log(`Router --> Seasonal Request Received: ${collectionName}`);

        return new Promise((resolve, reject) => {
            MongoClient.connect(url, (err, db) => {
                if (err) {
                    logger.log(`DB Connection ERROR --> ${err}`);
                    return reject(err);
                } else {
                    logger.log(`DB Connection Success`);
                    var collection = db.collection(collectionName);
                    collection.count((err, count) => {
                        logger.log(`Collection --> ${count}`);
                    });

                    collection.find().toArray((err, results) => {
                        if (err) {
                            logger.log(`Collection Find ERROR --> ${err}`);
                            return reject(err);
                        } else if (results.length) {
                            results.forEach((data) => {
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


/*

var meters = function (spId) {
	var elem;
	meterSchema.find({
		spId: `${spId}`
	}, function (err, doc) {
		if (err) {
			next(err);
		}
		elem = doc;
	});
	return elem;
};

/*
 * ------ EXAMPLE -------
 * update a single field
 */

/*

Model.findOne({
	name: 'borne'
}, function (err, doc) {
	doc.name = 'jason borne';
	doc.visits.$inc();
	doc.save();
});

*/

/*
 * ------ EXAMPLE -------
 * 		'join-ish'
 */

/*

var SomeSchema = new mongoose.Schema({
	related: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'other'
	},
	property1: String
});

var OtherSchema = new mongoose.Schema({
	property1: String,
	property2: String,
	property3: String
});

var Some = mongoose.model('some', SomeSchema);
var Other = mongoose.model('other', OtherSchema);

var promise = Some.find({})
	.populate('other', 'proerty2')
	.exec();

promise.then(function (somes) {

}, function (err) {

});
*/

module.exports = router;
