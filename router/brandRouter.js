const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const { autofetchdata, autofetchdata2 } = require('../controller/inventory');
const { fetchbrand, getproduct, } = require('../controller/brandController');
const { setindex, setindex2, setindex3, setindex4, getserialnumber, downloadInvSheet, downloadfinalSheet, downloadExcel, uploaddata, sendproductsurl, uploadinvdata, getinvlinks, getinvproduct } = require('../controller/database');
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
router.post('/autofetchdata', autofetchdata);
// router.post('/autofetchdata2', autofetchdata2);
router.post('/setindex', setindex);
router.post('/setindex2', setindex2);
router.post('/setindex3', setindex3);
router.post('/setindex4', setindex4);
router.get('/getserialnumber', getserialnumber);

module.exports = router;