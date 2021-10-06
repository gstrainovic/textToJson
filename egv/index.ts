import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import HTTP_CODES from "http-status-enum";
import * as multipart from "parse-multipart";
import { Invoice } from "./invoice";
import { EgvInvoiceHandler } from "./testhandler";
import * as AdmZip from "adm-zip";
import * as textmeta from "textmeta";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<any> {
  context.log("upload HTTP trigger function processed a request.");

  if (!req.body || !req.body.length) {
    context.res.body = `Request body is not defined`;
    context.res.status = HTTP_CODES.BAD_REQUEST;
  }


  // Each chunk of the file is delimited by a special string
  const bodyBuffer = Buffer.from(req.body);
  const boundary = multipart.getBoundary(req.headers["content-type"]);
  const parts = multipart.Parse(bodyBuffer, boundary);

  // The file buffer is corrupted or incomplete ?
  if (!parts?.length) {
    context.res.body = `File buffer is incorrect`;
    context.res.status = HTTP_CODES.BAD_REQUEST;
  }

  if (parts[0]?.filename) {
    console.log(`Original filename = ${parts[0]?.filename}`);
  }
  if (parts[0]?.type) console.log(`Content type = ${parts[0]?.type}`);
  if (parts[0]?.data?.length) console.log(`Size = ${parts[0]?.data?.length}`);

  const buffer = parts[0]?.data;
  const invoice = new Invoice();

  var rules = [
    {
      key: "Title",
      type: "FirstSingle",
      expression: "Title:\\s+([^\\n]+)",
      default: "Unknown",
    },
    {
      key: "Author",
      type: "FirstSingle",
      expression: "Author:\\s+([^\\n]+)",
      default: "Unknown",
    },
    {
      key: "Description",
      type: "FirstSingle",
      expression: "Description:([\\s\\S]+)Technologies used:",
      default: "n/a",
    },
    {
      key: "Lieferschein",
      type: "All",
      startKeyword: "Lieferschein",
      endKeyword: "Summen",
      expression: "\\S\\s+([^\\n]+)",
      // expression: "",
      default: "n/a",
      options: {
        flags: "gi",
      },
    },
  ];

  const zip = new AdmZip(buffer);
  const spath = "./egv/"
  zip.extractAllTo(/*target path*/ spath, /*overwrite*/ true);
  zip.writeZip(spath+'new.zip')

  var document

  zip.getEntries().forEach(function (entry) {
    if (entry.entryName.toLowerCase().endsWith('.pdf')) {
      document = zip.readFile(entry)
    }
  })

  const result = await textmeta.extractFromPDFBuffer(document, rules);
  invoice.pdftext = result.text;
  const egv = new EgvInvoiceHandler();
  const res = egv.processInvoice(invoice);
  const responseMessage = JSON.stringify(res);

  context.res = {
    // status: 200, /* Defaults to 200 */
    body: responseMessage
  }
}
export default httpTrigger;
