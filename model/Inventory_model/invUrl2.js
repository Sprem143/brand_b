const mongoose = require('mongoose')

const urlSchema = new mongoose.Schema({
    url: {
        type: [String],
    }

});
module.exports = mongoose.model('InvUrl2', urlSchema);