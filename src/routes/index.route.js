const express = require('express');
const chatController = require('../controller/chat.controller');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  const data = {title: 'RTConn', description: 'A Real-Time System'};
  res.render('index', data);
});


router.get('/:room', chatController.index);
module.exports = router;
