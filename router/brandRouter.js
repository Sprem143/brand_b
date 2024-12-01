const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const { autofetchdata } = require('../controller/Inventory_controller/inventory');
const {geterrorurl}= require('../controller/database_controller/db_get')
const { fetchbrand, getproduct, } = require('../controller/brandController');
const {deletebackup ,getupdatedproduct,seterrorindex, setindex, settime, setindex2, setindex3, setindex4, setindex5, setindex6, setindex7, setindex8, getserialnumber, sendproductsurl, getinvlinks, getinvproduct } = require('../controller/database_controller/database');
const { downloadInvSheet,downloadfinalSheet, uploadinvdata, downloadExcel, uploaddata} = require('../controller/database_controller/db_upload_download')

router.post('/fetchbrand', fetchbrand);
router.get('/scrapproduct', getproduct);
router.get('/download-excel', downloadExcel);
router.get('/download-inventory', downloadInvSheet);
router.get('/downloadfinalSheet', downloadfinalSheet);
router.get('/getproducturl', sendproductsurl);
router.get('/getinvurl', getinvlinks);
router.get('/geterrorurl', geterrorurl);

router.get('/getinvproduct', getinvproduct);
router.post('/upload', upload.single('file'), uploaddata);
router.post('/uploadinvfile', upload.single('file'), uploadinvdata);
router.post('/autofetchdata', autofetchdata);
router.post('/setindex', setindex);
router.post('/setindex2', setindex2);
router.post('/setindex3', setindex3);
router.post('/setindex4', setindex4);
router.post('/setindex5', setindex5);
router.post('/setindex6', setindex6);
router.post('/setindex7', setindex7);
router.post('/seterrorindex', seterrorindex);
router.post('/setindex8', setindex8);
router.post('/settime', settime);
router.get('/getserialnumber', getserialnumber);
router.get('/getupdatedproduct', getupdatedproduct);
router.delete('/deletebackup', deletebackup)
module.exports = router;