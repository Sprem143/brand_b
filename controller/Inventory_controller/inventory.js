const AutoFetchData = require('../../model/Inventory_model/autofetchdata');
const InvProduct = require('../../model/Inventory_model/invProduct');
require('dotenv').config();
const cheerio = require('cheerio');
const { ZenRows } = require("zenrows");
const InvUrl1 = require('../../model/Inventory_model/invUrl1');
const apikey = process.env.API_KEY;
const { boscov } = require('../utils')

function fetchoffer(html, couponcode) {
    try {
        const $ = cheerio.load(html);
        let productData = null;
        $('script').each((index, element) => {
            const scriptContent = $(element).html();
            const regex = /window\.product\s*=\s*({[^]*?});/;
            const match = scriptContent.match(regex);
            if (match) {
                try {
                    productData = JSON.parse(match[1]);

                } catch (error) {
                    console.error("Failed to parse JSON:", error);
                }
            }
        });

        if (productData) {
            let eligiblecoupon;
            if (productData.coupon && Array.isArray(productData.coupon.coupons)) {
                eligiblecoupon = productData.coupon.coupons.filter((c) => c.couponCode === couponcode && c.isBelkTenderCoupon === false)
            }
            if (Array.isArray(eligiblecoupon) && eligiblecoupon.length > 0) {
                return true;
            }
        } else {
            console.log("Product data not found in HTML.");
            return false;
        }
    } catch (error) {
        console.error("Error fetching HTML:", error);
        return false;
    }
}

async function fetchAndExtractVariable(html, variableName) {
    const $ = cheerio.load(html);
    let variableValue;
    $('script').each((index, script) => {
        const scriptContent = $(script).html();
        const regex = new RegExp(`${variableName}\\s*=\\s*({[^]*?});`);
        const match = regex.exec(scriptContent);
        if (match) {
            try {
                variableValue = JSON.parse(match[1]);
            } catch (error) {
                console.error("Failed to parse JSON:", error);
            }
        }
    });
    return variableValue;
}
const saveData = async (utagData, url, id, couponcodeprice) => {
    var datas = await InvProduct.find({ 'Product link': url });
    const price = utagData.sku_price;
    const upc = utagData.sku_upc;
    const quantity = utagData.sku_inventory;
    const imgurl = utagData.sku_image_url;
    const onsale = utagData.sku_on_sale;
    const coupon = utagData.product_promotedCoupon[0]?.cpnDiscount || null;

    const urlProduct = upc.map((u, index) => ({
        upc: u,
        price: price[index],
        quantity: quantity[index],
        imgurl: imgurl[index],
        onsale: onsale[index],
    }));
    var filterData;
    if (Array.isArray(datas)) {
        filterData = datas.map((data) => {
            const matchedProduct = urlProduct.find((p) => Number(p.upc) === Number(data['Input UPC'].replace('UPC', '')));
            if (matchedProduct) {
                return {
                    'Product link': data['Product link'],
                    'Current Quantity': matchedProduct.quantity,
                    'Product price': data['Product price'],
                    'Current Price': Number(couponcodeprice) > 0 && !matchedProduct.onsale
                        ? Number(Number(matchedProduct.price * (1 - coupon / 100)).toFixed(2))
                        : Number(Number(matchedProduct.price).toFixed(2)),
                    'Image link': matchedProduct.imgurl,
                    'Input UPC': 'UPC' + matchedProduct.upc,
                    'Fulfillment': data['Fulfillment'],
                    'Amazon Fees%': data['Amazon Fees%'],
                    'Amazon link': data['Amazon link'],
                    'Shipping Template': data['Shipping Template'],
                    'Min Profit': data['Min Profit'],
                    ASIN: data.ASIN,
                    SKU: data.SKU,
                };
            }
            return null;
        }).filter(item => item !== null);
    } else {
        filterData = []
    }
    await AutoFetchData.insertMany(filterData);
    await InvUrl1.updateOne(
        { _id: id },
        { $pull: { url: url } }
    )
};
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

exports.autofetchdata = async (req, res) => {
    try {
        const url = req.body.link;
        const id = req.body.id
        if (url.startsWith('https://www.boscovs.com')) {
            let result = await boscov(url, id)
            if (result) {
                res.status(200).send(true);
            } else {
                throw new Error('Invalid URL or URL is not related to belk');
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
                    let oosproduct = oosdata.map((data) => {
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
                        }
                    })
                    await AutoFetchData.insertMany(oosproduct);
                    await InvUrl1.updateOne(
                        { _id: id },
                        { $pull: { url: url } }
                    )
                    return res.status(200).send(true);
                }
                if (utagData.sku_inventory.length === 1 && utagData.sku_inventory[0] === '0') {
                    let oosdata = await InvProduct.find({ 'Product link': url })
                    await InvProduct.deleteMany({ 'Product link': url });
                    const oosproduct = oosdata.map((data) => {
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
                        }
                    })
                    await AutoFetchData.insertMany(oosproduct);
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
