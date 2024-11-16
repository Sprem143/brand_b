const express = require('express');
const router = express.Router();

const { autofetchdata2 } = require('../controller/inventory2');
const { autofetchdata3 } = require('../controller/inventory3');
const { autofetchdata4 } = require('../controller/inventory4');

router.post('/autofetchdata2', autofetchdata2);
router.post('/autofetchdata3', autofetchdata3);
router.post('/autofetchdata4', autofetchdata4);

module.exports = router;