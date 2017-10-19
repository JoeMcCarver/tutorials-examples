var fs = require('fs');
var readline = require('readline');
var resultsFile = '../../app/data/AMISummer16results.dat';
var resultsLocFile = '../../app/data/AMISummer16resultsLoc.dat';
var meterFile = '../../app/data/meterDataPoints.dat';
var meterMin = 0;
var meters = [];
var voltData = [];
var combinedDat = [];

(function () {
	console.log('Add Location --> initializing');


	function loadMeters() {
		console.log('Load Meters --> Loading');
		var meterStream = fs.createReadStream(meterFile, 'utf8');

		meterStream.on('data', function (chunk) {
			meterStream.pause();
			var bits = chunk.toString().split('\n');

			function splitUp(func) {
				bits.forEach(function (bit) {
					meters.push(bit);
				});
				if (func) return func;
			}
			splitUp(meterStream.resume());
		});

		meterStream.on('end', function () {
			meterStream.close();
			meterMin = JSON.parse(meters[0]).SERVICEPOINTID;
			meterMax = JSON.parse(meters[meters.length - 2]).SERVICEPOINTID;
			console.log(`Meters count --> ${meters.length}`);
			loadData();
		});
	}

	function loadData() {
		console.log('Load Data --> Loading');
		var meterStream = fs.createReadStream(resultsFile, 'utf8');

		meterStream.on('data', function (chunk) {
			meterStream.pause();
			var bits = chunk.toString().split('\n');

			function splitUp(func) {
				bits.forEach(function (bit) {
					voltData.push(bit);
				});
				if (func) return func;
			}

			splitUp(meterStream.resume());

		});

		meterStream.on('end', function () {
			meterStream.close();
			console.log(`Data item count --> ${voltData.length}`);
			makeMatch();
		});
	}

	function makeMatch() {

		console.log('Make Match --> matching');

		var writeStream = fs.createWriteStream(resultsLocFile, 'utf8');
		var SPID = 0;
		var ID = 0;

		voltData.forEach(function (item) {
			var elem = undefined;
			try {
				elem = JSON.parse(item);
			} catch (err) {

			}
			if (elem !== undefined) {

				SPID = elem.SERVICEPOINT;
//				console.log(`SPID: ${SPID} >= Min: ${meterMin} --> ${SPID >= meterMin}`);

				if (SPID >= meterMin) {

					function getLoc() {
						meters.forEach(function (meter) {
							var retVal = undefined;
							try {
								retVal = JSON.parse(meter);
							} catch (err) {

							}
							if (retVal !== undefined) {
								ID = retVal.SERVICEPOINTID;
								if (ID > SPID) {
									return undefined;
								}
								if (ID === SPID) {
									var lat = retVal.X_COORDINATE;
									var long = retVal.Y_COORDINATE;
									elem.lat = lat;
									elem.long = long;
									var itemToWrite = JSON.stringify(elem);
									combinedDat.push(itemToWrite);
									writeStream.write(`${itemToWrite}\n`);
									console.log(`Items added --> ${combinedDat.length}`);
									return;
								}
							}
						});
					}
				}
				getLoc();
			}
		});
	};

	loadMeters();

})();

//	this.stream = process.stdout;
//
//	function onTick(msg) {
//		readline.clearLine(this.stream, 0);
//		readline.cursorTo(this.stream, 0);
//		this.stream.write(msg);
//	};
//
//	var current = 0;
//	var msg = ["\\", "|", "/", "-"];
//
//	this.setInterval(function () {
//		onTick(msg[current]);
//		current++;
//		if (current === 4) {
//			current = 0;
//		}
//	}, 60);
