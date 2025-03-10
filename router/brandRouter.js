const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const { autofetchdata } = require('../controller/Inventory_controller/inventory');
const {downloadbackup} = require('../controller/database_controller/db_get')
const { fetchbrand, getproduct,deleteproduct,editsku,setchecked,removeexistingurl,editshippingcost} = require('../controller/BrandScrap/brandController');
const {deletebackup ,getupdatedproduct, sendproductsurl, getinvlinks, getinvproduct,totalproducts,cleardata,deletemanyproduct,setbulkshippingcost } = require('../controller/database_controller/database');
const { downloadInvSheet,downloadfinalSheet, uploadinvdata,uploadinvdata2, uploadinvdata3, downloadExcel, uploaddata,uploadforcheck,deletedata,downloadProductExcel} = require('../controller/database_controller/db_upload_download')
const {getproduct1}=require('../controller/BrandScrap/thread1')
const {getproduct2}=require('../controller/BrandScrap/thread2')
const {getproduct3}=require('../controller/BrandScrap/thread3')
const {getproduct4}=require('../controller/BrandScrap/thread4')
const {getproduct5}=require('../controller/BrandScrap/thread5')
const {getproduct6}=require('../controller/BrandScrap/thread6')
const {getproduct7}=require('../controller/BrandScrap/thread7')
const {getproduct8}=require('../controller/BrandScrap/thread8')

// router.post('/pratical', pratical)
router.post('/fetchbrand', fetchbrand);
router.get('/scrapproduct', getproduct);
router.get('/download-excel', downloadExcel);
router.get('/downloadProductExcel', downloadProductExcel);
router.get('/download-inventory', downloadInvSheet);
router.get('/downloadfinalSheet', downloadfinalSheet);
router.get('/getproducturl', sendproductsurl);
router.get('/getinvurl', getinvlinks);
router.get('/getinvproduct', getinvproduct);
router.get('/cleardata', cleardata);
router.post('/upload', upload.single('file'), uploaddata);
router.post('/uploadforcheck', upload.single('file'), uploadforcheck);
router.post('/removeexistingurl', upload.single('file'), removeexistingurl);
router.post('/editshippingcost', editshippingcost);
router.post('/uploadinvfile', upload.single('file'), uploadinvdata);
router.post('/uploadinvfile2', upload.single('file'), uploadinvdata2);
router.post('/uploadinvfile3', upload.single('file'), uploadinvdata3);

router.post('/autofetchdata', autofetchdata);
router.get('/getupdatedproduct', getupdatedproduct);
router.get('/totalproducts', totalproducts);
// router.get('/downloadpartiallist', downloadpartiallist);
router.delete('/deletebackup', deletebackup);
router.delete('/deleteproduct', deleteproduct);
router.delete('/deletemanyproduct', deletemanyproduct);
router.put('/setbulkshippingcost',setbulkshippingcost)
// router.get('/exp',exp)
router.put('/editsku',editsku)
router.put('/setchecked',setchecked)
router.delete('/deletedata',deletedata)
router.post('/downloadbackup',downloadbackup)
// ---------brand url scrappint thred-------

router.post('/thread1', getproduct1)
router.post('/thread2', getproduct2)
router.post('/thread3', getproduct3)
router.post('/thread4', getproduct4)
router.post('/thread5', getproduct5)
router.post('/thread6', getproduct6)
router.post('/thread7', getproduct7)
router.post('/thread8', getproduct8)

module.exports = router;
