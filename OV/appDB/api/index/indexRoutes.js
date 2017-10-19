var router = require('express').Router();
var logger = require('../../../_util/logger');

router.route('/')
    .get(function (req, res) {
        logger.log('DB api --> New Connection');
        res.render('index', {
            pageTitle: 'VoltQ DB',
            padeID: 'db'
        });
    });

module.exports = router;
