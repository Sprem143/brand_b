const AvailableProduct = require('../../model/Brand_model/AvailableProduct');
const FinalProduct = require('../../model/Brand_model/finalProduct')
const Product = require('../../model/Brand_model/products');
const InvUrl1 = require('../../model/Inventory_model/invUrl1');
const InvProduct = require('../../model/Inventory_model/invProduct');
const AutoFetchData = require('../../model/Inventory_model/autofetchdata');
const Backup = require('../../model/Inventory_model/backup')
const Outofstock = require('../../model/Inventory_model/outofstock')
const Exclude = require('../../model/Inventory_model/Exclude')
const xlsx = require('xlsx')
const fs = require('fs');
const path = require('path');
const Om = require('../../model/Masterdata/om');
const Bijak = require('../../model/Masterdata/bijak');
const Rcube = require('../../model/Masterdata/rcube')
const Zenith = require('../../model/Masterdata/zenith')
const {countDays} = require('../utils');

const generatesku = (upc, color, size) => {
    if (color && size) {

        size = size.slice(0, 4)
        color = color.replaceAll(' ', '-').replaceAll('/', '-').toUpperCase();
        let firstletter = color.charAt(0)
        color = color.slice(1)
        var modifiedColor = color
        if (color.length > 12) {
            let v = ['A', 'E', 'I', 'O', 'U'];
            for (let i of v) {
                modifiedColor = color.replaceAll(i, '');
                color = modifiedColor
            }
        }
        if (color.length > 12) {
            let arr = color.split('-');
            for (let i = 0; i < arr.length; i++) {
                arr[i] = arr[i].slice(0, 3)
            }
            color = arr.join('-')
        }
        let sku = 'RC-R1-' + upc + '-' + firstletter + color + '-' + size
        sku.replaceAll('---', '-')
        sku.replaceAll('--', '-')
        return sku;
    } else {
        return null
    }
}
// ---------brand search result------
exports.downloadfinalSheet = async (req, res) => {
    try {

        let data = await FinalProduct.find();
        if (data.length > 0) {
            res.status(200).json({ status: true, data: data })
        } else {
            res.status(404).json({ status: false, msg: "Server error" })
        }

    } catch (err) {
        console.error('Error generating Excel sheet:', err);
        res.status(500).send('An error occurred while generating the Excel file.');
    }
};


