const mongoose = require('mongoose')

const urlSchema = new mongoose.Schema({
    start_index1: {
        type: Number,
        default: 0
    },
    start_index2: {
        type: Number,
        default: 0
    },
    start_index3: {
        type: Number,
        default: 0
    },
    start_index4: {
        type: Number,
        default: 0
    },

});
module.exports = mongoose.model('Serial', urlSchema);