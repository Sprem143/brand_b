const mongoose= require('mongoose')

const dataSchema = new mongoose.Schema({
   UPC:String,
   SKU:String,
   "Original Product Cost":{type:Number},
   "Current Products Cost":{type:Number},
   "Vendor Shipping":{type:Number},
   Fulfillment:Number,
   "Amazon Fees%": { type: String },
   "Shipping Template used": {type:Number},
   "Shipping Template used":Number,
   "Min Profit $- Calculations":Number,
   "Current Inventory":Number
});

module.exports= mongoose.model('CalProduct', dataSchema);