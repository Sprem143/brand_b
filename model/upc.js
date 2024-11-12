const mongoose = require('mongoose')

const upcSchema = new mongoose.Schema({
    upc: {
        type: [String],
    },
    url: String
});

module.exports = mongoose.model('Upc', upcSchema);