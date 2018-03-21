const express = require('express');
const redisClient = require('../config/redis');
const db = require('../config/mongo');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  redisClient.incr('views');
  redisClient.getAsync('views')
    .then((views) => {
      const data = {title: 'RTConn', description: 'A Real-Time System', views};
      res.render('index', data);
    });

});

router.get('/test', (req, res) => {
  redisClient.set('views', 0);
  res.json({foo: 'foo'});
});
module.exports = router;
