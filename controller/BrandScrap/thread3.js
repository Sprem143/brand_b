
require('dotenv').config();
const apikey = process.env.API_KEY
const BrandUrl = require('../../model/Brand_model/brandurl');
const cheerio = require('cheerio')
const Product = require('../../model/Brand_model/products');
const { ZenRows } = require("zenrows");
// const Varientupc = require('../../model/Brand_model/varientupc')

// -------------save varient wise upc list--------
// const savevarientlist = async (html) => {
//     try {
//         const $ = cheerio.load(html);
//         let productData = null;
//         $('script').each((index, element) => {
//             const scriptContent = $(element).html();
//             const regex = /window\.product\s*=\s*({[^]*?});/;
//             const match = scriptContent.match(regex);
//             if (match) {
//                 try {
//                     productData = JSON.parse(match[1]);

//                 } catch (error) {
//                     console.error("Failed to parse JSON:", error);
//                 }
//             }
//         });
//         const colorToSize = productData.colorSizeMap.colorToSize
//         const result = {};
//         for (const color in colorToSize) {
//             const values = Object.values(colorToSize[color]);
//             result[color] = values;
//         }
//         for (const i in result) {
//             let obj = {
//                 varient: i,
//                 upc: result[i]
//             }
//             let newvarient = new Varientupc(obj);
//             await newvarient.save();
//         }
//     } catch (err) {
//         console.log(err)
//     }
// }

// --------start scrapping upc--------
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

const generatesku=(color,size)=>{
   if(color && size){
    color= color.replaceAll(' ','-').replaceAll('/','-').toUpperCase();
    let firstletter= color.charAt(0)
    color= color.slice(1)
    var modifiedColor=color
    if(color.length>10){
        let v=['A','E','I','O','U'];
        for (let i of v){
            modifiedColor  = color.replaceAll(i,'');
            color= modifiedColor
        }
    }
    if(color.length>10){
        let arr= color.split('-');
        for (let i=0; i<s.length; i++){
            arr[i]= arr[i].slice(0,3)
        }
        color= arr.join('-')
    }
  let sku=firstletter+color+'-'+size
  return sku;
   }else{
    return null
   }
}

const getupc = async (url) => {
    try {
        const client = new ZenRows(apikey);
        const request = await client.get(url, {
            premium_proxy: true,
            js_render: true,
        });
        const html = await request.text();
        // await savevarientlist(html)
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
            const color = id_color[productId]; 
            for (const [upc, size] of Object.entries(sizes)) {
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
                sku:generatesku(color_size[id[index]] ? color_size[id[index]].color : null,color_size[id[index]] ? color_size[id[index]].size : null,),
                discount: onsale[index] ? 0 : Number(coupon),
                offerend: offerend,
                url: url,
                imgurl: imgurl[index]
            }));
            // ---------removing out of stock products----------
            const filterProduct = products.filter((p) => p.quantity > 2);
            let saveProducts = await Product.insertMany(filterProduct)
                .catch(err => console.error("Error saving products:", err));
            if (saveProducts) {
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

exports.getproduct3 = async (req, res) => {
    try {
        const { url, arrayid } = req.body
        let result = await getupc(url);
        if (result === 1) {
            await BrandUrl.updateOne(
                { _id: arrayid },
                { $pull: { producturl: url } }
            )
        } else {
            console.log("UPC data not found or error occurred for:", url);
        }
        res.status(200).json({ status: true })

    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ status: false, error: 'Failed to fetch product data' });
    }
};
