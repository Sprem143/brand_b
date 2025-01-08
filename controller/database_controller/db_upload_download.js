const AvailableProduct = require('../../model/Brand_model/AvailableProduct');
const FinalProduct = require('../../model/Brand_model/finalProduct')
const Product = require('../../model/Brand_model/products');
const InvUpc = require('../../model/Inventory_model/invUpc');
const InvUrl1 = require('../../model/Inventory_model/invUrl1');
const InvProduct = require('../../model/Inventory_model/invProduct');
const AutoFetchData = require('../../model/Inventory_model/autofetchdata');
const Backup = require('../../model/Inventory_model/backup')
const Upc = require('../../model/Brand_model/upc');
const xlsx = require('xlsx')
const fs = require('fs');
const path = require('path');

// ---------brand search result------
exports.downloadfinalSheet = async (req, res) => {
    try {
        const amz = await AvailableProduct.find();
        const blk = await Product.find();
        const brand = amz[0].Brand;

        // Create a map for quick access to blk products by UPC
        const blkMap = new Map(blk.map(product => [product.upc, product]));
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

// ---------download upc list scrapped from brand url----------
exports.downloadExcel = async (req, res) => {
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
            fs.unlinkSync(filePath);
        });
    } catch (err) {
        console.log(err)
    }
}
// ---------download inventory updated sheet----------
exports.downloadInvSheet = async (req, res) => {
    try {
        const data = await AutoFetchData.find();
        var jsondata = data.map((item) => {
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
        console.log(jsondata.length)
        let udata = jsondata.filter((product, index, self) =>
            index === self.findIndex(p => p['Input UPC'] === product['Input UPC'])
        );
        console.log(data.length)

        const worksheet = xlsx.utils.json_to_sheet(udata);
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

// -----------upload asin-scope data-------------
exports.uploaddata = async (req, res) => {
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

exports.uploadinvdata = async (req, res) => {
    let backupdata = await AutoFetchData.find();
    const backup = new Backup({ data: backupdata });
    await backup.save();
    await InvProduct.deleteMany();
    await InvUrl1.deleteMany();
    await AutoFetchData.deleteMany();

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
    console.log(data1.length);
    const data = data1.filter((d) => d['ASIN'] !== undefined && d['Input UPC'] !== undefined);
    console.log(data.length)
    const modifiedurldata = data.map((d) => ({ ...d, 'Product link': d['Product link'].split(".html")[0] + ".html" }))
    if (modifiedurldata.length === 0) {
        console.log("no data")
        return res.status(400).json({ msg: 'No valid data to process' });
    }
    InvProduct.insertMany(modifiedurldata)
        .then(async () => {
            const uniqueUpc = modifiedurldata
                .map(item => item['Input UPC'].replace("UPC", "")) // Extract only the URLs
                .filter((upc, index, self) => self.indexOf(upc) === index);
            if (uniqueUpc.length > 0) {
                var upcs = new InvUpc({ upc: uniqueUpc });
                await upcs.save();
            }
        })
        .then(async () => {
            const uniqueUrls = modifiedurldata
                .map(item => item['Product link'])
                .filter((url, index, self) => self.indexOf(url) === index);

            if (uniqueUrls.length > 0) {
                let urls = new InvUrl1({ url: uniqueUrls });
                await urls.save();
                res.status(200).json({ msg: 'Data successfully uploaded' });
            } else {
                res.status(200).json({ msg: 'No unique URLs to process' });
            }
        })
        .catch(err => {
            console.error('Error saving data to MongoDB:', err);
            res.status(500).json({ msg: 'Error saving data to MongoDB' });
        });
};

exports.uploadinvdata2 = async (req, res) => {
    let backupdata = await AutoFetchData.find();
    const backup = new Backup({ data: backupdata });
    await backup.save();
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
            'ASIN':d.ASIN,
            'SKU':d['Amazon SKU'],
            'Product price': d['Product Cost'],
            'Available Quantity':0,
            'Product link': d['Vendor URL'].split(".html")[0] + ".html" ,
            'Fulfillment':d['Fulfillment Shipping'],
            'Amazon Fees%':d['Fees%'],
            'Shipping Template':d['Shipping template used on AZ']
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
                res.status(200).json({ msg: 'Data successfully uploaded' });
            } else {
                res.status(200).json({ msg: 'No unique URLs to process' });
            }
        })
        .catch(err => {
            console.error('Error saving data to MongoDB:', err);
            res.status(500).json({ msg: 'Error saving data to MongoDB' });
        });
};
