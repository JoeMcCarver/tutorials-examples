var oracledb = require('oracledb');
var fs = require('fs');
var volt = 'VOLT.VOLTAGE_FACT';
var fileName = '../../app/data/AMISummer16resultsV2.dat';

//oracledb.outFormat = oracledb.OBJECT;

oracledb.getConnection({
		user: "jjm0966",
		password: "Summ3rtim3",
		connectString: "volt"
	},
	function (err, connection) {
		if (err) {
			console.log("Connect --> ERROR");
			console.log(err.message);
			return;
		}
		console.log('Connection was successful!');
		var results = [];
		var fileStream = fs.createWriteStream(fileName);
		var stream = connection.queryStream(
			`SELECT DISTINCT
			SERVICEPOINT
			VOLTS_A
			FROM ${volt}
			WHERE VOLTS_A > 60
			AND VOLTS_A < 117
			AND READTIME > TO_DATE('01-JUN-16')
			AND READTIME < TO_DATE('01-SEP-16')
			ORDER BY SERVICEPOINT
			`);

		stream.on('error', function (err) {
			console.log("Query --> ERROR");
			console.log(err.message);
		});

		stream.on('metadata', function (metadata) {
			console.log("Query --> metadata");
			console.log(metadata);
		});

		stream.on('data', function (data) {
			results.push(data);
			fileStream.write(data.toString());
			fileStream.write('\n');
		});

		stream.on('end', function () {
			console.log("Query --> result returned");
			fileStream.write(`\n`, function () {
				fileStream.close(function (err) {
					if (err) {
						console.log('Filestream close --> ERROR');
						console.log(err.message);
						return;
					} else {
						console.log('Filestream close --> Success');
					}
				});
			})
			connection.release(
				function (err, result) {
					if (err) {
						console.log('Oracle DB Close Connection --> ERROR');
						console.log(err.message);
						return;
					} else {
						console.log('Oracle DB Close Connection --> Success');
					}
				}
			);
		});
	});
