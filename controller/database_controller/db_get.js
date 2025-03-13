const InvProduct = require('../../model/Inventory_model/invProduct');
const AutoFetchData = require('../../model/Inventory_model/autofetchdata')
const Backup = require('../../model/Inventory_model/backup');
const Outofstock = require('../../model/Inventory_model/outofstock')
const Om = require('../../model/Masterdata/om');
const Bijak = require('../../model/Masterdata/bijak');
const Rcube = require('../../model/Masterdata/rcube')
const Zenith = require('../../model/Masterdata/zenith')


exports.getrowdata = async (req, res) => {
    try {
        let rowData = await InvProduct.find();
        res.status(200).send(rowData)
    } catch (err) {
        console.log(err);
        res.send(err)
    }
}
exports.getdata = async (req, res) => {
    try {
        let resultData = await AutoFetchData.find();
        res.status(200).send(resultData)
    } catch (err) {
        console.log(err);
        res.send(err)
    }
}

exports.getbackup = async (req, res) => {
    try {
        let list = await Backup.find({}, { name: 1, length:1, account:1, _id: 0 });
        let data= await Backup.findOne({name: list[list.length-1].name})
        res.status(200).json({ status: true, list: list, data: data.data })
    } catch (err) {
        console.log(err);
         res.status(500).json({status:false, msg:err})
    }
}

exports.getonebackup=async(req,res)=>{
    try{
    const {name}= req.body;
     let data=  await Backup.findOne({name:name});
     res.status(200).json({status:true, data:data})
    }catch(err){
        console.log(err)
        res.staus(500).json({status:false, msg:err})
    }
}

exports.downloadbackup=async(req,res)=>{
    try{
const {name}= req.body;
let data= await Backup.findOne({name:name})
res.status(200).json({data:data.data})

    }catch(err){
        console.log(err);
        res.status(500).json({status:false, msg:err})
    }
}

exports.getoutofstock = async(req,res)=>{
    try{
   let data = await Outofstock.find();
   res.status(200).json({status:true, data:data})
    }catch(err){
        console.log(err);
        res.status(500).json({status:false, msg:err})
    }
}

exports.mastersheet = async(req,res)=>{
    try{
        let account = req.body.account

        // const data = account=='rc'? await Rcube.find() : account == 'bj'?await Bijak.find() :account == 'zl'?await Zenith.find() : account == 'om' ?  await Om.find() : null
      const rc = await Rcube.find();
      const zl = await Zenith.find();
      const om = await Om.find();
      const bj = await Bijak.find();

      res.status(200).json({status:true, rc:rc, zl:zl,om:om, bj:bj})
    }catch(err){
        console.log(err);
        res.status(500).json({status:false, msg:err})
    }
}

exports.pagedetails = async(req,res)=>{
    try{
        let uploaded = await InvProduct.countDocuments();
        let om = await Om.countDocuments()
        let rc = await Rcube.countDocuments()
        let zl = await Zenith.countDocuments()
        let bj = await Bijak.countDocuments()
        let updated = await AutoFetchData.countDocuments();
        let outofstock = await Outofstock.countDocuments()

        res.status(200).json({uploaded,om,rc,zl,bj,updated,outofstock})
       
    }catch(err){
        console.log(err);
        res.status(500).json({status:false, msg:err})
    }
}
