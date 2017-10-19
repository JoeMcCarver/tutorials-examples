var config = require('../_config/config');
var logger = require('../_util/logger');
var http = require('http');
var express = require('express');
var reload = require('reload');
var morgan = require('morgan');
var app = express();
var io = require('socket.io')();
var fs = require('fs');
var $ = require('jquery');

var Promise = require('promise');

var request = require('request');

const port = config.port1;
const dbPort = config.port2;

var DB = require('../database/database.app.module');

app.set('port', port);
app.set('view engine', 'ejs');
app.set('views', 'app/views');


app.locals.siteTitle = 'AMI Query';
app.locals.appName = 'Voltage Query';

app.use(morgan('dev'));
app.use(express.static('app/public'));
app.use(require('./routes/index'));
app.use('/voltQ', DB.appDB);

var server = app.listen(app.get('port'), () => {
    logger.log(`VoltQ listening on http://localhost:${port}`);
});

io.attach(server);
io.attach(DB.server);

io.on('connect', (socket) => {

    logger.log('Socket.io --> New Connection');

    socket.on('seasonalDataQ', (collection) => {

        var options = {
            baseUrl: `http://localhost:${dbPort}/db/query/seasonal/`,
            uri: `?seasonData=${collection}`,
            json: true
        };

        request(options, (err, res, body) => {

            res.on('connect', () => {
                logger.log(`Making Request...`);
            });

            var count = 0;
            var len = body.length;

            body.forEach((data) => {
                socket.emit('newpoint', data);
                count++;
                if (count === len) {
                    socket.emit('points-done');
                }
            });

        });

    });

    socket.on('qeuryResultsReceived', (data) => {
        data.forEach((item) => {
            socket.emit('newpoint', item);
        });
    });


    socket.on('ami-query', (data) => {
        logger.log('App --> AMI Query');

        var region = data.region,
            min = data.min,
            max = data.max,
            start = data.start,
            end = data.end;

        var options = {
            baseUrl: `http://localhost:${dbPort}/db/query/ami`,
            uri: `?region=${region}&min=${min}&max=${max}&start=${start}&end=${end}`,
            json: true
        };

        request(options, (err, res, body) => {

            res.on('connect', () => {
                logger.log(`Making Request...`);
            });

            var count = 0;
            var len = body.length;

            body.forEach((data) => {
                socket.emit('newpoint', data);
                count++;
                if (count === len) {
                    socket.emit('points-done');
                }
            });

        });


    });

    socket.on('ami-query-incomplete', (data) => {

        logger.log('App --> AMI Query Oops');

    });

    socket.on('getCollections', () => {

    });

    socket.on('disconnect', () => {
        logger.log('Socket.io --> disconnect');

        //		var options = {
        //			hostname: "localhost",
        //			port: 8080,
        //			path: `/db/query/cleandb`,
        //		};
        //
        //		http.get(options, function (res) {
        //			var body = res.body;
        //		});

    });

});

reload(server, app);
