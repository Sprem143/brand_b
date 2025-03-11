
const AutoFetchData = require('../model/Inventory_model/autofetchdata');
const InvProduct = require('../model/Inventory_model/invProduct');
require('dotenv').config();
const cheerio = require('cheerio');
const { ZenRows } = require("zenrows");
const InvUrl1 = require('../model/Inventory_model/invUrl1');
const apikey = process.env.API_KEY;
const BrandUrl = require('../model/Brand_model/brandurl')
const Product = require('../model/Brand_model/products')
const Outofstock = require('../model/Inventory_model/outofstock');
const Todayupdate = require('../model/Inventory_model/todayupdate');
const todayupdate = require('../model/Inventory_model/todayupdate');

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
    const img = productData?.mainImage.src || null;
    return { volumePriceBands, upCs, variations, img };
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
            let oosdata = await InvProduct.find({ 'Product link': url+'.html' })
            if (productData.variations.length == 0) {
                oosdata = oosdata.map((data) => ({

                    'Product link': url,
                    'Current Quantity': 0,
                    'Product price': data['Product price'],
                    'Current Price': 0,
                    'PriceRange': arr,
                    'Image link': '',
                    'Input UPC': data['Input UPC'],
                    'Fulfillment': data['Fulfillment'],
                    'Amazon Fees%': data['Amazon Fees%'],
                    'Amazon link': data['Amazon link'],
                    'Shipping Template': data['Shipping Template'],
                    'Min Profit': data['Min Profit'],
                    ASIN: data.ASIN,
                    SKU: data.SKU,
                }))

                await AutoFetchData.insertMany(oosdata);
                await Outofstock.insertMany(oosdata);
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

            let products = [];
            for (let i = 0; i < productData.variations.length; i++) {
                let p = productData.variations[i];
                let outofstock = p.inventoryInfo.onlineStockAvailable == 0 ? await getoutofstockdata(p.upc) : null;

                products.push({
                    upc: p.upc,
                    price: price,
                    quantity: p.inventoryInfo.onlineStockAvailable,
                    color: p.options[0].value,
                    outofstock: outofstock,
                });
            }

            var arr = [lower, middle, upper]
            arr = arr.filter((a, i, self) => self.indexOf(a) == i)
            let oosproduct = [];
            oosdata.forEach((data) => {
                products.map((p) => {
                    if (data['Input UPC'] == 'UPC' + p.upc || data['Input UPC'] == p.upc) {
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
                            outofstock: p.outofstock
                        })
                    }
                })
            })
            let r = await AutoFetchData.insertMany(oosproduct);
            console.log(r)
            let filterData = oosproduct.filter((f) => f['Current Quantity'] == 0);
            if (filterData.length > 0) {
                let ooslist = []
                for (let i of filterData) {
                    let isexist = await Outofstock.findOne({ ASIN: i.ASIN })
                    if (!isexist) {
                        ooslist.push(i)
                    }
                }
                await Outofstock.insertMany(ooslist)
            }
            if (r.length > 0) {
                await InvUrl1.updateOne(
                    { _id: id },
                    { $pull: { url: url } }
                )
                return true;
            } else { return false }
        } else {
            return false
        }
    } catch (err) {
        console.log(err);
        return false
    }
}

const boscovbrandscraper = async (url, id) => {
    try {
        const client = new ZenRows(apikey);
        const request = await client.get(url, {
            premium_proxy: true,
            js_render: true,
        });
        const html = await request.text();
        if (html) {
            const productData = extractProductData(html);
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
            var arr = [lower, middle, upper]
            arr = arr.filter((a, i, self) => self.indexOf(a) == i)
            const img = productData.img

            let products = productData.variations.map((p) => ({
                upc: p.upc,
                price: price,
                sku: generatesku(p.upc, p.options[0].value, p.options[1].value),
                pricerange: arr,
                quantity: p.inventoryInfo.onlineStockAvailable,
                color: p.options[0].value,
                size: p.options[1].value,
                imgurl: img,
                url: url
            }))

            await Product.insertMany(products)
            return true;
        } else {
            return false
        }
    } catch (err) {
        console.log(err);
        return false
    }
}

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

