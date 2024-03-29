var config = require('./_config/config');
var forever = require('forever-monitor');

var child = new(forever.Monitor)('index.js', config.forever);

child.on('watch:restart', function(info) {
    console.error('Restaring script because ' + info.file + ' changed');
});

child.on('restart', function() {
    console.error('Forever restarting script for ' + child.times + ' time');
});

child.on('exit:code', function(code) {
    console.error('Forever detected script exited with code ' + code);
});

child.on('exit', function () {
    console.log('index.js has exited after 10 restarts');
});

child.start();
