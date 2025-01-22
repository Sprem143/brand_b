
require('dotenv').config();
const apikey = process.env.API_KEY
const BrandPage = require('../../model/Brand_model/brandpage');
const BrandUrl = require('../../model/Brand_model/brandurl');
const axios = require('axios');
const cheerio = require('cheerio')
const Product = require('../../model/Brand_model/products');
// const Varientupc = require('../../model/Brand_model/varientupc')
// const Avlupc = require('../../model/Brand_model/avlupc')
const { ZenRows } = require("zenrows");
const finalProduct = require('../../model/Brand_model/finalProduct');

exports.fetchbrand = async (req, res) => {
    try {
        await BrandPage.deleteMany();
        await BrandUrl.deleteMany();
        await Product.deleteMany();
        // await Varientupc.deleteMany();
        await Avlupc.deleteMany();
        const { url, num } = req.body
        generateurl(num, url);

        if (!url || typeof url !== 'string' || !url.startsWith('http')) {
            return res.status(400).send('Invalid URL');
        }

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
        const $ = cheerio.load(html);

        // Find all <a> tags with class "thumb-link" and extract their href attributes
        let productUrls = [];
        $('a.thumb-link').each((index, element) => {
            const url = $(element).attr('href');
            if (url) {
                productUrls.push(url);
            }
        });
        if (productUrls.length > 0) {
            const productarr = productUrls.map(p => 'https://www.belk.com' + p);
            const products = new BrandUrl({ producturl: productarr });
            await products.save();

            const pages = await BrandPage.find({}, { url: 1, _id: 0 });
            console.log(pages.length)
            console.log(pages)
            const secondurl = pages[0].url;
            await handleSecondPageScraping(secondurl);

        }
        res.status(200).json({ status: true, msg: "All pages's urls fetched successfully" })
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while scraping data.' });
    }
};

const handleSecondPageScraping = async (urls) => {
    console.log("second page")
    let index = 0;
    while (index < urls.length) {
        const url = urls[index]
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
        const $ = cheerio.load(html);

        // Find all <a> tags with class "thumb-link" and extract their href attributes
        let productUrls = [];
        $('a.thumb-link').each((index, element) => {
            const url = $(element).attr('href');
            if (url) {
                productUrls.push(url);
            }
        });

        if (productUrls.length > 0) {
            const productarr = productUrls.map(p => 'https://www.belk.com' + p);
            let prevarr = await BrandUrl.find();
            let newarrlist = [...prevarr[0].producturl, ...productarr];
            let arrid = prevarr[0]._id
            const r = await BrandUrl.findByIdAndUpdate(
                { _id: arrid },
                { $set: { producturl: newarrlist } },
                { new: true }
            )
            r ? index++ : index
        }
    }
};


const generateurl = async (num, url) => {
    if (url.includes('prefn1')) {
        let a = url.split('?');
        let b = a[1].split('&')
        let l = a[0] + '?' + b[1] + '&' + b[2] + '&' + b[0]

        let n1 = 60;
        let urls = parseInt(num / 60) - 1;
        let index = 0;
        let urllist = [];
        while (index <= urls) {
            urllist.push(l + `&start=${n1}&sz=60`);
            n1 = n1 + 60;
            index++
        }
        if (urllist.length > 0) {
            const pages = new BrandPage({ url: urllist });
            await pages.save();
        }
    } else {
        let n1 = 60;
        let urls = parseInt(num / 60) - 1;
        let index = 0;
        let urllist = [];
        while (index <= urls) {
            urllist.push(url + `&start=${n1}&sz=60`);
            n1 = n1 + 60;
            index++
        }
        if (urllist.length > 0) {
            let pages = new BrandPage({ url: urllist });
            await pages.save();
        }
    }
}

