const express = require('express');
const router = express.Router();

const { autofetchdata2 } = require('../controller/Inventory_controller/inventory2');
const { autofetchdata3 } = require('../controller/Inventory_controller/inventory3');
const { autofetchdata4 } = require('../controller/Inventory_controller/inventory4');
const { autofetchdata5 } = require('../controller/Inventory_controller/inventory5');
const { autofetchdata6 } = require('../controller/Inventory_controller/inventory6');
const { autofetchdata7 } = require('../controller/Inventory_controller/inventory7');
const { autofetchdata8 } = require('../controller/Inventory_controller/inventory8');
const {checkremainingdata,changeprice,removeoutofstock,saveorder,savemasterdata} = require('../controller/database_controller/database')
const {getonebackup,getoutofstock,mastersheet}= require('../controller/database_controller/db_get')


router.post('/autofetchdata2', autofetchdata2);
router.post('/autofetchdata3', autofetchdata3);
router.post('/autofetchdata4', autofetchdata4);
router.post('/autofetchdata5', autofetchdata5);
router.post('/autofetchdata6', autofetchdata6);
router.post('/autofetchdata7', autofetchdata7);
router.post('/autofetchdata8', autofetchdata8);
router.get('/checkremainingdata',checkremainingdata)
router.post('/changeprice',changeprice)
router.get('/removeoutofstock',removeoutofstock)
router.post('/getonebackup',getonebackup);
router.get('/getoutofstock',getoutofstock)
router.post('/saveorder',saveorder);
router.get('/savemasterdata',savemasterdata);
router.get('/mastersheet',mastersheet)

module.exports = router;
