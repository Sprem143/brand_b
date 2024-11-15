const express = require('express');
const router = express.Router();

const { autofetchdata2 } = require('../controller/inventory2');

router.post('/autofetchdata2', autofetchdata2);

module.exports = router;