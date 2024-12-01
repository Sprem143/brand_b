const MAutoFetchData = require('../../model/Manual_inv/autofetchdata')
const MInvProduct = require('../../model/Manual_inv/invProduct');
const MNoProduct= require('../../model/Manual_inv/noProduct');
require('dotenv').config();
const cheerio = require('cheerio');
const apikey = process.env.API_KEY
const { ZenRows } = require("zenrows");

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

const saveData=async(utagData)=>{
    var datas = await MInvProduct.find();
    const price = utagData.sku_price;
    const upc = utagData.sku_upc;
    const quantity = utagData.sku_inventory;
    const imgurl = utagData.sku_image_url;
    const onsale = utagData.sku_on_sale;
    const coupon = utagData.product_promotedCoupon[0].cpnDiscount !== undefined ? utagData.product_promotedCoupon[0].cpnDiscount : null;
    var urlProduct = upc.map((u, index) => {
        return {
            upc: u,
            price: price[index],
            quantity: quantity[index],
            imgurl: imgurl[index],
            onsale: onsale[index]
        }
    })
    var noproducturl;

    let filterData = datas.map((data) => {
        const matchedProduct = urlProduct.find((p) => p.upc === data.upc)
        matchedProduct?noproducturl=data['Vendor URL'] : null
        if (matchedProduct) {
            return {
                'Vendor URL': data['Vendor URL'],
                'quantity': matchedProduct.quantity,
                'Product Cost': Number(data['Product Cost']).toFixed(2),
                'Current Price': Number(Number(coupon) > 0 && Boolean(matchedProduct.onsale) === false ? matchedProduct.price * (1 - (coupon / 100)) : matchedProduct.price).toFixed(2),
                'Image link': matchedProduct.imgurl,
                SKUs: data.SKUs,
                available:data.available,
                upc:data.upc
            };
        }
        return null;
    }).filter(item => item !== null);
    if(filterData.length===0){
        const existingUrl = await MNoProduct.findOne({ url:noproducturl });
        if (!existingUrl) {
            const errorurl = new MNoProduct({ url:noproducturl});
            await errorurl.save();
        }
    }
    await MAutoFetchData.insertMany(filterData);
}

exports.autofetchdata6 = async(req, res) => {
    try {
        const client = new ZenRows(apikey);
        const url = req.body.link
        const request = await client.get(url, {
            premium_proxy: true,
            js_render: true,

        });
        const html = await request.text();
        const utagData = await fetchAndExtractVariable(html, 'utag_data');
        if (utagData) {
            if (utagData.sku_inventory.length == 1 && utagData.sku_inventory[0] === '0') {
                return res.status(200).send(true);
            }
    
            if (utagData.sku_inventory.length > 1) {
                saveData(utagData);
                 res.status(200).send(true);
            }
        }else{
            throw new Error('Invalid URL or url is not related to belk');
        }
         
    } catch (error) {
        const existingUrl = await MNoProduct.findOne({ url: req.body.link });
        if (!existingUrl) {
            const errorurl = new MNoProduct({ url: req.body.link });
            await errorurl.save();
        }
        console.error(error.message);
        if (error.response) {
            console.error(error.response.data);
        }
        res.status(500).send({ error: error.message });
    }
}