// --------start scrapping upc--------
const fetchAndExtractVariable = async (html, variableName) => {
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
        // Extract the content of the script tag containing window.product
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
            // console.log("Extracted product data:", productData);
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


const getupc = async (url) => {
    try {
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
        let clrsize = await fetchProductData(html);
        const size = clrsize.colorSizeMap.colorToSize
        const color = clrsize.colorSizeMap.colors;
        let id_color = Object.fromEntries(Object.entries(color).map(([key, value]) => [key, value.name]))
        let id_size = Object.fromEntries(
            Object.entries(size).map(([outerKey, innerObj]) => [
                outerKey,
                Object.fromEntries(
                    Object.entries(innerObj).map(([key, value]) => [value, key.split('_')[1]])
                )
            ])
        );

        var color_size = {};
        for (const [productId, sizes] of Object.entries(id_size)) {
            const color = id_color[productId]; // Get the color from obj1 based on the productId
            for (const [upc, size] of Object.entries(sizes)) {
                // Populate the result with the desired structure
                color_size[upc] = { size, color };
            }
        }

        const data = await fetchAndExtractVariable(html, 'utag_data');
        if (data && color_size) {
            const name = data.product_name[0];
            const upc = data.sku_upc;
            const id = data.sku_id;
            const price = data.sku_price;
            const num = data.sku_inventory;
            const onsale = data.sku_on_sale;
            const imgurl = data.sku_image_url
            const coupon = data.product_promotedCoupon[0].cpnDiscount !== undefined ? data.product_promotedCoupon[0].cpnDiscount : null;
            const offerend = coupon === null ? null : data.product_promotedCoupon[0].endDate.slice(0, 10);
            let products = upc.map((u, index) => ({
                name: name,
                upc: u,
                price: Number(data.product_promotedCoupon[0].cpnDiscount) > 0 && Boolean(onsale[index]) === false ? price[index] * (1 - (coupon / 100)) : price[index],
                quantity: Number(num[index]),
                onsale: onsale[index],
                productid: id[index],
                color: color_size[id[index]] ? color_size[id[index]].color : null,
                size: color_size[id[index]] ? color_size[id[index]].size : null,
                discount: onsale[index] ? 0 : Number(coupon),
                offerend: offerend,
                url: url,
                imgurl: imgurl[index]
            }));
            // ---------removing out of stock products----------
            const filterProduct = products.filter((p) => p.quantity > 5);
            let saveProducts = await Product.insertMany(filterProduct)
                .catch(err => console.error("Error saving products:", err));
            if (result && saveProducts) {

                return 1;
            }
        } else {
            return 0;
        }
    } catch (err) {
        console.error("Error in getupc:", err);
        return 0;
    }
};

exports.getproduct = async (req, res) => {
    try {
        const urlarray = await BrandUrl.find({});
        let arrayid = urlarray[0]._id
        const urls = urlarray[0].producturl;
        for (let index = 0; index < urls.length;) {
            let result = await getupc(urls[index]);
            if (result === 1) {
                await BrandUrl.updateOne(
                    { _id: arrayid },
                    { $pull: { producturl: urls[index] } }
                )
                index++
            } else {
                console.log("UPC data not found or error occurred for:", urls[index]);
            }
        }


        res.send("Product data fetched successfully");

    } catch (err) {
        console.error("Error:", err);
        res.status(500).send({ error: 'Failed to fetch product data' });
    }
};

// const filtervarient = async (upc) => {
//     let resu = await Varientupc.find();
//     resu.map(async (r) => {
//         if (r.upc.includes(upc)) {
//             let newupclist = new Avlupc({ upc: r.upc });
//             let re = await newupclist.save();
//             console.log(re)
//         }
//     })
// }

exports.pratical = async (req, res) => {
    // try {
    //     const url = req.body.url
    //     console.log(url)
    //     const client = new ZenRows(apikey);
    //     const request = await client.get(url, {
    //         premium_proxy: true,
    //         js_render: true,
    //     });
    //     const html = await request.text();
    //     const data = await fetchAndExtractVariable(html, 'utag_data');

    //     const $ = cheerio.load(html);
    //     const ids = data.sku_id;
    //     const upcs = data.sku_upc
    //     console.log(ids)
    //     console.log(upcs)
    //     let productData = null;
    //     $('script').each((index, element) => {
    //         const scriptContent = $(element).html();
    //         const regex = /window\.product\s*=\s*({[^]*?});/;
    //         const match = scriptContent.match(regex);
    //         if (match) {
    //             try {
    //                 productData = JSON.parse(match[1]);

    //             } catch (error) {
    //                 console.error("Failed to parse JSON:", error);
    //             }
    //         }
    //     });
    //     const colorToSize = productData.colorSizeMap.colorToSize

    //     const result = {};


    //     for (const color in colorToSize) {
    //         const values = Object.values(colorToSize[color]);
    //         let upclist = []
    //         values.forEach((v) => {
    //             upclist.push(upcs[ids.indexOf(v)])
    //         })

    //         result[color] = upclist;
    //     }
    //     for (const i in result) {
    //         let obj = {
    //             varient: i,
    //             upc: result[i]
    //         }
    //         let newvarient = new Varientupc(obj);
    //         let savedata = await newvarient.save();
    //         console.log(savedata)
    //     }

    //     filtervarient('0438761322886')
    // } catch (err) {
    //     console.log(err)
    // }
}

exports.setchecked=async(req,res)=>{
    try{
     const {id}= req.body;
 await finalProduct.findOneAndUpdate({_id:id}, {$set:{isCheked:true}}, {new:true});
    res.status(200).json({status:true})
    }catch(err){
        console.log(err);
        res.status(500).json({status:false, msg:err})
    }
}
exports.deleteproduct = async (req, res) => {
    try {
        const { id } = req.body
        let resp = await finalProduct.deleteOne({ _id: id });
        if (resp.deletedCount == 1) {
            res.status(200).json({ status: true })
        }
    } catch (err) {
        res.status(500).json({ staus: false, msg: 'err' })
        console.log(err)
    }
}

exports.editsku = async (req, res) => {
    try {
        const id = req.body.id
        const newsku = req.body.newsku
        let resp = await finalProduct.findOneAndUpdate(
            { _id: id },
            { $set: { SKU: newsku } },
            {new:true}
        )
        res.status(200).json({status:true})
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: false, msg: err })
    }
}
