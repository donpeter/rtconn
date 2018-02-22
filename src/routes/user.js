const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', (req, res) => {
  const users = [];
  users.push({foo: 'foo'});
  res.json(users);
});

module.exports = router;
