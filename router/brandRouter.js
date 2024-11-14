const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const { autofetchdata } = require('../controller/inventory');
const { fetchbrand, getproduct, } = require('../controller/brandController');
const { setindex, getserialnumber, downloadInvSheet, downloadfinalSheet, downloadExcel, uploaddata, sendproductsurl, uploadinvdata, getinvlinks, getinvproduct } = require('../controller/database');
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
router.post('/setindex', setindex);
router.get('/getserialnumber', getserialnumber);

module.exports = router;