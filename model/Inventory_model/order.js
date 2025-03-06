const mongoose = require('mongoose')

const dataSchema = new mongoose.Schema({
    SKU: String,
    'AZ id':{
        type:String, 
        unique:true
    },
    Product:String,
    Vendor:String,
    Date: {
        type: String,
        default: () => new Date().toLocaleDateString("en-GB"),  
    },
});
module.exports = mongoose.model('Order', dataSchema);