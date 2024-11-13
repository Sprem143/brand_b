const mongoose = require('mongoose')

const upcSchema = new mongoose.Schema({
    upc: {
        type: [String],
    }
});

module.exports = mongoose.model('InvUpc', upcSchema);