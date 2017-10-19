var config = require('../../../_config/config');
var logger = require('../../../_util/logger');

var socket = io();
var fileName = 'app/data/results.json';

socket.on('connect', function () {
	
	logger.log('Results --> connected');
	
	socket.on('results', function (dir) {
		var fs = require(`${dir}/node_modules/fs`);
		logger.log('Results --> Parsing results');
		var fileStream = fs.createReadStream(fileName);
		fileStream.on('data', function (chunk) {
			logger.log('Chunk --> ' + JSON.parse(chunk));
			socket.emit('newpoint', chunk);
		});
	});
});
