const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
    name: {
        type: String,
        default: () => new Date().toLocaleString(),  
    },
    data: {
        type: [Object],
        required: true,  
    }
}, {
    timestamps: true,  
});

module.exports = mongoose.model('Backup', urlSchema);
