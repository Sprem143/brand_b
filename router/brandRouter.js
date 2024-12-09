const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const { autofetchdata } = require('../controller/Inventory_controller/inventory');
const { fetchbrand, getproduct, } = require('../controller/brandController');
const {deletebackup ,getupdatedproduct, settime, sendproductsurl, getinvlinks, getinvproduct } = require('../controller/database_controller/database');
const { downloadInvSheet,downloadfinalSheet, uploadinvdata,uploadinvdata2, downloadExcel, uploaddata} = require('../controller/database_controller/db_upload_download')

router.post('/fetchbrand', fetchbrand);
router.get('/scrapproduct', getproduct);
router.get('/download-excel', downloadExcel);
router.get('/download-inventory', downloadInvSheet);
router.get('/downloadfinalSheet', downloadfinalSheet);
router.get('/getproducturl', sendproductsurl);
router.get('/getinvurl', getinvlinks);
router.get('/getinvproduct', getinvproduct);
router.post('/upload', upload.single('file'), uploaddata);
router.post('/uploadinvfile', upload.single('file'), uploadinvdata);
router.post('/uploadinvfile2', upload.single('file'), uploadinvdata2);
router.post('/autofetchdata', autofetchdata);
router.post('/settime', settime);
router.get('/getupdatedproduct', getupdatedproduct);
router.delete('/deletebackup', deletebackup)
module.exports = router;