const BrandUrl = require('../../model/Brand_model/brandurl');
const InvUrl1 = require('../../model/Inventory_model/invUrl1');
const AutoFetchData = require('../../model/Inventory_model/autofetchdata');
const Backup = require('../../model/Inventory_model/backup');
const Product = require('../../model/Brand_model/products');
const autofetchdata = require('../../model/Inventory_model/autofetchdata');
const BrandPage = require('../../model/Brand_model/brandpage');
const FinalProduct = require('../../model/Brand_model/finalProduct')
const Exclude = require('../../model/Inventory_model/Exclude');
const InvProduct = require('../../model/Inventory_model/invProduct');
const Order = require('../../model/Inventory_model/order');
const Om = require('../../model/Masterdata/om');
const Bijak = require('../../model/Masterdata/bijak');
const Rcube = require('../../model/Masterdata/rcube')
const Zenith = require('../../model/Masterdata/zenith')
const { countDays } = require('../utils');
const Todayupdate = require('../../model/Inventory_model/todayupdate');
const Outofstock = require('../../model/Inventory_model/outofstock')

// -----------send url list of product to home page------
exports.sendproductsurl = async (req, res) => {
    try {
        const data = await BrandUrl.find();

        if (data.length > 0) {
            const mergedArray = data.map(item => item.producturl).flat();
            res.status(200).json({ url: mergedArray, upc: '', id: data[0]._id });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}
// --------brand scrappint total products-------------
exports.totalproducts = async (req, res) => {
    try {
        let products = await Product.countDocuments();
        let urls = await BrandUrl.find();
        var num2 = [];
        if (urls.length > 0) {
            num2 = urls[0].producturl;
        }
        res.status(200).json({ status: true, num: products, num2: num2 });
    } catch (err) {
        console.log(err)
        res.status(500).json({ status: false, msg: err })
    }
}
exports.deletebackup = async (req, res) => {
    try {
        const { name } = req.body;
        let result = await Backup.deleteOne({ name: name })
        if (result) {
            res.status(200).json({ status: true })
        }
    } catch (err) {
        console.log(err);
        res.status(500).send(err)
    }
}

// ------send inventory products links to home page---
exports.getinvlinks = async (req, res) => {
    try {
        let result1 = await InvUrl1.find();
        let sample = await InvProduct.aggregate([{ $sample: { size: 1 } }])
        let acc;
        if (sample.length == 1) {
            acc = sample[0].SKU ? sample[0].SKU.split('-')[0] : null
        }
        let data = await AutoFetchData.find({
            $expr: { $gt: [{ $size: "$PriceRange" }, 1] }
        })
        res.status(200).json({ url: result1[0], data: data, account: acc })
    } catch (err) {
        console.log(err);
    }
}
exports.getinvproduct = async (req, res) => {
    try {
        const InvProduct = await AutoFetchData.find();
        let filterdata = InvProduct.filter((product, index, self) => {
            index === self.findIndex((p) => p['Input UPC'] === product['Input UPC'])
        })
        res.status(200).send(filterdata)
    } catch (err) {
        console.log(err);
        res.send(err)
    }
}

exports.getupdatedproduct = async (req, res) => {
    try {
        let num = await AutoFetchData.countDocuments();
        res.status(200).json({ num: num })
    } catch (err) {
        console.log(err)
    }
}

// ------------checkremainingdata----------------
exports.checkremainingdata = async (req, res) => {
    try {
        let url = await InvUrl1.find();
        res.status(200).json({ status: true, url: url[0] })
    } catch (err) {
        console.log(err)
        res.staus(500).json({ status: false, msg: err })
    }
}

exports.changeprice = async (req, res) => {
    try {
        const { id, price } = req.body
        let products = await autofetchdata.find({ _id: id });
        let url = products[0]['Product link']
        let color = products[0]['color'] || 'abcd'
        let allvarition = await autofetchdata.find({ 'Product link': url, color: color })
        allvarition.forEach(async (p) => {
            await AutoFetchData.findByIdAndUpdate(
                { _id: p._id },
                { $set: { ['Current Price']: price, PriceRange: [] } },
                { new: true }
            )
        })
        let updatedproduct = await autofetchdata.find({
            $expr: { $gt: [{ $size: "$PriceRange" }, 1] }
        })
        res.status(200).json({ status: true, num: allvarition.length, data: updatedproduct })
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: false, msg: err })
    }
}

exports.cleardata = async (req, res) => {
    try {
        await BrandUrl.deleteMany();
        await BrandPage.deleteMany();
        await Product.deleteMany()
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: false, msg: err })
    }
}

exports.deletemanyproduct = async (req, res) => {
    try {
        let asins = req.body.arr
        if (!Array.isArray(asins) || asins.length === 0) {
            return res.status(400).json({ message: "Invalid or empty ASIN array" });
        }
        let resp = await FinalProduct.deleteMany({ ASIN: { $in: asins } })
        res.status(200).json({ status: true, count: resp.deletedCount })
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: false, msg: err })
    }
}

