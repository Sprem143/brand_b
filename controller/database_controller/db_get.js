const InvProduct = require('../../model/Inventory_model/invProduct');
const AutoFetchData = require('../../model/Inventory_model/autofetchdata')
const Backup= require('../../model/Inventory_model/backup');


exports.getrowdata = async(req, res) => {
    try {
        let rowData = await InvProduct.find();
        res.status(200).send(rowData)
    } catch (err) {
        console.log(err);
        res.send(err)
    }
}
exports.getdata = async(req, res) => {
    try {
       let resultData = await AutoFetchData.find();
        res.status(200).send(resultData)
    } catch (err) {
        console.log(err);
        res.send(err)
    }
}

exports.getbackup = async(req, res) => {
    try {
       let filename = await Backup.find({}, { name: 1, _id: 0 } );
        let lastfile= filename[filename.length-1].name
        let data= await Backup.findOne({name:lastfile})
     let resultData=[data]
        res.status(200).send(resultData)
    } catch (err) {
        console.log(err);
        res.send(err)
    }
}
