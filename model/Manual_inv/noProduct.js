const mongoose = require('mongoose')

const upcSchema = new mongoose.Schema({
    url:{
        type:String
    }
});

module.exports = mongoose.model('MNoProduct', upcSchema);