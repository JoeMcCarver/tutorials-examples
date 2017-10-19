var router = require('express').Router();
var logger = require('../../../_util/logger');

router.use('/query', require('../query/dbQueryAPI'));

module.exports = router;
