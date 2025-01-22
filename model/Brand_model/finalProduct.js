const mongoose = require('mongoose')

const dataSchema = new mongoose.Schema({
    isCheked:{
        type:Boolean,
        default:false
    },
    'Input EAN': String,
    SKU: String,
    ASIN:String,
    'Amazon link': String,
    'Belk link': String,
    'EAN List': String,
    MPN: String,
    ISBN:String,
    Title:String,
    Brand:String,
    'Dimensions (in)': String,
    'Weight (lb)':String,
    'Image link':String,
    'Lowest Price (USD)':String,
    'Number of Sellers': String,
    BSR: String,
    'Product Category':String,
    'Buy Box Price (USD)': String,
    'FBA Fees': String,
    'Fees Breakdown': String,
    'Product id':String,
    UPC:String,
    'Available Quantity': Number,
    'Product name': String,
    'Img link': String,
    'Product Currency': String,
    'Product price': Number,
    Category: String,
    Soldby: String,
    Size:String,
    Color: String,
    'Any other variations': String

});

module.exports = mongoose.model('FinalProduct', dataSchema);
