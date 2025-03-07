const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
    name: {
        type: String,
        default: () => new Date().toLocaleString(),
    },
    account:String,
    data: {
        type: [Object],
        required: true,
    },
    length: Number
}, 
{
    timestamps: true,
});

module.exports = mongoose.model('Backup', urlSchema);
