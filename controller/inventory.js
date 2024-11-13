const AutoFetchData = require('../model/autofetchdata')
const InvProduct = require('../model/invProduct')
require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const apikey = process.env.API_KEY


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

exports.autofetchdata = async(req, res) => {
    try {
        console.log("autofetch");
        var datas = await InvProduct.find();
        const url = req.body.link;
        let response = await axios({
            url: 'https://api.zenrows.com/v1/',
            method: 'GET',
            params: {
                'url': url,
                'apikey': apikey,
                'js_render': true,
                'premium_proxy': true
            },
        });
        const html = response.data;
        const utagData = await fetchAndExtractVariable(html, 'utag_data');

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
            // console.log(urlProduct)
            // -----filter product-----
        let filterData = datas.map((data) => {
            const matchedProduct = urlProduct.find((p) => p.upc === data['Input UPC'].replace('UPC', ''));
            if (matchedProduct) {
                console.log(matchedProduct)
                return {
                    'Product link': data['Product link'],
                    'Current Quantity': matchedProduct.quantity,
                    'Product price': data['Product price'],
                    'Current Price': Number(coupon) > 0 && Boolean(matchedProduct.onsale) === false ? matchedProduct.price * (1 - (coupon / 100)) : matchedProduct.price,
                    'Image link': matchedProduct.imgurl,
                    'Input UPC': data['Input UPC'],
                    'Fulfillment': data['Fulfillment'],
                    'Amazon Fees%': data['Amazon Fees%'],
                    'Amazon link': data['Amazon link'],
                    'Shipping Template': data['Shipping Template'],
                    'Min Profit': data['Min Profit'],
                    ASIN: data.ASIN
                };
            }
            return null;
        }).filter(item => item !== null);
        // VisitedUrl.findOneAndDelete({url:url})
        // ---save data into database
        for (const d of filterData) {
            const autofetchdata = new AutoFetchData(d);
            var r = await autofetchdata.save();
        }
        if (r) {
            res.status(200).send(true);
        }
    } catch (error) {
        console.error('Error scraping the webpage:', error);
        res.status(500).send(error);
    }
}