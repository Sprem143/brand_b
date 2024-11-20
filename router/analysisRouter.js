const express = require('express');
const router = express.Router();

const { getdata, getrowdata } = require('../controller/database_controller/db_get');

router.get('/getdata', getdata)
router.get('/getrowdata', getrowdata)


module.exports = router;