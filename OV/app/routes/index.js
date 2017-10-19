var config = require('../../_config/config');
var logger = require('../../_util/logger');

var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    logger.log('Index router --> New Connection');
	res.render('index', {
		pageTitle: 'Home',
		padeID: 'home'
	});
});

module.exports = router;
