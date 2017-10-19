var config = require('../../_config/config');
var logger = require('../../_util/logger');

var router = require('express').Router();
var socket = require('socket.io')();
var fs = require('fs');

var fileName = 'app/data/results.json';
var fileStream = fs.createReadStream(fileName);

router.use(fileStream);

socket.on('connect', function () {

	console.log('Results --> connected');

	socket.on('results', function (dir) {
		console.log('Results --> Parsing results');
		fileStream.on('data', function (chunk) {
			console.log('Chunk --> ' + JSON.parse(chunk));
			socket.emit('newpoint', chunk);
		});
	});
});

module.exports = router;
