const InvProduct = require('../../model/invProduct');
const AutoFetchData = require('../../model/autofetchdata')
const NoProduct= require('../../model/noProduct')
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