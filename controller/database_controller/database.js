const BrandUrl = require('../../model/Brand_model/brandurl');
const InvUrl1 = require('../../model/Inventory_model/invUrl1');
const AutoFetchData = require('../../model/Inventory_model/autofetchdata');
const Backup = require('../../model/Inventory_model/backup');
const Product = require('../../model/Brand_model/products');
const autofetchdata = require('../../model/Inventory_model/autofetchdata');
const BrandPage = require('../../model/Brand_model/brandpage');

// -----------send url list of product to home page------
exports.sendproductsurl = async (req, res) => {
    try {
        const data = await BrandUrl.find();

        if (data.length > 0) {
            const mergedArray = data.map(item => item.producturl).flat();
            res.status(200).json({ url: mergedArray, upc: '', id: data[0]._id });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}
// --------brand scrappint total products-------------
exports.totalproducts = async (req, res) => {
    try {
        let products = await Product.countDocuments();
        let urls = await BrandUrl.find();
        var num2=[];
        if (urls.length > 0) {
            num2 = urls[0].producturl;
        }
        res.status(200).json({ status: true, num: products, num2: num2 });
    } catch (err) {
        console.log(err)
        res.status(500).json({ status: false, msg: err })
    }
}
exports.deletebackup = async (req, res) => {
    try {
        const { name } = req.body;
        let result = await Backup.deleteOne({ name: name })
        if (result) {
            res.status(200).json({ status: true })
        }
    } catch (err) {
        console.log(err);
        res.status(500).send(err)
    }
}

// ------send inventory products links to home page---
exports.getinvlinks = async (req, res) => {
    try {
        let result1 = await InvUrl1.find();
        let data= await AutoFetchData.find({
            $expr:{$gt:[{$size : "$PriceRange"},1]}
        })
        res.status(200).json({url:result1[0],data:data})
    } catch (err) {
        console.log(err);
    }
}
exports.getinvproduct = async (req, res) => {
    try {
        const invProduct = await AutoFetchData.find();
        let filterdata = invProduct.filter((product, index, self) => {
            index === self.findIndex((p) => p['Input UPC'] === product['Input UPC'])
        })
        res.status(200).send(filterdata)
    } catch (err) {
        console.log(err);
        res.send(err)
    }
}

exports.getupdatedproduct = async (req, res) => {
    try {
        let num = await AutoFetchData.countDocuments();
        res.status(200).json({ num: num })
    } catch (err) {
        console.log(err)
    }
}
// -------------download partial list of upc on brand scrapping page
// exports.downloadpartiallist = async (req, res) => {
//     try {
//         let result = await Varientupc.find({}, { upc: 1, _id: 0 });
//         let upclist = [];
//         result.forEach((r) => {
//             upclist.push(r.upc[Math.floor(r.upc.length / 2)])
//         })
//         res.status(200).json({ status: true, upc: upclist })
//     } catch (err) {
//         console.log(err)
//     }
// }

// ------------checkremainingdata----------------
exports.checkremainingdata=async(req,res)=>{
    try{
        let url = await InvUrl1.find();
        res.status(200).json({status:true, url:url[0]})
    }catch(err){
        console.log(err)
        res.staus(500).json({status:false,msg:err})
    }
}

exports.changeprice=async(req,res)=>{
    try{
    const {id,price}=req.body
  let products= await autofetchdata.find({_id:id});
  let url=products[0]['Product link']
  let color= products[0]['color'] || 'abcd'
let allvarition= await autofetchdata.find({'Product link':url, color:color})
console.log(allvarition)

     allvarition.forEach(async(p)=>{
         await AutoFetchData.findByIdAndUpdate(
                {_id:p._id},
                {$set:{['Current Price']: price, PriceRange: [] }},
                {new:true}
            )
     })

     let updatedproduct= await autofetchdata.find({
        $expr:{$gt:[{$size : "$PriceRange"},1]}
    })
 res.status(200).json({status:true, num:allvarition.length, data:updatedproduct})
    }catch(err){
        console.log
    }
}

exports.cleardata=async(req,res)=>{
    try{
      await BrandUrl.deleteMany();
      await BrandPage.deleteMany();
      await Product.deleteMany()
    }catch(err){
        console.log(err);
        res.status(500).json({status:false, msg:err})
    }
}
