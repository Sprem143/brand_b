
require('dotenv').config();
const apikey = process.env.API_KEY
const BrandUrl = require('../../model/Brand_model/brandurl');
const Product = require('../../model/Brand_model/products');
const { ZenRows } = require("zenrows");
const {generatesku, fetchAndExtractVariable, fetchProductData}= require('../utils')


const getupc = async (url) => {
    try {
        const client = new ZenRows(apikey);
        const request = await client.get(url, {
            premium_proxy: true,
            js_render: true,
        });
        const html = await request.text();
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
            let products = upc.map((u, index) => ({
                name: name,
                upc: u,
                price: Number(data.product_promotedCoupon[0].cpnDiscount) > 0 && Boolean(onsale[index]) === false ? price[index] * (1 - (coupon / 100)) : price[index],
                quantity: Number(num[index]),
                productid: id[index],
                color: color_size[id[index]] ? color_size[id[index]].color : null,
                size: color_size[id[index]] ? color_size[id[index]].size : null,
                sku:generatesku(u,color_size[id[index]] ? color_size[id[index]].color : null,color_size[id[index]] ? color_size[id[index]].size : null,),
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

exports.getproduct7 = async (req, res) => {
    try {
        const { url, arrayid } = req.body
        let result = await getupc(url);
        if (result === 1) {
            await BrandUrl.updateOne(
                { _id: arrayid },
                { $pull: { producturl: url } }
            )
            res.status(200).json({ status: true })
        } else {
            res.status(200).json({ status: false })
            console.log("UPC data not found or error occurred for:", url);
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ status: false, error: 'Failed to fetch product data' });
    }
};
