const mongoose = require('mongoose')

const dataSchema = new mongoose.Schema({
    'Input UPC': {
        type: String
    },
    ASIN: String,
    SKU: String,
    'Product price': Number,
    'Available Quantity': Number,
    'Product link': String,
    'Fulfillment': Number,
    'Amazon Fees%': String,
    'Shipping Template': String,
    'Min Profit': String,
    'Brand Name':String,
    'Amazon Title':String

});
module.exports = mongoose.model('InvProduct', dataSchema);
