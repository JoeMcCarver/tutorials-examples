/* 
 * The user attribute is an object with three keys: 
 * domain, account, and password. 
 * This can be used to identify which user 
 * the service library should use to perform system commands.
 * 
 * By default, the domain is set to the local computer name, 
 * but it can be overridden with an Active Directory or LDAP domain 
 * For example:
 */

// svc.user.domain = 'mydomain.local';
// svc.user.account = 'username';
// svc.user.password = 'password';

/* 
 * Another attribute, sudo, has a single property: password. 
 * By supplying this, the service module will attempt to run 
 * commands using the user account that launched the process 
 * and the password for that account. 
 * This should only be used for accounts with administrative privileges.
 */

// svc.sudo.password = 'password';

var path = require('path');

// Installing a new service
var Service = require('node-windows').Service;
var EventLogger = require('node-windows').EventLogger;

var wincmd = require('node-windows');

var log = new EventLogger('VoltQ');
var sysLog = new EventLogger({
	source: 'VoltQ Event Log',
	eventLog: 'SYSTEM'
});

// Create a new service object
var svc = new Service({
	name: 'VoltQ',
	description: 'VoltQ and DB web application.',
	script: 'C:\\Users\\mccar\\Desktop\\VoltQ-application\\test\\VoltQ-Test\\index.js',
	env: [{
			// service is now able to access the user who created its' home directory
			name: "HOME",
			value: process.env["USERPROFILE"]
	},
		{
			// use a temp directory in user's home directory
			name: "TEMP",
			value: path.join(process.env["USERPROFILE"], "/temp")
	}],
	wait: 1,
	grow: .5,
	maxRestarts: 3,
	abortOnError: false
});

// Listen for the "install" event, which indicates the// process is available as a service.
svc.on('install', function () {
	svc.start();
});

svc.install();

// Uninstall a service
// Listen for the "uninstall" event so we know when it's done.
svc.on('uninstall', function () {
	console.log('Uninstall complete.');
	console.log('The service exists: ', svc.exists);
});

// Uninstall the service.
svc.uninstall();

log.info('Basic information.');
log.warn('Watch out!');
log.error('Something went wrong.');

log.info('Something different happened!', 1002, function () {
	console.log('Something different happened!');
});

sysLog.info('Basic information.');
sysLog.warn('Watch out!');
sysLog.error('Something went wrong.');

sysLog.info('Something different happened!', 1002, function () {
	console.log('Something different happened!');
});

wincmd.list(function (svc) {
	console.log(svc);
}, true);

svc.kill = function(procID){
	wincmd.kill(procID,function(){
	  console.log('Process Killed');
	});	
}