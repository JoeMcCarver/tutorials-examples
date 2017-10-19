var fs = require('fs');
var mongoose = require('mongoose');
var fileName = '../../app/data/BOMT41.dat';

var amiSchema = require('../api/ami/amiSchema');
var meterSchema = require('../api/meters/meterSchema');

var writeStream = fs.createWriteStream(fileName);
writeStream.write('[\n');

var voltq = mongoose.connect('mongodb://localhost/voltq', function (err, connection) {
    if (err) {
        console.log('VoltQ DB connection --> ERROR: ' + err.message);
    } else {
        console.log('VoltQ DB connection --> success!');
    }
});

var amiModel = voltq.model(`tempquery_bomt41`, amiSchema);

var cursor = amiModel.find({}).cursor();

cursor.on('data', function (meter) {
    writeStream.write(`${meter},\n`);
});

cursor.on('end', function () {
    writeStream.write('{end}\n]');
});
