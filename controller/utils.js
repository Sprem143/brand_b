
const AutoFetchData = require('../model/Inventory_model/autofetchdata');
const InvProduct = require('../model/Inventory_model/invProduct');
require('dotenv').config();
const cheerio = require('cheerio');
const { ZenRows } = require("zenrows");
const InvUrl1 = require('../model/Inventory_model/invUrl1');
const apikey = process.env.API_KEY;

const generatesku = (upc, color, size) => {
    if (color && size) {
        let a = size.split(' ');
        if (a[1] && a[1].length > 1) {
            a[1] = a[1].slice(0, 1)
        }
        a = a.join('');
        size = a
        color = color.replaceAll(' ', '-').replaceAll('/', '-').toUpperCase();
        let firstletter = color.charAt(0)
        color = color.slice(1)
        var modifiedColor = color
        if (color.length > 12) {
            let v = ['A', 'E', 'I', 'O', 'U'];
            for (let i of v) {
                modifiedColor = color.replaceAll(i, '');
                color = modifiedColor
            }
        }
        if (color.length > 12) {
            let arr = color.split('-');
            for (let i = 0; i < arr.length; i++) {
                arr[i] = arr[i].slice(0, 3)
            }
            color = arr.join('-')
        }
        let sku = 'RC-R1-' + upc + '-' + firstletter + color + '-' + size
        sku.replace('--', '-')
        sku.replace('--', '-')
        return sku;
    } else {
        return null
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

async function fetchProductData(html) {
    try {
        const $ = cheerio.load(html);
        let productData = null;
        $('script').each((index, element) => {
            const scriptContent = $(element).html();
            const regex = /window\.product\s*=\s*({[^]*?});/;
            const match = scriptContent.match(regex);
            if (match) {
                try {
                    // Parse the matched JSON-like object
                    productData = JSON.parse(match[1]);

                } catch (error) {
                    console.error("Failed to parse JSON:", error);
                }
            }
        });

        if (productData) {
            return productData;
        } else {
            console.log("Product data not found in HTML.");
            return null;
        }
    } catch (error) {
        console.error("Error fetching HTML:", error);
        return null;
    }
}

function extractProductData(html) {
    const $ = cheerio.load(html);

    const scriptTag = $('#data-mz-preload-product');

    if (!scriptTag.length) {
        console.error('Script tag with id "data-mz-preload-product" not found.');
        return null;
    }

    let productData;
    try {
        productData = JSON.parse(scriptTag.html().trim());
    } catch (error) {
        console.error('Error parsing JSON:', error);
        return null;
    }
    const volumePriceBands = productData?.volumePriceBands || null
    const upCs = productData?.upCs || [];
    const variations = productData?.variations || [];
    return { volumePriceBands, upCs, variations };
}

const boscov = async (url, id) => {
    try {
        const client = new ZenRows(apikey);
        const request = await client.get(url, {
            premium_proxy: true,
            js_render: true,
        });
        const html = await request.text();
        if (html) {
            const productData = extractProductData(html);
            let oosproduct = [];
            let oosdata = await InvProduct.find({ 'Product link': url })
            if (productData.variations.length == 0) {
                oosdata.forEach((data) => {

                    oosproduct.push({
                        'Product link': url,
                        'Current Quantity': 0,
                        'Product price': data['Product price'],
                        'Current Price': 0,
                        'PriceRange': arr,
                        'Image link': '',
                        color:'',
                        'Input UPC': data['Input UPC'],
                        'Fulfillment': data['Fulfillment'],
                        'Amazon Fees%': data['Amazon Fees%'],
                        'Amazon link': data['Amazon link'],
                        'Shipping Template': data['Shipping Template'],
                        'Min Profit': data['Min Profit'],
                        ASIN: data.ASIN,
                        SKU: data.SKU,
                    })

                })
                let r = await AutoFetchData.insertMany(oosproduct);
                await InvUrl1.updateOne(
                    { _id: id },
                    { $pull: { url: url } }
                )
                return true;
            }




            var lower, upper, price, middle;
            if (productData.volumePriceBands.length == 0) {
                price = 0
            }
            else if (productData && productData.volumePriceBands[0].priceRange) {
                const p = productData.volumePriceBands[0].priceRange
                lower = p.lower.onSale ? p.lower.salePrice : p.lower.price
                upper = p.upper.onSale ? p.upper.salePrice : p.lower.price
                middle = productData.volumePriceBands[0].price.onSale ? productData.volumePriceBands[0].price.salePrice : productData.volumePriceBands[0].price.price;
                price = upper
            } else if (productData.volumePriceBands) {
                price = productData.volumePriceBands[0].price.onSale ? productData.volumePriceBands[0].price.salePrice : productData.volumePriceBands[0].price.price

            }
            let products = productData.variations.map((p) => ({
                upc: p.upc,
                price: price,
                quantity: p.inventoryInfo.onlineStockAvailable,
                color: p.options[0].value
            }))
            var arr = [lower, middle, upper]
            arr = arr.filter((a, i, self) => self.indexOf(a) == i)

            oosdata.forEach((data) => {
                products.map((p) => {
                    if (data['Input UPC'] == 'UPC' + p.upc) {
                        oosproduct.push({
                            'Product link': url,
                            'Current Quantity': p.quantity,
                            'Product price': data['Product price'],
                            'Current Price': p.price,
                            'PriceRange': arr,
                            'Image link': '',
                            color: p.color,
                            'Input UPC': p.upc,
                            'Fulfillment': data['Fulfillment'],
                            'Amazon Fees%': data['Amazon Fees%'],
                            'Amazon link': data['Amazon link'],
                            'Shipping Template': data['Shipping Template'],
                            'Min Profit': data['Min Profit'],
                            ASIN: data.ASIN,
                            SKU: data.SKU,
                        })
                    }
                })
            })
            let r = await AutoFetchData.insertMany(oosproduct);
            await InvUrl1.updateOne(
                { _id: id },
                { $pull: { url: url } }
            )
            return true;
        } else {
            return false
        }
    } catch (err) {
        console.log(err);
        return false
    }
}

module.exports = { generatesku, fetchAndExtractVariable, fetchProductData, extractProductData, boscov }
