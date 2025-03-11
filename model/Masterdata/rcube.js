const mongoose = require('mongoose')

const dataSchema = new mongoose.Schema({
    seller:String,
    ASIN: String,
    'Input UPC':String,
    SKU: String,
    'Brand Name':String,
    'Amazon Title':String,
    'Product link': String,
    'Current Price':Number,
    'Current Quantity':String,
    'Fulfillment':Number,
    'Amazon Fees%':String,
    'Shipping Template':Number,
    'Min Profit':Number,
    'PriceRange':Array,
    Date: {
        type: String,
        default: () => new Date().toLocaleDateString("en-GB"),  
    },
});
module.exports = mongoose.model('Rcube', dataSchema);
