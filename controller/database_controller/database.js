const BrandUrl = require('../../model/Brand_model/brandurl');
const InvUrl1 = require('../../model/Inventory_model/invUrl1');
const AutoFetchData = require('../../model/Inventory_model/autofetchdata');
const Upc = require('../../model/Brand_model/upc');
const Backup= require('../../model/Inventory_model/backup');
const Product = require('../../model/Brand_model/products');

// -----------send url list of product to home page------
exports.sendproductsurl = async(req, res) => {
    try {
        const data = await BrandUrl.find();
        const upcs = await Upc.find();

      if(data.length>0){
        const mergedArray = data.map(item => item.producturl).flat();
        res.status(200).json({ url: mergedArray, upc: upcs, id:data[0]._id });
      }
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}
// --------brand scrappint total products-------------
exports.totalproducts=async(req,res)=>{
try{
     let products= await Product.countDocuments();
     let urls= await BrandUrl.find();
     var num2;
    if(urls.length>0){
       num2= urls[0].producturl;
    }
 res.status(200).json({status:true, num:products, num2:num2});
}catch(err){
    console.log(err)
    res.status(500).json({status:false, msg:err})
}
}
exports.deletebackup=async(req,res)=>{
    try{
        const {name}= req.body;
         let result= await Backup.deleteOne({name:name})
         if(result){
            res.status(200).json({status:true})
         }
    }catch(err){
        console.log(err);
        res.status(500).send(err)
    }
}


// ------send inventory products links to home page---
exports.getinvlinks = async(req, res) => {
    try {

        let result1 = await InvUrl1.find();
        res.status(200).send(result1[0])
    } catch (err) {
        console.log(err);
    }
}
exports.getinvproduct = async(req, res) => {
        try {
            const invProduct = await AutoFetchData.find();
            let filterdata= invProduct.filter((product,index,self)=>{
                index=== self.findIndex((p)=> p['Input UPC']=== product['Input UPC'])
            })
            res.status(200).send(filterdata)
        } catch (err) {
            console.log(err);
            res.send(err)
        }
    }

exports.settime = async(req, res) => {

    const num = req.body.time

    Serial.findOneAndUpdate({}, { time: num }, { new: true })
        .then(updatedDoc => {
            if (updatedDoc) {
                res.status(200).json({ status: true })
            }
        })
        .catch(error => {
            console.error("Error updating document:", error);
        });
}

exports.getupdatedproduct = async(req, res) => {
    try {
        let num = await AutoFetchData.countDocuments();
        res.status(200).json({ num: num })
    } catch (err) {
        console.log(err)
    }
}
