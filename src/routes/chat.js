const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const data = {title: 'RTConn'};
  res.render('chat', data);

});
module.exports = router;
