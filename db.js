// const mongoose = require('mongoose');

// const db = () => {
//     mongoose.connect('mongodb://localhost:27017/brand')
//         .then(() => {
//             console.log("MongoDB connected");
//         })
//         .catch((err) => {
//             console.error("MongoDB connection error:", err);
//         });
// };
// module.exports = db;



const mongoose = require('mongoose');

const db = () => {
    mongoose.connect('mongodb+srv://Prem:Prem7366@belk-brand.8rj8f.mongodb.net/?retryWrites=true&w=majority&appName=belk-brand')
        .then(() => {
            console.log("MongoDB connected");
        })
        .catch((err) => {
            console.error("MongoDB connection error:", err);
        });
};

module.exports = db;