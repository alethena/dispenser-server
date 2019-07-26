import { Request, Response, NextFunction } from 'express';

var express = require('express');
var router = express.Router();

// const ipfilter = require('express-ipfilter').IpFilter;
// const ips = ['::ffff:162.158.150.122'];
// router.use(ipfilter(ips, { mode: 'allow' }))


/* GET home page. */
router.get('/', function(req: Request, res: Response, next: NextFunction) {
  res.render('index', { title: 'Alethena API' });
});

module.exports = router;
