var config = require('../../_config/config');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var err = require('./err');

// setup global middleware
module.exports = function(app) {
    
    app.set('port', config.port2);
    app.set('view engine', 'ejs');
    app.set('views', 'appDB/api/index/views');

    app.use(morgan('dev'));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    // setup global error handling
    // always the last thing to push on the stack
    app.use(err());
};    
    
