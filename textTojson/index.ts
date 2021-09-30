import { AzureFunction, Context, HttpRequest } from "@azure/functions"

function isLastCharALetter(str : string) {
    const lastChar = str.slice(-1)
    return lastChar.toLowerCase() != lastChar.toUpperCase();
}

function isALetterString(str : string) {
    return str.toLowerCase() != str.toUpperCase();
}

function isNumeric(str : any) {
    if (typeof str != "string") return false // we only process strings!  
    const anyStr : any = str
    return !isNaN(anyStr) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
           !isNaN(parseFloat(anyStr)) // ...and ensure strings of whitespace fail
  }

function isArticleNumber(str: string) {
    return str.charAt(0)==='6' && isLastCharALetter(str) && str.length===9
}

// function isFirstCharANumber(str: string) {
//     const firstChar = str.charAt(0)
//     return +firstChar
// }

// function isFirstCharASix(str: string) {
//     const firstChar = str.charAt(0)
//     return firstChar === '6'
// }

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    const input : string = req.body // (req.query.name || (req.body && req.body.name));
    const articlesAr = input.match(/Pos([\s\S]*?)Zwischensumme/);
    const firstItem = articlesAr.filter(x => typeof x!==undefined).shift();

    if (firstItem === "") {
        var responseMessage = 'Wörter Pos und oder Zwischensumme nicht gefunden'
    } else {
        const articelStr = firstItem.replace('Zwischensumme','').replace(';    ','')
        // const lines = articelStr.split('\n') 
        // const linesFromFirst = lines.slice(2)
        var str = articelStr//'Type1\tCode\tPrice\tQuantity\r\n4X-US0U-R114\tB004P2NG0K\t37.99\t15\r\nGC-NP0Y-XPOA\tB007KAYCGQ\t150.00\t4\r\nRL-E0ZD-16G1\tB016FWZDO4\t28.00\t\r\n'
        var rows = str.split(/\r\n/g)
        var title = rows.shift().replace(/[^a-zA-Z]+/g, '').split(/(?=[A-Z])/);
        var altered = rows.reduce( function(arr, cur) {
            var x = {};
            if(cur.length){
                const parts = cur.split('  ');    
                const nparts = [""];
                nparts[0] = isNumeric(parts[0]) ? parts[0] : "" ;
                nparts[1] = isNumeric(parts[1]) ? parts[1] : "" ;
                nparts[2] = isALetterString(parts[2]) ? parts[2] : "" ;
                isArticleNumber(parts[3]) ? parts[3] : parts.slice(3) ;
                nparts[4] = parts[4];
                nparts[5] = parts[5];
                nparts[6] = parts[6];
                nparts.map( function(v,i){
                        x[title[i]] = v;
                    // if (title[i] === 'Artikelnr') {
                    //     if ( { // first character a number, 
                    //         x[title[i]] = v;
                    //     } else {
                    //         x[title[i]] = "";
                    //     }
                    // } else {
                    //     x[title[i]] = v;
                    // }
                } );
                arr.push(x);
            }
            return arr;
        }, [] );
        var responseMessage = JSON.stringify(altered);
    }

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: responseMessage
    };

};

export default httpTrigger;