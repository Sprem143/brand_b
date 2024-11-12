const mongoose = require('mongoose')

const dataSchema = new mongoose.Schema({
    UPC: String,
    ASIN: String,
    'Amazon link': String,
    'UPC List': String,
    'EAN List': String,
    MPN: String,
    ISBN: String,
    Title: String,
    Brand: String,
    'Dimensions (in)': String,
    'Weight (lb)': String,
    'Image link': String,
    'Lowest Price (USD)': String,
    'Number of Sellers': String,
    'BSR': String,
    'Product Category': String,
    'Buy Box Price (USD)': String,
    'FBA Fees': String,
    'Fees Breakdown': String
});

module.exports = mongoose.model('AvailableProduct', dataSchema);