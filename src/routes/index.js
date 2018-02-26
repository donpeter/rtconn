const express = require('express');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {

  const data = {title: 'RTConn', description: 'A real time system'};
  res.render('index', data);
});

router.get('/test', (req, res) => {
  res.json({foo: 'foo'});
});
module.exports = router;
