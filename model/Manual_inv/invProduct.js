const mongoose = require('mongoose')

const dataSchema = new mongoose.Schema({
    
SKUs:String,
'Vendor URL':String,
upc:String,
'Product Cost':String,
available:String

});
module.exports = mongoose.model('MInvProduct', dataSchema);