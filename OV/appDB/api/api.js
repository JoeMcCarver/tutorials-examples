var logger = require('../../_util/logger');
var router = require('express').Router();

router.use('/', require('./index/indexRoutes'));
router.use('/meters', require('./meters/metersRoutes'));
router.use('/ami', require('./ami/amiRoutes'));
router.use('/manageDB', require('./manageDB/manageDBRoutes'));
router.use('/db', require('./DB/DBRoutes'));

module.exports = router;