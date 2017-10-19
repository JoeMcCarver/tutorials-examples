// Installing a new service
var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
	name: 'VoltQ',
	description: 'VoltQ and DB web application.',
	script: 'C:\\VoltQ-Application\\npm start',
	wait: 1,
	grow: .5,
	maxRestarts: 3,
	abortOnError: false
});

// Listen for the "install" event, which indicates the// process is available as a service.
svc.on('install', function () {
	svc.start();
	console.log('Install complete.');
	console.log('VoltQ service exists: ', svc.exists);
});

svc.on('start',function(){
  console.log(`${svc.name} started! \nCheckout http://localhost:80 to see'`);
});

// Just in case this file is run twice.
svc.on('alreadyinstalled',function(){
  console.log('VoltQ is already installed.');
});

svc.install();
