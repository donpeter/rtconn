const express = require('express');
const router = express.Router();
const path = require('path');

router.get(/.*/, express.static(path.join(__dirname, '..', 'public')));
router.get(/.*/, express.static(path.join(__dirname, '..', 'node_modules')));

module.exports = router;
