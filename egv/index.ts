import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { Invoice } from "./invoice";
import {EgvInvoiceHandler} from './testhandler'




const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    // const name = (req.query.name || (req.body && req.body.name));
    const invoice = new Invoice()
    const input = req.body;
    invoice.pdftext = input;

    const egv = new EgvInvoiceHandler()
    const res = egv.processInvoice(invoice)
    const responseMessage = 'fix me'
    context.res = {
        // status: 200, /* Defaults to 200 */
        body: responseMessage
    };

};

export default httpTrigger;