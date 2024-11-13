const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const BrandUrl = require('../model/brandurl');
const AvailableProduct = require('../model/AvailableProduct');
const FinalProduct = require('../model/finalProduct')
const Product = require('../model/products');
const InvProduct = require('../model/invProduct');
const InvUpc = require('../model/invUpc');
const InvUrl = require('../model/invUrl');
const AutoFetchData = require('../model/autofetchdata')
const Upc = require('../model/upc');
const xlsx = require('xlsx')
const fs = require('fs');
const path = require('path');
const invProduct = require('../model/invProduct');

// ---------download upc list scrapped from brand url----------
exports.downloadExcel = async(req, res) => {
    try {
        const data = await Upc.find();
        const mergedArray = data.map(item => item.upc).flat();
        const jsondata = mergedArray.map((d) => ({
            UPC: d
        }));
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

// -----------upload asin-scope data-------------
exports.uploaddata = async(req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).send('No file uploaded.');
        }
        // Load the uploaded Excel file
        const workbook = xlsx.readFile(file.path);
        const sheetName = workbook.SheetNames[0]; // Read first sheet
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);
        const filteredData = data.filter(row => row.ASIN !== '-');
        await AvailableProduct.deleteMany();
        await AvailableProduct.insertMany(filteredData);
        res.status(200).send("File uploaded successfully")
    } catch (err) {
        console.log(err);
        res.send(err);
    }
};

exports.downloadfinalSheet = async(req, res) => {
    try {
        const amz = await AvailableProduct.find();
        const blk = await Product.find();
        const brand = amz[0].Brand;

        // Create a map for quick access to blk products by UPC
        const blkMap = new Map(blk.map(product => [product.upc, product]));
        console.log(blkMap)
            // Filter and map data to the desired format
        const jsondata = amz.map((item) => {
            const blkItem = blkMap.get(item.UPC);
            return {
                'Input EAN': 'UPC' + item.UPC,
                'ASIN': item.ASIN,
                'Amazon link': item['Amazon link'],
                'Belk link': blkItem ? blkItem.url : '',
                'EAN List': item['EAN List'],
                'MPN': item.MPN,
                'ISBN': item.ISBN,
                'Title': item.Title,
                'Brand': brand,
                'Dimensions (in)': item['Dimensions (in)'],
                'Weight (lb)': item['Weight (lb)'],
                'Image link': item['Image link'],
                'Lowest Price (USD)': item['Lowest Price (USD)'],
                'Number of Sellers': item['Number of Sellers'],
                'BSR': item.BSR,
                'Product Category': item['Product Category'],
                'Buy Box Price (USD)': item['Buy Box Price (USD)'],
                'FBA Fees': item['FBA Fees'],
                'Fees Breakdown': item['Fees Breakdown'],
                'Product id': blkItem ? blkItem.productid : '',
                'UPC': 'UPC' + item.UPC,
                'Available Quantity': blkItem ? blkItem.quantity : 0,
                'Product name': blkItem ? blkItem.name : '',
                'Belk link': blkItem ? blkItem.url : '',
                'Img link': blkItem ? blkItem.imgurl : '',
                'Product Currency': 'USD',
                'Product price': blkItem ? blkItem.price : 0,
                'Category': '',
                'Soldby': 'Belk',
                'Size': blkItem ? blkItem.size : '',
                'Color': blkItem ? blkItem.color : '',
                'Any other variations': ''
            };
        });
        // ----------filter jsondata---------
        const newJson = jsondata.filter((json) => json['Product price'] > 0)
        FinalProduct.insertMany(newJson)
        const worksheet = xlsx.utils.json_to_sheet(newJson);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, "Products");

        const filePath = path.join(__dirname, 'finalsheet.xlsx');
        xlsx.writeFile(workbook, filePath);

        // Send file for download and delete after sending
        res.download(filePath, (err) => {
            if (err) {
                console.error('Error sending file:', err);
            }
            fs.unlinkSync(filePath);
        });

    } catch (err) {
        console.error('Error generating Excel sheet:', err);
        res.status(500).send('An error occurred while generating the Excel file.');
    }
};

// -----------send url list of product to home page------
exports.sendproductsurl = async(req, res) => {
    try {
        const data = await BrandUrl.find();
        const upcs = await Upc.find();

        const mergedArray = data.map(item => item.producturl).flat();
        res.status(200).json({ url: mergedArray, upc: upcs });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}

// ----------- upload file for invontory update-------

exports.uploadinvdata = async(req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).send('No file uploaded.');
    }
    // Load the uploaded Excel file
    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[0]; // Read first sheet
    const sheet = workbook.Sheets[sheetName];

    // Convert the sheet to JSON
    const data1 = xlsx.utils.sheet_to_json(sheet);

    const data = data1.filter((d) => d['ASIN'] !== undefined)
    InvProduct.insertMany(data)
        .then(async() => {
            const uniqueUpc = data
                .map(item => item['Input UPC'].replace("UPC", "")) // Extract only the URLs
                .filter((upc, index, self) => self.indexOf(upc) === index);
            var upcs = new InvUpc({ upc: uniqueUpc });
            await upcs.save();
        })
        .then(async() => {
            const uniqueUrls = data
                .map(item => item['Product link'].split(".html")[0] + ".html")
                .filter((url, index, self) => self.indexOf(url) === index);
            var urls = new InvUrl({ url: uniqueUrls });
            // var visitedurl = new VisitedUrl({ url: uniqueUrls });
            await urls.save();
            // await visitedurl.save();
            res.status(200).json({ msg: 'Data successfully uploaded' });
        })
        .catch(err => {
            console.error('Error saving data to MongoDB:', err);
            res.status(500).json({ msg: 'Error saving data to MongoDB' });
        });

};

// ------send inventory products links to home page---
exports.getinvlinks = async(req, res) => {
    try {

        let result = await InvUrl.find();
        //   let totalProduct= await product.find();
        //   let notp= totalProduct.length;
        res.status(200).json({ links: result })
    } catch (err) {
        console.log(err);
    }
}

exports.getinvproduct = async(req, res) => {
        try {
            const invProduct = await AutoFetchData.find();
            res.status(200).send(invProduct)
        } catch (err) {
            console.log(err);
            res.send(err)
        }
    }
    // ------down invontary updata sheet----------
exports.downloadInvSheet = async(req, res) => {
    try {
        const data = await AutoFetchData.find();
        const jsondata = data.map((item) => {
            return {
                'Input UPC': item['Input UPC'],
                ASIN: item['ASIN'],
                'Amazon link': item['Amazon link'],
                SKU: item['SKU'],
                'Image link': item['Image link'],
                'Available Quantity': item['Available Quantity'],
                'Product price': item['Product price'],
                'Product link': item['Product link'],
                'Fulfillment': item['Fulfillment'],
                'Amazon Fees%': item['Amazon Fees%'],
                'Shipping Template': item['Shipping Template'],
                'Min Profit': item['Min Profit'],
                'Current Price': item['Current Price'],
                'Current Quantity': item['Current Quantity']
            }
        });
        const worksheet = xlsx.utils.json_to_sheet(jsondata);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, "Products");
        const filePath = path.join(__dirname, 'Updated_inventory.xlsx');
        xlsx.writeFile(workbook, filePath);
        res.download(filePath, (err) => {
            if (err) {
                console.error('Error sending file:', err);
            }
            fs.unlinkSync(filePath);
        });

    } catch (err) {
        console.error('Error generating Excel sheet:', err);
        res.status(500).send('An error occurred while generating the Excel file.');
    }
};