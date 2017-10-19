// Installing a new service
var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
	name: 'VoltQ',
	description: 'VoltQ and DB web application.',
	script: 'C:\\VoltQ-Application\\node index.js',
	wait: 1,
	grow: .5,
	maxRestarts: 3,
	abortOnError: false
});

// Listen for the "uninstall" event so we know when it's done.
svc.on('uninstall',function(){
  console.log('Uninstall complete.');
  console.log('The service exists: ',svc.exists);
});

// Uninstall the service.
svc.uninstall();
