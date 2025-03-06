const mongoose = require('mongoose')

const dataSchema = new mongoose.Schema({
    ASIN: String,
    UPC:String,
    SKU: String,
    Date: {
        type: String,
        default: () => new Date().toLocaleDateString("en-GB"),  
    },
});
module.exports = mongoose.model('Rcube', dataSchema);