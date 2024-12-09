const MInvUrl = require('../../model/Manual_inv/invUrl')
const MInvUpc= require('../../model/Manual_inv/invUpc');
const MInvProduct = require('../../model/Manual_inv/invProduct');
const MBackup= require('../../model/Manual_inv/backup');
const MAutoFetchData= require('../../model/Manual_inv/autofetchdata');
const MNoProduct= require('../../model/Manual_inv/noProduct');
const MSerial= require('../../model/Manual_inv/serial')
const xlsx = require('xlsx');

exports.getinvlinks = async(req, res) => {
    try {
        let result1 = await MInvUrl.find();
        res.status(200).json({ links1: result1 })
    } catch (err) {
        console.log(err);
    }
}

exports.settime = async(req, res) => {

    const num = req.body.time

    MSerial.findOneAndUpdate({}, { time: num }, { new: true })
        .then(updatedDoc => {
            if (updatedDoc) {
                res.status(200).json({ status: true })
            }
        })
        .catch(error => {
            console.error("Error updating document:", error);
        });
}


exports.Muploadinvdata = async(req, res) => {
    console.log("upload function called")
    let backupdata= await MInvProduct.find();
    const backup= new MBackup({data:backupdata});
    await backup.save();
    await MInvProduct.deleteMany();
    await MInvUrl.deleteMany();
    await MInvUpc.deleteMany();
    await MAutoFetchData.deleteMany();
    await MNoProduct.deleteMany();
    await MSerial.deleteMany();
    let serialNum = new MSerial({ start_index1: 0, start_index2: 0, start_index3: 0, start_index4: 0, start_index5: 0, start_index6: 0, start_index7: 0, start_index8: 0,start_error_index:0, time: 0 });
    await serialNum.save();

    const file = req.file;
    if (!file) {
        return res.status(400).send('No file uploaded.');
    }
    // Load the uploaded Excel file
    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[2]; // Read first sheet
    const sheet = workbook.Sheets[sheetName];

    // Convert the sheet to JSON
    const data1 = xlsx.utils.sheet_to_json(sheet);
console.log(data1.length)
    const data = data1.filter((d) => d['SKUs'] !== 'RC-R1--');
    if (data.length === 0) {
        return res.status(400).json({ msg: 'No valid data to process' });
    }
console.log(data.length)
    MInvProduct.insertMany(data)
        .then(async() => {
            const uniqueUpc = data
                .map(item => item['upc']) // Extract only the URLs
                .filter((upc, index, self) => self.indexOf(upc) === index);
            if (uniqueUpc.length > 0) {
                var upcs = new MInvUpc({ upc: uniqueUpc });
                await upcs.save();
            }
        })
        .then(async() => {
            const uniqueUrls = data
                .map(item => item['Vendor URL'].split(".html")[0] + ".html")
                .filter((url, index, self) => self.indexOf(url) === index);
console.log("url", uniqueUrls.length)
            if (uniqueUrls.length > 0) {
              const urls= new MInvUrl({url:uniqueUrls});
              await urls.save();
              res.status(200).json({ msg: 'File uploaded Successfully' });
            } else {
                res.status(200).json({ msg: 'No unique URLs to process' });
            }
        })
        .catch(err => {
            console.error('Error saving data to MongoDB:', err);
            res.status(500).json({ msg: 'Error saving data to MongoDB' });
        });
};

exports.geterrorurl = async(req, res) => {
    try {
        let resultData = await MNoProduct.find();
        let arr= resultData.map((r)=> r.url);
        res.status(200).json({links:arr})
    } catch (err) {
        console.log(err);
        res.send(err)
    }
}
exports.getupdatedproduct = async(req, res) => {
    try {
        let num = await MAutoFetchData.find();
        res.status(200).send(num)
    } catch (err) {
        console.log(err)
    }
}

exports.getbackup = async(req, res) => {
    try {
        let resultData = await MBackup.find();
        console.log(resultData);
        res.status(200).send(resultData);
    } catch (err) {
        console.log(err);
        res.send(err)
    }
}

exports.remainingdata=async(req,res)=>{
try{
let products= await MInvProduct.find();
let result= await MAutoFetchData.find();

let p= products.map((d)=> d.upc)
let q= result.map((d)=> d.upc);
let r= p.filter((d)=> !q.includes(d))
res.send(r);
}catch(err){
    console.log(err);
    res.send(err);
}
}
