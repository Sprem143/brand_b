const mongoose = require('mongoose')

const autofetchdataSchema = new mongoose.Schema({
    'Input UPC': {
        type: String
    },
    'Vendor URL': String,
    ASIN: String,
    SKU: String,
    'Product price':Number,
    'Amazon link': String,
    'Image link': String,
    'Available Quantity': Number,
    'Product link': String,
    'Fulfillment': Number,
    'Amazon Fees%': String,
    'Shipping Template': String,
    'Min Profit': String,
    'Current Price':Number,
    'Coupon Offer Price': Number,
    'Current Quantity':Number

});

module.exports = mongoose.model('AutoFetchData', autofetchdataSchema);