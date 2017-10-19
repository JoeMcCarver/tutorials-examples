require('colors');
var _ = require('lodash');

var config = require('../_config/config');

var EventLogger = require('node-windows').EventLogger;

//var log = new EventLogger('VoltQ');
//var sysLog = new EventLogger({
//	source: 'VoltQ Event Log',
//	eventLog: 'SYSTEM'
//});

//log.info('System --> Info', 200, function () {
//	logger.log('System --> Info');
//});
//log.warn('System --> Warning!', 404, function () {
//	logger.log('System --> Warning!');
//});
//log.error('System --> ERROR!!', 500, function () {
//	logger.log('System --> ERROR!!');
//});

//sysLog.info('System --> Info');
//sysLog.warn('System --> Warning!');
//sysLog.error('System --> ERROR!!');

// create a no-op function for when logging is disabled
var noop = function () {};

/* check if loggin is enabled in the config
 * if it is, then use console.log
 * if not then noop
 */
var consoleLog = config.logging ? console.log.bind(console) : noop;
//var consoleLog = console.log.bind(console);

var logger = {
    log: function () {
        /* arguments is an array like object with all the passed
         * in arguments to this function
         */
        var args = _.toArray(arguments)
            .map(function (arg) {
                if (typeof arg === 'object') {
                    /* turn the object to a string so we
                     * can log all the properties and color it
                     */
                    var string = JSON.stringify(arg, 2);
                    return string.magenta;
                } else {
                    // coerce toString to color
                    arg += '';
                    return arg.magenta;
                }
            });

        /* call either console.log or noop here
         * with the console object as the context
         * and the new colored args
         */
        consoleLog.apply(console, args);
    }
};

module.exports = logger;
