const xlsx = require('xlsx');
const CalProduct = require('../model/Calculation/product');
const FinalSheet= require('../model/Calculation/finalsheet')
const path = require('path');
const fs = require('fs');

exports.uploaddata = async (req, res) => {
  try {
    // Delete all existing data in the collection
    await CalProduct.deleteMany({});
    const file = req.file;
    if (!file) {
      return res.status(400).send('No file uploaded.');
    }

    // Read the uploaded Excel file
    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[0];  // Read the first sheet
    const sheet = workbook.Sheets[sheetName];

    // Convert the sheet to JSON and insert it into MongoDB
    const data = xlsx.utils.sheet_to_json(sheet);
    await CalProduct.insertMany(data);
    console.log(data.length)
    res.status(200).json({ msg: "File uploaded successfully",number:data.length });
  } catch (err) {
    console.error('Error processing file upload:', err);
    res.status(500).json({ msg: 'Error processing file upload' });
  }
};
// -------------------------------------------------------------

exports.downloadExcel = async (req, res) => {
  try {
    const data = await finalsheet.find();
    if (!data || data.length === 0) {
      return res.status(404).send('No data found.');
    }

    const jsondata = data.map((item) => (
      {
        // UPC:item.UPC
        SKU: item.SKU,
        "Original Product Cost": item['Original Product Cost'],
        "Current Products Cost": item['Current Products Cost'],
        "Vendor Shipping": item['Vendor Shipping'],
        Fulfillment: item.Fulfillment,
        "Amazon Fees%": item['Amazon Fees%'],
        "Shipping Template used": item['Shipping Template used'],
        'Min Profit $- Calculations': item['Min Profit $- Calculations'],
        'Current Inventory': item['Current Inventory'],
        'Total Cost':item['Total Cost'],
        'Maximum Price':item['Maximum Price'],
        'Minimum Price':item['Minimum Price'],
        'Amazon Fee':item['Amazon Fee'],
        'Net Profit':item['Net Profit'],
        Min:item.Min,
        Max:item.Max,
        'Selling Price':item['Selling Price'],
        'Max Price - Selling Price':item['Max Price - Selling Price'],
        'Price difference with new-old':item['Price difference with new-old']
      }
    ))

    const worksheet = xlsx.utils.json_to_sheet(jsondata);
    const workbook = xlsx.utils.book_new();

    xlsx.utils.book_append_sheet(workbook, worksheet, "Products");
    const filePath = path.join(__dirname, 'data.xlsx');
    xlsx.writeFile(workbook, filePath);

    // Send the Excel file for download
    res.download(filePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
      // Delete the file after download
      fs.unlinkSync(filePath);
      
    });
  } catch (err) {
    console.log(err)
  }
}

exports.getsheet=async(req,res)=>{
  try{
    let data= await finalsheet.find({});
    const dPrice= data.filter((d)=> d['Price difference with new-old']<0);
    const iPrice = data.filter((d)=> d['Price difference with new-old']>0);
    const nPrice= data.filter((d)=> d['Price difference with new-old']==0);
    res.status(200).json({products:data, dPrice:dPrice,iPrice:iPrice,nPrice:nPrice,number:data.length})

  }catch(err){
    console.log(err);
    res.status(500).json({msg:"Error while fetching sheet"})
  }
}

exports.calculate=async(req,res)=>{
  try {
    const per= req.body.percentage;
    const data = await CalProduct.find();
    if (!data || data.length === 0) {
      return res.status(404).send('No data found.');
    }

    const jsondata = data.map((item) => (
      {
        // UPC:item.UPC
        SKU: item.SKU,
        "Original Product Cost": item['Original Product Cost'],
        "Current Products Cost": item['Current Products Cost'],
        "Vendor Shipping": item['Vendor Shipping'],
        Fulfillment: item.Fulfillment,
        "Amazon Fees%": item['Amazon Fees%']*100+'%',
        "Shipping Template used": item['Shipping Template used'],
        'Min Profit $- Calculations': item['Min Profit $- Calculations'],
        'Current Inventory': item['Current Inventory'],
        'Total Cost': (item['Current Products Cost'] + item['Vendor Shipping'] + item.Fulfillment).toFixed(2),
        'Maximum Price': ((item['Current Products Cost'] + item['Vendor Shipping'] + item.Fulfillment) * (1+ (per/100))).toFixed(2),
        'Minimum Price':((100*(item['Current Products Cost'] + item['Vendor Shipping'] + item.Fulfillment + item['Min Profit $- Calculations']))/(100-(100*item['Amazon Fees%']))).toFixed(2),
        'Amazon Fee':((100*(item['Current Products Cost'] + item['Vendor Shipping'] + item.Fulfillment + item['Min Profit $- Calculations']))/(100-(100*item['Amazon Fees%']))*item['Amazon Fees%']).toFixed(2),
        'Net Profit':item['Min Profit $- Calculations'].toFixed(2),
        Min:((100*(item['Current Products Cost'] + item['Vendor Shipping'] + item.Fulfillment + item['Min Profit $- Calculations']))/(100-(100*item['Amazon Fees%']))-item['Shipping Template used']).toFixed(2),
        Max:(((item['Current Products Cost'] + item['Vendor Shipping'] + item.Fulfillment) * (1+ (per/100)))-item['Shipping Template used']).toFixed(2),
        'Selling Price':((item['Current Products Cost'] + item['Vendor Shipping'] + item.Fulfillment)*(1+(sp/100))).toFixed(2),
        'Selling - Min Price for Checking':(((item['Current Products Cost'] + item['Vendor Shipping'] + item.Fulfillment)*(1+(sp/100))) - ((100*(item['Current Products Cost'] + item['Vendor Shipping'] + item.Fulfillment + item['Min Profit $- Calculations']))/(100-(100*item['Amazon Fees%']))-item['Shipping Template used'])).toFixed(2),
        'Max Price - Selling Price':((((item['Current Products Cost'] + item['Vendor Shipping'] + item.Fulfillment) *(1+ (per/100)))-item['Shipping Template used'])- ((item['Current Products Cost'] + item['Vendor Shipping'] + item.Fulfillment)*(1+(sp/100)))).toFixed(2),
        'Price difference with new-old':(item['Current Products Cost']-item['Original Product Cost']).toFixed(2)
      }
    ))

  await FinalSheet.deleteMany({});
   const result= await finalsheet.insertMany(jsondata);
   const dPrice= result.filter((d)=> d['Price difference with new-old']<0);
   const iPrice =result.filter((d)=> d['Price difference with new-old']>0);
   const nPrice= result.filter((d)=> d['Price difference with new-old']==0);
   res.status(200).json({products:result, dPrice:dPrice,iPrice:iPrice,nPrice:nPrice,number:result.length,status:true})
  } catch (err) {
    console.log(err);
  }
}