var config = require('../../_config/config');
var logger = require('../../_util/logger');

var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var fs = require('fs');
var amiData = require('../data/queryResults.json');

router.get('/api', function (req, res) {
	res.json(amiData);
});

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
	extended: false
}));

router.post('/api', function (req, res) {
	amiData.unshift(req.body);
	fs.writeFile('app/data/queryResults.json', JSON.stringify(amiData), 'utf8', function (err) {
		if (err) {
			console.log(err);
		}
	});
	res.json(amiData);
});

router.delete('/api/:id', function (req, res) {
	amiData.splice(req.params.id, 1);
	fs.writeFile('app/data/queryResults.json', JSON.stringify(amiData), 'utf8', function (err) {
		if (err) {
			console.log(err);
		}
	});
	res.json(amiData);
});

module.exports = router;
