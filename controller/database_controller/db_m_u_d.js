const MInvUrl1 = require('../../model/Manual_inv/invUrl1')
const MInvUrl2 = require('../../model/Manual_inv/invUrl2')
const MInvUrl3 = require('../../model/Manual_inv/invUrl3')
const MInvUrl4 = require('../../model/Manual_inv/invUrl4')
const MInvUrl5 = require('../../model/Manual_inv/invUrl5')
const MInvUrl6 = require('../../model/Manual_inv/invUrl6')
const MInvUrl7 = require('../../model/Manual_inv/invUrl7')
const MInvUrl8 = require('../../model/Manual_inv/invUrl8')
const MInvUpc= require('../../model/Manual_inv/invUpc');
const MInvProduct = require('../../model/Manual_inv/invProduct');
const MBackup= require('../../model/Manual_inv/backup');
const MAutoFetchData= require('../../model/Manual_inv/autofetchdata');
const MNoProduct= require('../../model/Manual_inv/noProduct');
const MSerial= require('../../model/Manual_inv/serial')
const xlsx = require('xlsx')
const fs = require('fs');
const path = require('path');


exports.getinvlinks = async(req, res) => {
    try {
        let result1 = await MInvUrl1.find();
        let result2 = await MInvUrl2.find();
        let result3 = await MInvUrl3.find();
        let result4 = await MInvUrl4.find();
        let result5 = await MInvUrl5.find();
        let result6 = await MInvUrl6.find();
        let result7 = await MInvUrl7.find();
        let result8 = await MInvUrl8.find();

        res.status(200).json({ links1: result1, links2: result2, links3: result3, links4: result4, links5: result5, links6: result6, links7: result7, links8: result8, })
    } catch (err) {
        console.log(err);
    }
}


exports.setindex = async(req, res) => {
    const num = req.body.start_index
    MSerial.findOneAndUpdate({}, { start_index1: num }, { new: true })
        .then(updatedDoc => {
            if (updatedDoc) {
                res.status(200).json({ status: true, index: num })
            }
        })
        .catch(error => {
            console.error("Error updating document:", error);
        });
}

exports.setindex2 = async(req, res) => {
    const num = req.body.start_index
    MSerial.findOneAndUpdate({}, { start_index2: num }, { new: true })
        .then(updatedDoc => {
            if (updatedDoc) {
                res.status(200).json({ status: true, index: num })
            }
        })
        .catch(error => {
            console.error("Error updating document:", error);
        });
}

exports.setindex3 = async(req, res) => {
    const num = req.body.start_index
    MSerial.findOneAndUpdate({}, { start_index3: num }, { new: true })
        .then(updatedDoc => {
            if (updatedDoc) {
                res.status(200).json({ status: true, index: num })
            }
        })
        .catch(error => {
            console.error("Error updating document:", error);
        });
}

exports.setindex4 = async(req, res) => {
    const num = req.body.start_index
    MSerial.findOneAndUpdate({}, { start_index4: num }, { new: true })
        .then(updatedDoc => {
            if (updatedDoc) {
                res.status(200).json({ status: true, index: num })
            }
        })
        .catch(error => {
            console.error("Error updating document:", error);
        });
}
exports.setindex5 = async(req, res) => {
    const num = req.body.start_index
    MSerial.findOneAndUpdate({}, { start_index5: num }, { new: true })
        .then(updatedDoc => {
            if (updatedDoc) {
                res.status(200).json({ status: true, index: num })
            }
        })
        .catch(error => {
            console.error("Error updating document:", error);
        });
}
exports.setindex6 = async(req, res) => {
    const num = req.body.start_index
    MSerial.findOneAndUpdate({}, { start_index6: num }, { new: true })
        .then(updatedDoc => {
            if (updatedDoc) {
                res.status(200).json({ status: true, index: num })
            }
        })
        .catch(error => {
            console.error("Error updating document:", error);
        });
}

exports.setindex7 = async(req, res) => {
    const num = req.body.start_index
    MSerial.findOneAndUpdate({}, { start_index7: num }, { new: true })
        .then(updatedDoc => {
            if (updatedDoc) {
                res.status(200).json({ status: true, index: num })
            }
        })
        .catch(error => {
            console.error("Error updating document:", error);
        });
}

