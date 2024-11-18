const express = require('express');
const router = express.Router();

const { autofetchdata2 } = require('../controller/inventory2');
const { autofetchdata3 } = require('../controller/inventory3');
const { autofetchdata4 } = require('../controller/inventory4');
const { autofetchdata5 } = require('../controller/inventory5');
const { autofetchdata6 } = require('../controller/inventory6');
const { autofetchdata7 } = require('../controller/inventory7');
const { autofetchdata8 } = require('../controller/inventory8');

router.post('/autofetchdata2', autofetchdata2);
router.post('/autofetchdata3', autofetchdata3);
router.post('/autofetchdata4', autofetchdata4);
router.post('/autofetchdata5', autofetchdata5);
router.post('/autofetchdata6', autofetchdata6);
router.post('/autofetchdata7', autofetchdata7);
router.post('/autofetchdata8', autofetchdata8);

module.exports = router;