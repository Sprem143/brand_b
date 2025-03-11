const AutoFetchData = require('../../model/Inventory_model/autofetchdata');
const InvProduct = require('../../model/Inventory_model/invProduct');
require('dotenv').config();
const { ZenRows } = require("zenrows");
const InvUrl1 = require('../../model/Inventory_model/invUrl1');
const apikey = process.env.API_KEY;
const { boscov, fetchAndExtractVariable, fetchoffer, saveData,skipscrapping } = require('../utils')
const Outofstock = require('../../model/Inventory_model/outofstock');
const Todayupdate = require('../../model/Inventory_model/todayupdate');
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

exports.autofetchdata2 = async (req, res) => {
    try {
        let url = req.body.link;
        const id = req.body.id;
        if (url.startsWith('https://www.boscovs.com')) {
            url = url.split('.html')[0]
            console.log(url)
            let result = await boscov(url, id)
            if (result) {
                res.status(200).send(true);
            } else {
                throw new Error('Invalid URL or URL is not related to Boscovs');
            }
        } else {
            const client = new ZenRows(apikey);
            const request = await client.get(url, {
                premium_proxy: true,
                js_render: true,
            });
            const html = await request.text();
            var utagData = await fetchAndExtractVariable(html, 'utag_data');

            if (!utagData) {
                await delay(5000);
                const request = await client.get(url, {
                    premium_proxy: true,
                    js_render: true,
                });
                const html = await request.text();
                utagData = await fetchAndExtractVariable(html, 'utag_data');
            }
            const couponcode = utagData['product_promotedCoupon'][0].couponCode;
            const isCoupon = couponcode !== undefined ? fetchoffer(html, couponcode) : null;
            if (utagData) {
                if (utagData.sku_inventory == []) {
                    let oosdata = await InvProduct.find({ 'Product link': url })
                    let oosproduct = oosdata.map(async (data) => {
                        let savedoos = await Outofstock.findOne({ 'Input UPC': data['Input UPC'] })
                        return {
                            'Product link': url,
                            'Current Quantity': 0,
                            'Product price': data['Product price'],
                            'Current Price': 0,
                            'Image link': '',
                            'Input UPC': data['Input UPC'],
                            'Fulfillment': data['Fulfillment'],
                            'Amazon Fees%': data['Amazon Fees%'],
                            'Amazon link': data['Amazon link'],
                            'Shipping Template': data['Shipping Template'],
                            'Min Profit': data['Min Profit'],
                            ASIN: data.ASIN,
                            SKU: data.SKU,
                            outofstock: savedoos.Date
                        }
                    })
                    await AutoFetchData.insertMany(oosproduct);
                    // ----------save product in today update-----
                    let todayupdate = new Todayupdate({url:url, products:null });
                       await todayupdate.save()
                    // ---------------save out of stock product in outofstock model ------------
                    let ooslist = []
                    for (let i of oosproduct) {
                        let isexist = await Outofstock.findOne({ ASIN: i.ASIN })
                        if (!isexist) {
                            ooslist.push(i)
                        }
                    }
                    await Outofstock.insertMany(ooslist)
                    await InvUrl1.updateOne(
                        { _id: id },
                        { $pull: { url: url } }
                    )
                    return res.status(200).send(true);
                }
                if (utagData.sku_inventory.length === 1 && utagData.sku_inventory[0] === '0') {
                    let oosdata = await InvProduct.find({ 'Product link': url })
                    await InvProduct.deleteMany({ 'Product link': url });
                    const oosproduct = oosdata.map(async (data) => {
                        let savedoos = await Outofstock.findOne({ 'Input UPC': data['Input UPC'] })
                        return {
                            'Product link': url,
                            'Current Quantity': 0,
                            'Product price': data['Product price'],
                            'Current Price': 0,
                            'Image link': '',
                            'Input UPC': data['Input UPC'],
                            'Fulfillment': data['Fulfillment'],
                            'Amazon Fees%': data['Amazon Fees%'],
                            'Amazon link': data['Amazon link'],
                            'Shipping Template': data['Shipping Template'],
                            'Min Profit': data['Min Profit'],
                            ASIN: data.ASIN,
                            SKU: data.SKU,
                            outofstock: savedoos.Date
                        }
                    })
                    await AutoFetchData.insertMany(oosproduct);
                    let todayupdate = new Todayupdate({url:url, products: null});
                    await todayupdate.save()
                    let ooslist = []
                    for (let i of oosproduct) {
                        let isexist = await Outofstock.findOne({ ASIN: i.ASIN })
                        if (!isexist) {
                            ooslist.push(i)
                        }
                    }
                    await Outofstock.insertMany(ooslist)
                    await InvUrl1.updateOne(
                        { _id: id },
                        { $pull: { url: url } }
                    )
                    return res.status(200).send(true);
                }
                await saveData(utagData, url, id, isCoupon);
                res.status(200).send(true);
            } else {
                throw new Error('Invalid URL or URL is not related to belk');
            }
        }
    } catch (error) {
        console.error(error.message);
        if (error.response) {
            console.error(error.response.data);
        }
        res.status(500).send({ error: error.message });
    }
};

