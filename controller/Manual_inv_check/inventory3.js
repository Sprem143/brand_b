const MAutoFetchData = require('../../model/Manual_inv/autofetchdata')
const MInvProduct = require('../../model/Manual_inv/invProduct');
const MNoProduct = require('../../model/Manual_inv/noProduct');
const MInvUrl = require('../../model/Manual_inv/invUrl')
require('dotenv').config();
const cheerio = require('cheerio');
const { ZenRows } = require("zenrows");

const apikey = process.env.API_KEY;

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

const saveData = async (utagData, url) => {
    const datas = await MInvProduct.find({ 'Vendor URL': url });
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
        onsale: onsale[index]
    }));
    var filterData;
    if (Array.isArray(datas)) {
        filterData = datas.map((data) => {
            const matchedProduct = urlProduct.find((p) => Number(p.upc) === Number(data['upc']));
            if (matchedProduct) {
                return {
                    'Vendor URL': data['Vendor URL'],
                    'quantity': matchedProduct.quantity,
                    'Product Cost': !isNaN(data['Product Cost']) ? Number(data['Product Cost']).toFixed(2) : data['Product Cost'],
                    'Current Price': Number(Number(coupon) > 0 && Boolean(matchedProduct.onsale) === false ? matchedProduct.price * (1 - (coupon / 100)) : matchedProduct.price).toFixed(2),
                    'Image link': matchedProduct.imgurl,
                    SKUs: data.SKUs,
                    available: data.available,
                    upc: matchedProduct.upc
                };
            }
            return null;
        }).filter(item => item !== null);
    } else {
        filterData = []
    }
    await MAutoFetchData.insertMany(filterData);
};
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

exports.autofetchdata3 = async (req, res) => {
    try {
        const client = new ZenRows(apikey);
        const url = req.body.link;
        const linkid= req.body.linkid
        console.log(linkid)
        const request = await client.get(url, {
            premium_proxy: true,
            js_render: true,
        });
        const html = await request.text();
        var utagData;
        utagData = await fetchAndExtractVariable(html, 'utag_data');
        if (!utagData) {
            await delay(5000);
            const request = await client.get(url, {
                premium_proxy: true,
                js_render: true,
            });
            const html = await request.text();
            utagData = await fetchAndExtractVariable(html, 'utag_data');

        }

        if (utagData) {
            if (utagData.sku_inventory == []) {
                let oosdata = await MInvProduct.find({ 'Product link': url })
                let oosproduct = oosdata.map((data) => {
                    return {
                        'Vendor URL': data['Vendor URL'],
                        'quantity': 0,
                        'Product Cost': !isNaN(data['Product Cost']) ? Number(data['Product Cost']).toFixed(2) : data['Product Cost'],
                        'Current Price':0,
                        'Image link': matchedProduct.imgurl,
                        SKUs: data.SKUs,
                        available: data.available,
                        upc: matchedProduct.upc
                    }
                })
                await MAutoFetchData.insertMany(oosproduct);
                return res.status(200).send(true);
            }
            if (utagData.sku_inventory.length === 1 && utagData.sku_inventory[0] === '0') {
                let oosdata = await MInvProduct.find({ 'Product link': url })
                const oosproduct = oosdata.map((data) => {
                    return {
                        'Vendor URL': data['Vendor URL'],
                        'quantity': 0,
                        'Product Cost': !isNaN(data['Product Cost']) ? Number(data['Product Cost']).toFixed(2) : data['Product Cost'],
                        'Current Price':0,
                        'Image link': matchedProduct.imgurl,
                        SKUs: data.SKUs,
                        available: data.available,
                        upc: matchedProduct.upc
                    }
                })
                await MAutoFetchData.insertMany(oosproduct);
                return res.status(200).send(true);
            }
            await saveData(utagData, url);
            await MInvUrl.updateOne(
                { _id: linkid }, 
                { $pull: { url: url } }
              )
            res.status(200).send(true);
        } else {
            throw new Error('Invalid URL or URL is not related to belk');
        }
    } catch (error) {
        const existingUrl = await MNoProduct.findOne({ url: req.body.link });
        if (!existingUrl) {
            const errorurl = new MNoProduct({ url: req.body.link });
            console.log(errorurl)
            await errorurl.save();
        }
        console.error(error.message);
        if (error.response) {
            console.error(error.response.data);
        }
        res.status(500).send({ error: error.message });
    }
};

