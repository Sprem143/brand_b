const mongoose = require('mongoose')

const dataSchema = new mongoose.Schema({
    name: String,
    upc: String,
    productid: String,
    price: Number,
    quantity: Number,
    color: String,
    size: String,
    imgurl: String,
    discount: Number,
    onsale: Boolean,
    offerend: String,
    url: String,
    imgurl: String
});

module.exports = mongoose.model('Product', dataSchema);