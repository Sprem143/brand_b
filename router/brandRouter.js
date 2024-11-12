const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const { fetchbrand, getproduct, } = require('../controller/brandController')
const { downloadfinalSheet, downloadExcel, uploaddata, sendproductsurl } = require('../controller/database')
router.post('/fetchbrand', fetchbrand);
router.get('/scrapproduct', getproduct);
router.get('/download-excel', downloadExcel);
router.get('/downloadfinalSheet', downloadfinalSheet);
router.get('/getproducturl', sendproductsurl);
router.post('/upload', upload.single('file'), uploaddata);


module.exports = router;