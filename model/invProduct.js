const mongoose = require('mongoose')

const dataSchema = new mongoose.Schema({
    'Amazon Title': String,
    'Vendor URL': String,
    'Product Cost': Number,
    Size: String,
    upc: {
        unique: true,
        type: String
    },
    available: String

});
module.exports = mongoose.model('InvProduct', dataSchema);