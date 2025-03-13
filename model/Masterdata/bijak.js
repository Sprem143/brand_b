const mongoose = require('mongoose')

const dataSchema = new mongoose.Schema({
    ASIN: String,
    'Input UPC':String,
    SKU: String,
    'Brand Name':String,
    'Amazon Title':String,
    'Product link': String,
    'Fulfillment':String,
    'Shipping Template':String,
    img:String,
    Date: {
        type: String,
        default: () => new Date().toLocaleDateString("en-GB"),  
    },
});
module.exports = mongoose.model('Bijak', dataSchema);
