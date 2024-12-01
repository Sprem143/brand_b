const InvProduct = require('../../model/Inventory_model/invProduct');
const AutoFetchData = require('../../model/Inventory_model/autofetchdata')
const NoProduct= require('../../model/Inventory_model/noProduct');
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
        let resultData = await Backup.find();
        res.status(200).send(resultData)
    } catch (err) {
        console.log(err);
        res.send(err)
    }
}

exports.geterrorurl = async(req, res) => {
    try {
        let resultData = await NoProduct.find();
        let arr= resultData.map((r)=> r.url);
        res.status(200).json({links:arr})
    } catch (err) {
        console.log(err);
        res.send(err)
    }
}