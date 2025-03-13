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
    Title:String,
    Brand:String,
    UPC:String,
    'Fulfillment Shipping':String,
    'Available Quantity': Number,
    'Product name': String,
    'Img link': String,
    'Product price': Number,
    Size:String,
    Color: String,
});

module.exports = mongoose.model('FinalProduct', dataSchema);