exports.downloadExcel = async (req, res) => {
    try {
        const data = await Product.find({}, { upc: 1, _id: 0 });
        const jsondata = data.map((d) => ({
            UPC: d.upc
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
            fs.unlinkSync(filePath);
        });
    } catch (err) {
        console.log(err)
    }
}
// ---------download inventory updated sheet----------

function getDateDifference(date1) {
    // Convert dd/mm/yyyy to Date object
    const [d1, m1, y1] = date1.split("/").map(Number);
    const [d2, m2, y2] = new Date().toLocaleDateString("en-GB").split("/").map(Number);

    const firstDate = new Date(y1, m1 - 1, d1);
    const secondDate = new Date(y2, m2 - 1, d2);

    const diffTime = Math.abs(secondDate - firstDate);

    // Convert milliseconds to days
    const diff = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diff > 28 ? true : false
}

exports.downloadInvSheet = async (req, res) => {
    try {
        let prevoos = await Outofstock.find({}, {ASIN:1, _id: 0});
        prevoos = prevoos.map(p=> p.ASIN)
        const data = await AutoFetchData.find({ 'Current Quantity': { $gt: 0 }})
        let updated = data.map(d=> d.ASIN)
        
        for( let p of prevoos){
            if(updated.includes(p)){
                await Outofstock.findOneAndDelete({ASIN: p})
            }
        }

        let updatedproduct = await AutoFetchData.find();
        var jsondata = updatedproduct.map((item) => {
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
                'Current Quantity': item['Current Quantity'],
                'Out Of stock From Date' : item['outofstock']? item['outofstock'] : '',
                'Out of stock days': item['outofstock']?countDays(item['outofstock']):null
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


const getproducttype = (title) => {
    if (title) {
        const collection = {
            'Shoes': 14, 'Shoe': 14, 'Sandal': 13, 'Sandals': 13, 'Booties': 16, 'Boot': 16, 'Boots': 16, 'Clog': 14, 'Clogs': 14,
            'Slippers': 13, 'Slipper': 13, 'Loafer': 14, 'Loafers': 14, 'Sneaker': 14, 'Sneakers': 14, 'T-Shirt': 11.5, 'T-Shirts': 11.5,
            'Jeans': 13, 'Jean': 13, 'Shorts': 11.5, 'Short': 11.5, 'Shirts': 11.5, 'Shirt': 11.5, 'Pants': 11.5, 'Pant': 11.5,
            'Hoodie': 15, 'Pullover': 15, 'Sweatshirt': 13, 'Sweatshirts': 13, 'Jacket': 15, 'Jackets': 15, 'Blazer': 21,
            'Blazers': 21, 'Kurta': 11.5, 'Legging': 11.5, 'Kurti': 11.5, 'Bra': 10.5, 'Panty': 10.5, 'Panties': 10.5, 'Underwear': 10.5, 'Brief': 10.5, 'Briefs': 10.5,
            'Hipster': 10.5, 'Cardigan': 11.5, 'Neck Top': 11.5, 'Tank Top': 11.5, 'Skirt': 11.5, 'Open Front': 11.5, 'Peasant Top': 11.5,
            'Scoop Neck': 11.5, 'Flat': 13
        }

        const normalizedTitle = title.trim().toLowerCase();

        // Iterate through the collection object
        for (const [key, price] of Object.entries(collection)) {
            if (normalizedTitle.includes(key.toLowerCase())) {
                return price; // Return the price if a match is found
            }
        }

        return '#';
    } else {
        return '#'
    }
}

// -----------upload asin-scope data-------------
exports.uploaddata = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).send('No file uploaded.');
        }
        const workbook = xlsx.readFile(file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);
        const filteredData = data.filter(row => row.ASIN !== '-');
        await AvailableProduct.deleteMany();
        await FinalProduct.deleteMany();
        await AvailableProduct.insertMany(filteredData);
        const amz = filteredData ? filteredData : await AvailableProduct.find();
        const blk = await Product.find();
        const brand = amz[0].Brand;
        const blkMap = new Map(blk.map(product => [product.upc, product]));
        const jsondata = amz.map((item) => {
            const blkItem = blkMap.get(item.UPC);
            return {
                'Input EAN': 'UPC' + item.UPC,
                'SKU': blkItem ? blkItem.sku : '',
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
                'Fulfillment Shipping': getproducttype(blkItem.name),
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
        await FinalProduct.insertMany(newJson)

        res.status(200).send("File uploaded successfully")
    } catch (err) {
        console.log(err);
        res.send(err);
    }
};


exports.uploadforcheck = async (req, res) => {
    try {

        const file = req.file;
        if (!file) {
            return res.status(400).send('No file uploaded.');
        }
        await FinalProduct.deleteMany();
        const workbook = xlsx.readFile(file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);
        const filteredData = data.filter(row => row.ASIN !== '-');
        const jsondata = filteredData.map((d) => {
            return {
                'Input EAN': d['Input EAN'],
                'ASIN': d.ASIN,
                'Amazon link': d['Amazon link'] || `https://www.amazon.com/dp/${d.ASIN}`,
                'Belk link': d['Belk link'],
                'EAN List': d['EAN List'],
                'MPN': d.MPN,
                'ISBN': d.ISBN,
                'Title': d.Title,
                'Brand': d.Brand,
                'Dimensions (in)': d['Dimensions (in)'],
                'Weight (lb)': d['Weight (lb)'],
                'Image link': d['Image link'],
                'Lowest Price (USD)': d['Lowest Price (USD)'],
                'Number of Sellers': d['Number of Sellers'],
                'BSR': d.BSR,
                'Product Category': d['Product Category'],
                'Buy Box Price (USD)': d['Buy Box Price (USD)'],
                'FBA Fees': d['FBA Fees'],
                'Fees Breakdown': d['Fees Breakdown'],
                'Product id': d['Product id'],
                'UPC': d.UPC || 'UPC' + d['Input EAN'],
                'Fulfillment Shipping': getproducttype(d.Title),
                'Available Quantity': d['Available Quantity'],
                'Product name': d['Product name'],
                'Product Currency': d['Product Currency'],
                'Product price': d['Product price'],
                'Category': d['Category'],
                'Soldby': d['Soldby'],
                'Size': d['Size'],
                'Color': d['Color'],
                'isCheked': d.isChecked,
                SKU: d.SKU || generatesku(d['UPC'], d.Color, d.Size),
                'Any other variations': d['Any other variations'],
            };
        });
        await FinalProduct.insertMany(jsondata)

        res.status(200).send("File uploaded successfully")
    } catch (err) {
        console.log(err);
        res.send(err);
    }
};

exports.uploadinvdata = async (req, res) => {
    let backupdata = await AutoFetchData.find();
    if (backupdata.length > 0) {
        let account = backupdata[0].SKU.includes('BJ')? 'Bijak' : backupdata[0].SKU.includes('RC')? 'Rcube': backupdata[0].SKU.includes('ZL')? 'Zenith' : backupdata[0].SKU.includes('OM')? 'Om' : null
        const backup = new Backup({ data: backupdata, length: backupdata.length, account:account });
        await backup.save();
    }
    await InvProduct.deleteMany();
    await InvUrl1.deleteMany();
    await AutoFetchData.deleteMany();

    const file = req.file;
    if (!file) {
        return res.status(400).send('No file uploaded.');
    }
    // Load the uploaded Excel file
    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[0]; 
    const sheet = workbook.Sheets[sheetName];

    // Convert the sheet to JSON
    const data1 = xlsx.utils.sheet_to_json(sheet);
    const data = data1.filter((d) => d['ASIN'] !== undefined && d['Input UPC'] !== undefined);
    const modifiedurldata = data.map((d) => ({ ...d, 'Product link': d['Product link'].split('.html')[0]+'.html' }))
    if (modifiedurldata.length === 0) {
        return res.status(400).json({ msg: 'No valid data to process' });
    }
    InvProduct.insertMany(modifiedurldata)
        .then(async () => {
            const uniqueUrls = modifiedurldata
                .map(item => item['Product link'])
                .filter((url, index, self) => self.indexOf(url) === index);

            if (uniqueUrls.length > 0) {
                let urls = new InvUrl1({ url: uniqueUrls });
                await urls.save();
                res.status(200).json({ status: true, msg: 'Data successfully uploaded' });
            } else {
                res.status(200).json({ status: false, msg: 'No unique URLs to process' });
            }
        })
        .catch(err => {
            console.error('Error saving data to MongoDB:', err);
            res.status(500).json({ msg: 'Error saving data to MongoDB' });
        });
};

// -----------upload ---master sheet 
exports.uploadmastersheet = async (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).send('No file uploaded.');
    }
    // Load the uploaded Excel file
    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[0]; 
    const sheet = workbook.Sheets[sheetName];

    // Convert the sheet to JSON
    const data1 = xlsx.utils.sheet_to_json(sheet);
    const data = data1.filter((d) => d['ASIN'] !== undefined && d['Input UPC'] !== undefined);
    const modifiedurldata = data.map((d) => ({ ...d, 'Product link': d['Product link'] }))
    if (modifiedurldata.length === 0) {
        return res.status(400).json({ msg: 'No valid data to process' });
    }

};
// ----------------- upload belk source file---------

exports.uploadinvdata2 = async (req, res) => {
    let backupdata = await AutoFetchData.find();
    if (backupdata.length > 0) {
        let account = backupdata[0].SKU.includes('BJ')? 'Bijak' : backupdata[0].SKU.includes('RC')? 'Rcube': backupdata[0].SKU.includes('ZL')? 'Zenith' : backupdata[0].SKU.includes('OM')? 'Om' : null
        const backup = new Backup({ data: backupdata, length: backupdata.length, account:account });
        await backup.save();
    }
    await InvProduct.deleteMany();
    await InvUrl1.deleteMany();
    await AutoFetchData.deleteMany();
    const file = req.file;
    if (!file) {
        return res.status(400).send('No file uploaded.');
    }

    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[2]; // Read first sheet
    const sheet = workbook.Sheets[sheetName];

    const data1 = xlsx.utils.sheet_to_json(sheet);
    const data = data1.filter((d) => d['ASIN'] !== undefined && d['upc'] !== undefined);
    const modifiedurldata = data.map((d) =>
    ({
        'Input UPC': d['For Scrapping use'],
        'ASIN': d.ASIN,
        'SKU': d['Amazon SKU'],
        'Product price': d['Product Cost'],
        'Available Quantity': 0,
        'Product link': d['Vendor URL'].split(".html")[0] + ".html",
        'Fulfillment': d['Fulfillment Shipping'],
        'Amazon Fees%': d['Fees%'],
        'Shipping Template': d['Shipping template used on AZ'],
        'Brand Name':d['Brand Name'],
        'Amazon Title':d['Amazon Title']
    }))
    if (modifiedurldata.length === 0) {
        return res.status(400).json({ msg: 'No valid data to process' });
    }
    InvProduct.insertMany(modifiedurldata)
        .then(async () => {
            const uniqueUrls = modifiedurldata
                .map(item => item['Product link'])
                .filter((url, index, self) => self.indexOf(url) === index);

            if (uniqueUrls.length > 0) {
                let urls = new InvUrl1({ url: uniqueUrls });
                await urls.save();
                res.status(200).json({ status: true, msg: 'Data successfully uploaded' });
            } else {
                res.status(200).json({ status: false, msg: 'No unique URLs to process' });
            }
        })
        .catch(err => {
            console.error('Error saving data to MongoDB:', err);
            res.status(500).json({ msg: 'Error saving data to MongoDB' });
        });
};

// ---------download final product list for check---
exports.deletedata = async (req, res) => {
    try {
        let resp = await FinalProduct.deleteMany()
        res.status(200).json({ status: true })
    } catch (err) {
        console.log(err);
        res.stauts(500).json({ status: false })
    }
}

// ----------download row product list fetch from url----
exports.downloadProductExcel = async (req, res) => {
    try {
        console.log("LOcal download")
        let productlist = await Product.find();
        let rc = await Rcube.find({}, { UPC: 1, _id: 0 })
        rc = rc.map((r) => r.UPC)

        let zl = await Zenith.find({}, { UPC: 1, _id: 0 })
        zl = zl.map((r) => r.UPC)

        let om = await Om.find({}, { UPC: 1, _id: 0 })
        om = om.map((r) => r.UPC)

        let bj = await Bijak.find({}, { UPC: 1, _id: 0 })
        bj = bj.map((r) => r.UPC)
        let count = 0
        for (let p of productlist) {
            if (rc.includes(p.upc) || zl.includes(p.upc) || om.includes(p.upc) || bj.includes(p.upc)) {
                await Product.findOneAndDelete({ upc: p.upc });
                count += 1;
            }
        }
        const products = await Product.find();
        if (productlist.length > 0) {
            res.status(200).json({ status: true, data: products, count: count })
        } else {
            res.status(404).json({ status: true, msg: "No data found" })
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: false, msg: err })
    }
}

exports.uploadinvdata3 = async (req, res) => {
    let backupdata = await AutoFetchData.find();
    if (backupdata.length > 0) {
        let account = backupdata[0].SKU.includes('BJ')? 'Bijak' : backupdata[0].SKU.includes('RC')? 'Rcube': backupdata[0].SKU.includes('ZL')? 'Zenith' : backupdata[0].SKU.includes('OM')? 'Om' : null
        const backup = new Backup({ data: backupdata, length: backupdata.length, account:account });
        await backup.save();
    }
    await InvProduct.deleteMany();
    await InvUrl1.deleteMany();
    await AutoFetchData.deleteMany();
    const file = req.file;
    if (!file) {
        return res.status(400).send('No file uploaded.');
    }

    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[3]; // Read first sheet
    const sheet = workbook.Sheets[sheetName];

    const data1 = xlsx.utils.sheet_to_json(sheet);
    const data = data1.filter((d) => d['ASIN'] !== undefined && d['upc'] !== undefined);
    const modifiedurldata = data.map((d) =>
    ({
        'Input UPC': d['For Scrapping use'],
        'ASIN': d.ASIN,
        'SKU': d['Amazon SKU'],
        'Product price': d['Product Cost'],
        'Available Quantity': 0,
        'Product link': d['Vendor URL'].split('.html')[0]+'.html',
        'Fulfillment': d['Fulfillment Shipping'],
        'Amazon Fees%': d['Fees%'],
        'Shipping Template': d['Shipping template used on AZ'],
        'Brand Name':d['Brand Name'],
        'Amazon Title':d['Amazon Title']
    }))
    if (modifiedurldata.length === 0) {
        console.log("no data")
        return res.status(400).json({ msg: 'No valid data to process' });
    }
    InvProduct.insertMany(modifiedurldata)
        .then(async () => {
            const uniqueUrls = modifiedurldata
                .map(item => item['Product link'])
                .filter((url, index, self) => self.indexOf(url) === index);

            if (uniqueUrls.length > 0) {
                let urls = new InvUrl1({ url: uniqueUrls });
                await urls.save();
                res.status(200).json({ status: true, msg: 'Data successfully uploaded' });
            } else {
                res.status(200).json({ msg: 'No unique URLs to process' });
            }
        })
        .catch(err => {
            console.error('Error saving data to MongoDB:', err);
            res.status(500).json({ msg: 'Error saving data to MongoDB' });
        });
};


