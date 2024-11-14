const mongoose = require('mongoose')

const urlSchema = new mongoose.Schema({
    start_index: {
        type: Number,
        default: 0
    },
    end_index: Number
});
module.exports = mongoose.model('Serial', urlSchema);