// sutup config first
var config = require('./_config/config');
/* logger is a wrapper around console.log that adds color
 * logs objects as json and can be conditionally turned off
 * so every call to it doesn't have to be commented out or erased
 */
var logger = require('./_util/logger');

require('./app/app');
