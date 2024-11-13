const mongoose = require('mongoose')

const autofetchdataSchema = new mongoose.Schema({
    'Input UPC': {
        type: String
    },
    'Vendor URL': String,
    ASIN: String,
    'Product price': String,
    'Amazon link': String,
    'Image link': String,
    'Available Quantity': Number,
    'Product link': String,
    'Fulfillment': Number,
    'Amazon Fees%': String,
    'Shipping Template': String,
    'Min Profit': String,
    'Current Price': String,
    'Coupon Offer Price': Number,
    'Current Quantity': String

});

module.exports = mongoose.model('AutoFetchData', autofetchdataSchema);