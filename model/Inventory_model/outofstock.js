const mongoose = require('mongoose')

const dataSchema = new mongoose.Schema({
    'Input UPC': {
        type: String
    },
    'Vendor URL': String,
    ASIN: String,
    SKU: String,
    'Product price': Number,
    'Amazon link': String,
    'Image link': String,
    'Available Quantity': Number,
    'Product link': String,
    'Fulfillment': Number,
    'Amazon Fees%': String,
    'Shipping Template': String,
    'Min Profit': String,
    Date: {
        type: String,
        default: () => new Date().toLocaleDateString("en-GB"),  
    },


});
module.exports = mongoose.model('Outofstock', dataSchema);