// ------remove already updated data---------
exports.removeoutofstock = async (req, res) => {
    let tdypr = await Todayupdate.find()
    if (tdypr.length > 0) {
        try {
            let urls = await InvUrl1.findOne();
            let id = urls._id;
            let totalNum = 0;
            if (!urls || !Array.isArray(urls.url)) {
                return res.status(400).json({ status: false, msg: "No URLs found" });
            }
            for (let u of urls.url) {
                let product = await Todayupdate.findOne({ url: u });

                if (product && product.products== null) {
                    let data = await InvProduct.find({ 'Product link': u });
                    data = data.map((item) => {
                        return { ...item._doc };
                    });
                    if (Array.isArray(data) && data.length > 0) {
                        let updated = []
                        for (let d of data) {
                            const { _id, ...rest } = item;
                            let savedoos = await Outofstock.findOne({ 'Input UPC': data['Input UPC'] })
                            return {
                                ...rest,
                                "Current Price": 0,
                                "Current Quantity": 0,
                                "outofstock": savedoos.Date
                            };
                        }
                        totalNum += updated.length;
                        let savedpr = await autofetchdata.insertMany(updated);
                        if (savedpr.length > 0) {
                            await InvUrl1.updateOne(
                                { _id: id },
                                { $pull: { url: u } }
                            )
                        }
                    }
                }

                if (product && product.products) {
                    let data = await InvProduct.find({ 'Product link': u });
                    data = data.map((item) => {
                        return { ...item._doc };
                    });
                    if (Array.isArray(data) && data.length > 0) {
                        let updated = data.map((item) => {
                            const { _id, ...rest } = item;
                            const upc = item["Input UPC"];

                            return {
                                ...rest,
                                "Current Price": product.products[upc]?.price || 0,
                                "Current Quantity": product.products[upc]?.quantity || 0,
                                "outofstock": product.products[upc]?.outofstock || false
                            };
                        });
                        totalNum += updated.length;
                        let savedpr = await autofetchdata.insertMany(updated);
                        if (savedpr.length > 0) {
                            await InvUrl1.updateOne(
                                { _id: id },
                                { $pull: { url: u } }
                            )
                        }
                    }
                }
            }
            res.status(200).json({ status: true, count: totalNum })
        } catch (err) {
            console.error("Error in removeOutOfStock:", err);
            res.status(500).json({ status: false, msg: err.message || err });
        }
    } else {
        res.status(404).json({ status: false, msg: "No updated Product found" })
    }


};


exports.setbulkshippingcost = async (req, res) => {
    try {
        const { idarr, shippingcost } = req.body;
        let resp = await FinalProduct.updateMany(
            { ASIN: { $in: idarr } },
            { $set: { 'Fulfillment Shipping': shippingcost } }
        )
        res.status(200).json({ status: true, count: resp.modifiedCount })
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: false, msg: err })
    }
}

exports.saveorder = async (req, res) => {
    try {
        let { orders } = req.body;
        if (orders.length < 1) {
            return res.status(404).json({ status: false, msg: 'No order found' })
        }
        let orderlist = []
        for (let o of orders) {
            let ord = await Order.findOne({ 'AZ id': o['AZ id'] })
            if (!ord.SKU) {
                orderlist.push(o)
            }
        }
        let resp = await Order.insertMany(orderlist);
        res.status(200).json({ status: true })
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: false, msg: err })
    }
}

// -----------master data saving ----------------
function fetchupc(sku) {
    let [a, b, c] = sku.split('-')
}
exports.savemasterdata = async (req, res) => {
    try {
        let products = await InvProduct.find();
        let size = 0;
        if (products.length > 0 && products[0]['SKU'].includes('RC')) {
            let productlist = []
            let data = await Rcube.find();
            for (let p of products) {
                let find = 0;
                for (let d of data) {
                    if (d.ASIN == p.ASIN) {
                        find = 1;
                    }
                }
                find == 0 ? productlist.push({...p}) : null
            }
            size = productlist.length
            await Rcube.insertMany(productlist)

        } else if (products.length > 0 && products[0]['SKU'].includes('ZL')) {
            await Zenith.deleteMany();
            
            // let productlist = []
            // let data = await Zenith.find();
            // for (let p of products) {
            //     let find = 0;
            //     for (let d of data) {
            //         if (d.ASIN == p.ASIN) {
            //             find = 1;
            //         }
            //     }
            //     find == 0 ? productlist.push({ ASIN: p.ASIN, SKU: p.SKU, UPC: p.SKU.split('-')[2] }) : null
            // }
            // size = productlist.length
            // await Zenith.insertMany(productlist)

        } else if (products.length > 0 && products[0]['SKU'].includes('BJ')) {
            let productlist = []
            let data = await Bijak.find();
            for (let p of products) {
                let find = 0;
                for (let d of data) {
                    if (d.ASIN == p.ASIN) {
                        find = 1;
                    }
                }
                find == 0 ? productlist.push({ ASIN: p.ASIN, SKU: p.SKU, UPC: p.SKU.split('-')[2] }) : null
            }
            size = productlist.length
            await Bijak.insertMany(productlist)

        } else if (products.length > 0 && products[0]['SKU'].includes('OM')) {
            let productlist = []
            let data = await Om.find();
            for (let p of products) {
                let find = 0;
                for (let d of data) {
                    if (d.ASIN == p.ASIN) {
                        find = 1;
                    }
                }
                find == 0 ? productlist.push({ ASIN: p.ASIN, SKU: p.SKU, UPC: p.SKU.split('-')[2] }) : null
            }
            size = productlist.length
            await Om.insertMany(productlist)
        }

        res.status(200).json({ status: true, size: size })
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: false, msg: err })
    }
}

exports.cleardata = async (req, res) => {
    try {
        await Rcube.deleteMany()
        await Bijak.deleteMany()
        await Om.deleteMany()
        await Zenith.deleteMany()
    } catch (err) {
        console.log(err)
    }
}
