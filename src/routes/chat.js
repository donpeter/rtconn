const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const data = {
    title: 'RTConn',
    users: [
      {
        id: 'donpeter',
        username: 'donpeter',
      },{
        id: 'patunalu',
        username: 'patunalu',
      },{
        id: 'dubem',
        username: 'dubem',
      },{
        id: 'chidubem',
        username: 'chidubem',
      },
    ],
  };
  res.render('chat', data);
});

router.post('/', (req, res) => {
  const data = {title: 'RTConn'};
  res.render('chat', data);
});
module.exports = router;
