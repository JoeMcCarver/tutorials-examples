var logger = require('../../_util/logger');

module.exports = function () {
    return function (err, req, res, next) {
        logger.log(`Error Thrown--> ${err.message}`);
        res.status(500);
    };
};
