
const cheerio = require('cheerio')

const generatesku=(upc,color,size)=>{
    if(color && size){
     let a= size.split(' ');
     if(a[1] && a[1].length>1){
        a[1]= a[1].slice(0,1)
     }
     a=a.join('');
     size=a
     color= color.replaceAll(' ','-').replaceAll('/','-').toUpperCase();
     let firstletter= color.charAt(0)
     color= color.slice(1)
     var modifiedColor=color
     if(color.length>12){
         let v=['A','E','I','O','U'];
         for (let i of v){
             modifiedColor  = color.replaceAll(i,'');
             color= modifiedColor
         }
     }
     if(color.length>12){
         let arr= color.split('-');
         for (let i=0; i<arr.length; i++){
             arr[i]= arr[i].slice(0,3)
         }
         color= arr.join('-')
     }
   let sku='RC-R1-'+upc+'-'+firstletter+color+'-'+size
   sku.replace('--','-')
   sku.replace('--','-')
   return sku;
    }else{
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

 module.exports = {generatesku,fetchAndExtractVariable, fetchProductData}