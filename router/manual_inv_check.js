const express = require('express');
const router = express.Router();

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const { autofetchdata1} = require('../controller/Manual_inv_check/inventory')
const { autofetchdata2} = require('../controller/Manual_inv_check/inventory2')
const { autofetchdata3} = require('../controller/Manual_inv_check/inventory3')
const { autofetchdata4} = require('../controller/Manual_inv_check/inventory4')
const { autofetchdata5} = require('../controller/Manual_inv_check/inventory5')
const { autofetchdata6} = require('../controller/Manual_inv_check/inventory6')
const { autofetchdata7} = require('../controller/Manual_inv_check/inventory7')
const { autofetchdata8} = require('../controller/Manual_inv_check/inventory8');
const {remainingdata, getbackup, getupdatedproduct, geterrorurl,getserialnumber, Muploadinvdata, getinvlinks, seterrorindex, setindex,setindex2, setindex3,setindex4, setindex5,setindex6,setindex7,setindex8,settime} = require('../controller/database_controller/db_m_u_d');


router.post('/autofetchdata1', autofetchdata1);
router.post('/autofetchdata2', autofetchdata2);
router.post('/autofetchdata3', autofetchdata3);
router.post('/autofetchdata4', autofetchdata4);
router.post('/autofetchdata5', autofetchdata5);
router.post('/autofetchdata6', autofetchdata6);
router.post('/autofetchdata7', autofetchdata7);
router.post('/autofetchdata8', autofetchdata8);
router.post('/uploadinvfile', upload.single('file'), Muploadinvdata);
router.get('/getinvurl', getinvlinks);
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
router.get('/geterrorurl', geterrorurl);
router.get('/getupdatedproduct', getupdatedproduct);
router.get('/remainingdata', remainingdata);
router.get('/getbackup', getbackup);


module.exports= router;