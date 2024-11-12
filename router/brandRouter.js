const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const { fetchbrand, downloadfinalSheet, getproduct, downloadExcel, uploaddata } = require('../controller/brandController')

router.post('/fetchbrand', fetchbrand);
router.get('/scrapproduct', getproduct);
router.get('/download-excel', downloadExcel);
router.get('/downloadfinalSheet', downloadfinalSheet);
router.post('/upload', upload.single('file'), uploaddata);


module.exports = router;