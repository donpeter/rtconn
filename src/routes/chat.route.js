const express = require('express');
const controller = require('../controller/chat.controller');
const router = express.Router();

// router.get('/', controller.index);
router.get('/:room', controller.index);

router.post('/', controller.index);
module.exports = router;
