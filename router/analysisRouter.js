const express = require('express');
const router = express.Router();

const { getdata, getrowdata,getbackup } = require('../controller/database_controller/db_get');

router.get('/getdata', getdata)
router.get('/getrowdata', getrowdata)
router.get('/getbackup', getbackup)


module.exports = router;