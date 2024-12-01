const AvailableProduct = require('../../model/Brand_model/AvailableProduct');
const FinalProduct = require('../../model/Brand_model/finalProduct')
const Product = require('../../model/Brand_model/products');
const Serial = require('../../model/Inventory_model/serial')
const InvUpc = require('../../model/Inventory_model/invUpc');
const InvUrl1 = require('../../model/Inventory_model/invUrl1');
const InvUrl2 = require('../../model/Inventory_model/invUrl2');
const InvUrl3 = require('../../model/Inventory_model/invUrl3');
const InvUrl4 = require('../../model/Inventory_model/invUrl4');
const InvUrl5 = require('../../model/Inventory_model/invUrl5');
const InvUrl6 = require('../../model/Inventory_model/invUrl6');
const InvUrl7 = require('../../model/Inventory_model/invUrl7');
const InvUrl8 = require('../../model/Inventory_model/invUrl8');
const NoProduct= require('../../model/Inventory_model/noProduct')
const InvProduct = require('../../model/Inventory_model/invProduct');
const AutoFetchData = require('../../model/Inventory_model/autofetchdata');
const Backup= require('../../model/Inventory_model/backup')
const Upc = require('../../model/Brand_model/upc');
const xlsx = require('xlsx')
const fs = require('fs');
const path = require('path');


// ---------brand search result------
exports.downloadfinalSheet = async(req, res) => {
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
            fs.unlinkSync(filePath);
        });
    } catch (err) {
        console.log(err)
    }
}
// ---------download inventory updated sheet----------
exports.downloadInvSheet = async(req, res) => {
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
       let udata=jsondata.filter((product, index, self) => 
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

// ----------- upload file for invontory update-------
const donetwo = async(arr) => {
    if (arr.length === 0) return;
    if (arr.length === 1) {
        ar1 = new InvUrl1({ url: arr });
        await ar1.save();
        return true;
    }
    const middleIndex = Math.ceil(arr.length / 2);
    const firstHalf = arr.slice(0, middleIndex);
    var urls1 = new InvUrl1({ url: firstHalf });
    urls1.save();
    if (middleIndex < arr.length) {
        const secondHalf = arr.slice(middleIndex);
        var urls2 = new InvUrl2({ url: secondHalf });
        urls2.save();
    }
};

const dthreefour = async(arr) => {
    if (arr.length === 0) return;
    if (arr.length === 1) {
        ar1 = new InvUrl3({ url: arr });
        await ar1.save();
        return true;
    }
    const middleIndex = Math.ceil(arr.length / 2);
    const firstHalf = arr.slice(0, middleIndex);
    var urls3 = new InvUrl3({ url: firstHalf });
    urls3.save();
    if (middleIndex < arr.length) {
        const secondHalf = arr.slice(middleIndex);
        var urls4 = new InvUrl4({ url: secondHalf });
        urls4.save();
    }
};

const dfivesix = async(arr) => {
    if (arr.length === 0) return;
    if (arr.length === 1) {
        ar1 = new InvUrl5({ url: arr });
        await ar1.save();
        return true;
    }
    const middleIndex = Math.ceil(arr.length / 2);
    const firstHalf = arr.slice(0, middleIndex);
    var urls3 = new InvUrl5({ url: firstHalf });
    urls3.save();
    if (middleIndex < arr.length) {
        const secondHalf = arr.slice(middleIndex);
        var urls6 = new InvUrl6({ url: secondHalf });
        urls6.save();
    }
};

const dseveneight = async(arr) => {
    if (arr.length === 0) return;
    if (arr.length === 1) {
        ar1 = new InvUrl7({ url: arr });
        await ar1.save();
        return true;
    }
    const middleIndex = Math.ceil(arr.length / 2);
    const firstHalf = arr.slice(0, middleIndex);
    var urls3 = new InvUrl7({ url: firstHalf });
    const r1 = urls3.save();
    if (middleIndex < arr.length) {
        const secondHalf = arr.slice(middleIndex);
        var urls4 = new InvUrl8({ url: secondHalf });
        urls4.save();
    }
};

const divideArray1 = async(arr) => {
    if (arr.length === 0) return;
    if (arr.length === 1) {
        ar1 = new InvUrl1({ url: arr });
        await ar1.save();
        return true;
    }
    const middleIndex = Math.ceil(arr.length / 2);
    const firstHalf = arr.slice(0, middleIndex);
    const secondHalf = arr.slice(middleIndex);
    donetwo(firstHalf);
    dthreefour(secondHalf);
};

const divideArray2 = async(arr) => {
    if (arr.length === 0) return;
    if (arr.length === 1) {
        ar1 = new InvUrl2({ url: arr });
        await ar1.save();
    }
    const middleIndex = Math.ceil(arr.length / 2);
    const firstHalf = arr.slice(0, middleIndex);

    const secondHalf = arr.slice(middleIndex);
    dfivesix(firstHalf);
    dseveneight(secondHalf);
};

exports.uploadinvdata = async(req, res) => {
    let backupdata= await AutoFetchData.find();
    const backup= new Backup({data:backupdata});
    await backup.save();
    await InvProduct.deleteMany();
    await InvUrl1.deleteMany();
    await InvUrl2.deleteMany();
    await InvUrl3.deleteMany();
    await InvUrl4.deleteMany();
    await InvUrl5.deleteMany();
    await InvUrl6.deleteMany();
    await InvUrl7.deleteMany();
    await InvUrl8.deleteMany();
    await InvUpc.deleteMany();
    await AutoFetchData.deleteMany();
    await NoProduct.deleteMany();
    await Serial.deleteMany();
    let serialNum = new Serial({ start_index1: 0, start_index2: 0, start_index3: 0, start_index4: 0, start_index5: 0, start_index6: 0, start_index7: 0, start_index8: 0,start_error_index:0, time: 0 });
    await serialNum.save();

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
    const data = data1.filter((d) => d['ASIN'] !== undefined && d['Input UPC'] !== undefined);
    if (data.length === 0) {
        console.log("no data")
        return res.status(400).json({ msg: 'No valid data to process' });
    }
    InvProduct.insertMany(data)
        .then(async() => {
            const uniqueUpc = data
                .map(item => item['Input UPC'].replace("UPC", "")) // Extract only the URLs
                .filter((upc, index, self) => self.indexOf(upc) === index);
            if (uniqueUpc.length > 0) {
                var upcs = new InvUpc({ upc: uniqueUpc });
                await upcs.save();
            }
        })
        .then(async() => {
            const uniqueUrls = data
                .map(item => item['Product link'].split(".html")[0] + ".html")
                .filter((url, index, self) => self.indexOf(url) === index);

            if (uniqueUrls.length > 0) {
                const middleIndex = Math.ceil(uniqueUrls.length / 2);
                const firstHalf = uniqueUrls.slice(0, middleIndex);
                divideArray1(firstHalf);
                const secondHalf = uniqueUrls.slice(middleIndex);
                divideArray2(secondHalf)
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
