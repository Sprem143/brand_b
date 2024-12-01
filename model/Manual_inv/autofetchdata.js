const mongoose = require('mongoose')

const autofetchdataSchema = new mongoose.Schema({
   
    
    SKUs:String,
    'Vendor URL':String,
    upc:String,
    'Product Cost': Number,
    available:String,
    quantity:Number,
    'Current Price':Number,
    'Image link':String
});

module.exports = mongoose.model('MAutoFetchData', autofetchdataSchema);