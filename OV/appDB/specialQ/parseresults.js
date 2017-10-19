var fs = require('fs');

function parseResults() {
	console.log('Results --> Parsing results');

	let fileName = '../../app/data/results.dat';
	fs.readFile(fileName, function (err, data) {
		if (err) throw err;
		let array = data.toString().split('\n');
		array.forEach(function (item) {
			console.log('Item --> ' + JSON.stringify(item));
		});
	});
}

parseResults();
