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
   "Current Inventory":Number,
   'Total Cost':Number,
   'Maximum Price':Number,
   'Minimum Price':Number,
   'Amazon Fee':Number,
   'Net Profit':Number,
   Min:Number,
   Max:Number,
   'Selling Price':Number,
   'Selling - Min Price for Checking':Number,
   'Max Price - Selling Price':Number,
   'Price difference with new-old':Number
});

module.exports= mongoose.model('FinalSheet', dataSchema);