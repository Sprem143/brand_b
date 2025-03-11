const mongoose = require('mongoose')

const autofetchdataSchema = new mongoose.Schema({
    url:String,
   products:Object,
   Date: {
    type: String,
    default: () => new Date().toLocaleDateString("en-GB"),  
},
});

module.exports = mongoose.model('Todayupdate', autofetchdataSchema);