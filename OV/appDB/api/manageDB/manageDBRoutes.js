var router = require('express').Router();
var logger = require('../../../_util/logger');

//router.use('/meter', require('./ArcFM-Imports'));
//router.use('/ami', require('./VOLT-Imports'));

router.route('/')
    .get(function (req, res) {
        logger.log('New Connection');
        res.send({
            ok: true
        });
    });

module.exports = router;
