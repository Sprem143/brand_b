const BrandUrl = require('../../model/brandurl');
const Product = require('../../model/products');
const Serial = require('../../model/serial')
const InvUrl1 = require('../../model/invUrl1');
const InvUrl2 = require('../../model/invUrl2');
const InvUrl3 = require('../../model/invUrl3');
const InvUrl4 = require('../../model/invUrl4');
const InvUrl5 = require('../../model/invUrl5');
const InvUrl6 = require('../../model/invUrl6');
const InvUrl7 = require('../../model/invUrl7');
const InvUrl8 = require('../../model/invUrl8');
const AutoFetchData = require('../../model/autofetchdata');
const Backup= require('../../model/backup')
const Upc = require('../../model/upc');
const xlsx = require('xlsx')
const fs = require('fs');
const path = require('path');




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




// ------send inventory products links to home page---
exports.getinvlinks = async(req, res) => {
    try {

        let result1 = await InvUrl1.find();
        let result2 = await InvUrl2.find();
        let result3 = await InvUrl3.find();
        let result4 = await InvUrl4.find();
        let result5 = await InvUrl5.find();
        let result6 = await InvUrl6.find();
        let result7 = await InvUrl7.find();
        let result8 = await InvUrl8.find();

        res.status(200).json({ links1: result1, links2: result2, links3: result3, links4: result4, links5: result5, links6: result6, links7: result7, links8: result8, })
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


// --------update serial number----------
exports.getserialnumber = async(req, res) => {
    try {
        const num = await Serial.find();
        res.status(200).send(num[0])
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};

exports.setindex = async(req, res) => {
    const num = req.body.start_index
    Serial.findOneAndUpdate({}, { start_index1: num }, { new: true })
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
    Serial.findOneAndUpdate({}, { start_index2: num }, { new: true })
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
    Serial.findOneAndUpdate({}, { start_index3: num }, { new: true })
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
    Serial.findOneAndUpdate({}, { start_index4: num }, { new: true })
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
    Serial.findOneAndUpdate({}, { start_index5: num }, { new: true })
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
    Serial.findOneAndUpdate({}, { start_index6: num }, { new: true })
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
    Serial.findOneAndUpdate({}, { start_index7: num }, { new: true })
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
    Serial.findOneAndUpdate({}, { start_index8: num }, { new: true })
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
    Serial.findOneAndUpdate({}, { start_error_index: num }, { new: true })
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

    Serial.findOneAndUpdate({}, { time: num }, { new: true })
        .then(updatedDoc => {
            if (updatedDoc) {
                res.status(200).json({ status: true })
            }
        })
        .catch(error => {
            console.error("Error updating document:", error);
        });
}

exports.getupdatedproduct = async(req, res) => {
    try {
        let num = await AutoFetchData.countDocuments();
        res.status(200).json({ num: num })
    } catch (err) {
        console.log(err)
    }
}