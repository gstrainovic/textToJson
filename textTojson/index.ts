import { AzureFunction, Context, HttpRequest } from "@azure/functions"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    const input : string = req.body // (req.query.name || (req.body && req.body.name));
    const articlesAr = input.match(/Pos([\s\S]*?)Zwischensumme/);
    const firstItem = articlesAr.filter(x => typeof x!==undefined).shift();

    if (firstItem === "") {
        var responseMessage = 'Wörter Pos und oder Zwischensumme nicht gefunden'
    } else {
        const articelStr = firstItem.replace('Zwischensumme','')
        const lines = articelStr.split('\n')
        var str = articelStr//'Type1\tCode\tPrice\tQuantity\r\n4X-US0U-R114\tB004P2NG0K\t37.99\t15\r\nGC-NP0Y-XPOA\tB007KAYCGQ\t150.00\t4\r\nRL-E0ZD-16G1\tB016FWZDO4\t28.00\t\r\n'
        var rows = str.split(/\r\n/g);
        var title = rows.shift().replace(/[^a-zA-Z]+/g, '').split(/(?=[A-Z])/);
        var altered = rows.reduce( function(arr, cur) {
            var x = {};
            if(cur.length){
                var parts = cur.split('  ');    
                parts.map( function(v,i){
                    x[title[i]] = v;
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