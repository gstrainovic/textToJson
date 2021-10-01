import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { Invoice } from "./invoice";
import { EgvInvoiceHandler } from './my-testhandler'

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    // const name = (req.query.name || (req.body && req.body.name));
    const invoice = new Invoice()
    const input = req.body;

    const pdfFilePath = './egv/666856.pdf'
    const sample = './egv/sample_doc.pdf'
    // var pdfreader = require("pdfreader");

    let ar = [];

    var textmeta = require('textmeta');

    var rules = [
        {
          "key": "Title",
          "type": "FirstSingle",
          "expression": "Title:\\s+([^\\n]+)",
          "default": "Unknown"
        },
        {
          "key": "Author",
          "type": "FirstSingle",
          "expression": "Author:\\s+([^\\n]+)",
          "default": "Unknown"
        },
        {
          "key": "Description",
          "type": "FirstSingle",
          "expression": "Description:([\\s\\S]+)Technologies used:",
          "default": "n/a"
        },
        {
          "key": "Nettos",
          "type": "AllUnique",
          "startKeyword": "Summen Lfsch:",
          "endKeyword": "=",
          "expression": "\\S\\s+([^\\n]+)",
          "default": "n/a",
          "options": {
            "flags": "gi"
          }    
        }
      ]
    
    const result = await textmeta.extractFromPDFFile(pdfFilePath, rules)
    invoice.pdftext = result.text
    

    const egv = new EgvInvoiceHandler()
    const res = egv.processInvoice(invoice)
    const responseMessage = result.text
    context.res = {
        // status: 200, /* Defaults to 200 */
        body: responseMessage
    };

};

export default httpTrigger;