const saveData = async (utagData, url, id, couponcodeprice) => {
    var datas = await InvProduct.find({ 'Product link': url });
    const price = utagData.sku_price;
    const upc = utagData.sku_upc;
    const quantity = utagData.sku_inventory;
    const imgurl = utagData.sku_image_url;
    const onsale = utagData.sku_on_sale;
    const coupon = utagData.product_promotedCoupon[0]?.cpnDiscount || null;

    const getoutofstockdata = async (upc) => {
        let UPC = 'UPC' + upc;
        let product = await Outofstock.findOne({ 'Input UPC': UPC });
        return product ? product.Date : null; // Handle case when product is not found
    };

    const urlProduct = [];

    for (let i = 0; i < upc.length; i++) {
        const outofstock = quantity[i] == 0 ? await getoutofstockdata(upc[i]) : null;

        urlProduct.push({
            upc: 'UPC' + upc[i],
            price: Number(couponcodeprice) > 0 && !onsale[i]
                ? Number(Number(price[i] * (1 - coupon / 100)).toFixed(2))
                : Number(Number(price[i]).toFixed(2)),
            outofstock: outofstock,
            quantity: quantity[i],
            imgurl: imgurl[i],
            onsale: onsale[i],
        });
    }
    console.log(urlProduct.length)
    const transformedData = urlProduct.reduce((acc, { upc, onsale, ...rest }) => {
        acc[upc] = rest;
        return acc;
    }, {});
    let todayupdate = new Todayupdate({ products: transformedData, url: url });
    await todayupdate.save();
    var filterData;
    if (Array.isArray(datas)) {
        filterData = datas.map((data) => {
            const matchedProduct = urlProduct.find((p) =>p.upc === data['Input UPC']);
            if (matchedProduct) {
                return {
                    'Product link': data['Product link'],
                    'Current Quantity': matchedProduct.quantity,
                    'Product price': data['Product price'],
                    'Current Price': matchedProduct.price,
                    'Image link': matchedProduct.imgurl,
                    'Input UPC': 'UPC' + matchedProduct.upc,
                    'Fulfillment': data['Fulfillment'],
                    'Amazon Fees%': data['Amazon Fees%'],
                    'Amazon link': data['Amazon link'],
                    'Shipping Template': data['Shipping Template'],
                    'Min Profit': data['Min Profit'],
                    ASIN: data.ASIN,
                    SKU: data.SKU,
                    outofstock: matchedProduct.outofstock
                };
            }
            return null;
        }).filter(item => item !== null);
    } else {
        filterData = []
    }
    let r = await AutoFetchData.insertMany(filterData);
    if (r.length > 0) {
        await InvUrl1.updateOne(
            { _id: id },
            { $pull: { url: url } }
        )
    }
    // -----------save out of stock data------
    filterData = filterData.filter((f) => f['Current Quantity'] == 0);
    if (filterData.length > 0) {
        let ooslist = []
        for (let i of filterData) {
            let isexist = await Outofstock.findOne({ ASIN: i.ASIN })
            if (!isexist) {
                ooslist.push(i)
            }
        }
        await Outofstock.insertMany(ooslist)
    }
    
};

const countDays = (date) => {
    let [d1, m1, y1] = date.split('/').map(Number); // Parse input date (DD/MM/YYYY)

    let today = new Date();
    let d2 = today.getDate();
    let m2 = today.getMonth() + 1; // Months are 0-based, so add 1
    let y2 = today.getFullYear();

    let date1 = new Date(y1, m1 - 1, d1);
    let date2 = new Date(y2, m2 - 1, d2);

    let diff = Math.abs(date2 - date1); // Difference in milliseconds
    return Math.floor(diff / (1000 * 60 * 60 * 24)); // Convert to days
};

const skipscrapping = async (url) => {
    console.log(url)
    let products = await InvProduct.find({ 'Product link': url })
    let updatedproducts = await todayupdate.findOne({ url: url })
    let updated = []

    for (let p of products) {
        const { _id, ...rest } = p.toObject ? p.toObject() : p; // Convert Mongoose object to plain JS object

        let updatedp = {
            ...rest,
            'Current Price': updatedproducts.products[p['Input UPC']].price,
            'Current Quantity': updatedproducts.products[p['Input UPC']].quantity,
            'outofstock': updatedproducts.products[p['Input UPC']].outofstock
        };
        updated.push(updatedp)
    }
    console.log(updated)
    await AutoFetchData.insertMany(updated)
}

module.exports = { skipscrapping, countDays, generatesku, saveData, fetchAndExtractVariable, fetchoffer, fetchProductData, extractProductData, boscov, boscovbrandscraper }
