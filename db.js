const mongoose = require('mongoose');

const db = () => {
    mongoose.connect('mongodb://localhost:27017/brand')
        .then(() => {
            console.log("MongoDB connected");
        })
        .catch((err) => {
            console.error("MongoDB connection error:", err);
        });
};

module.exports = db;