exports.setindex8 = async(req, res) => {
    const num = req.body.start_index
    MSerial.findOneAndUpdate({}, { start_index8: num }, { new: true })
        .then(updatedDoc => {
            if (updatedDoc) {
                res.status(200).json({ status: true, index: num })
            }
        })
        .catch(error => {
            console.error("Error updating document:", error);
        });
}
exports.seterrorindex = async(req, res) => {
    const num = req.body.start_index;
    console.log(num)
    MSerial.findOneAndUpdate({}, { start_error_index: num }, { new: true })
        .then(updatedDoc => {
            if (updatedDoc) {
                res.status(200).json({ status: true, index: num })
            }
        })
        .catch(error => {
            console.error("Error updating document:", error);
        });
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



// ----------- upload file for invontory update-------
const donetwo = async(arr) => {
    if (arr.length === 0) return;
    if (arr.length === 1) {
        ar1 = new MInvUrl1({ url: arr });
        await ar1.save();
        return true;
    }
    const middleIndex = Math.ceil(arr.length / 2);
    const firstHalf = arr.slice(0, middleIndex);
    var urls1 = new MInvUrl1({ url: firstHalf });
    urls1.save();
    if (middleIndex < arr.length) {
        const secondHalf = arr.slice(middleIndex);
        var urls2 = new MInvUrl2({ url: secondHalf });
        urls2.save();
    }
};

const dthreefour = async(arr) => {
    if (arr.length === 0) return;
    if (arr.length === 1) {
        ar1 = new MInvUrl3({ url: arr });
        await ar1.save();
        return true;
    }
    const middleIndex = Math.ceil(arr.length / 2);
    const firstHalf = arr.slice(0, middleIndex);
    var urls3 = new MInvUrl3({ url: firstHalf });
    urls3.save();
    if (middleIndex < arr.length) {
        const secondHalf = arr.slice(middleIndex);
        var urls4 = new MInvUrl4({ url: secondHalf });
        urls4.save();
    }
};

const dfivesix = async(arr) => {
    if (arr.length === 0) return;
    if (arr.length === 1) {
        ar1 = new MInvUrl5({ url: arr });
        await ar1.save();
        return true;
    }
    const middleIndex = Math.ceil(arr.length / 2);
    const firstHalf = arr.slice(0, middleIndex);
    var urls3 = new MInvUrl5({ url: firstHalf });
    urls3.save();
    if (middleIndex < arr.length) {
        const secondHalf = arr.slice(middleIndex);
        var urls6 = new MInvUrl6({ url: secondHalf });
        urls6.save();
    }
};

const dseveneight = async(arr) => {
    if (arr.length === 0) return;
    if (arr.length === 1) {
        ar1 = new MInvUrl7({ url: arr });
        await ar1.save();
        return true;
    }
    const middleIndex = Math.ceil(arr.length / 2);
    const firstHalf = arr.slice(0, middleIndex);
    var urls3 = new MInvUrl7({ url: firstHalf });
    const r1 = urls3.save();
    if (middleIndex < arr.length) {
        const secondHalf = arr.slice(middleIndex);
        var urls4 = new MInvUrl8({ url: secondHalf });
        urls4.save();
    }
};

const divideArray1 = async(arr) => {
    if (arr.length === 0) return;
    if (arr.length === 1) {
        ar1 = new MInvUrl1({ url: arr });
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
        ar1 = new MInvUrl2({ url: arr });
        await ar1.save();
    }
    const middleIndex = Math.ceil(arr.length / 2);
    const firstHalf = arr.slice(0, middleIndex);

    const secondHalf = arr.slice(middleIndex);
    dfivesix(firstHalf);
    dseveneight(secondHalf);
};

exports.Muploadinvdata = async(req, res) => {
    console.log("upload function called")
    let backupdata= await MInvProduct.find();
    const backup= new MBackup({data:backupdata});
    await backup.save();
    await MInvProduct.deleteMany();
    await MInvUrl1.deleteMany();
    await MInvUrl2.deleteMany();
    await MInvUrl3.deleteMany();
    await MInvUrl4.deleteMany();
    await MInvUrl5.deleteMany();
    await MInvUrl6.deleteMany();
    await MInvUrl7.deleteMany();
    await MInvUrl8.deleteMany();
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

exports.getserialnumber = async(req, res) => {
    try {
        const num = await MSerial.find();
        res.status(200).send(num[0])
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};

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
