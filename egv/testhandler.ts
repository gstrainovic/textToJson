import { InvoiceDescriptor, ArticlePosition } from "./invoicedescriptor";
import { Util } from "./util";
import { Invoice } from "./invoice";
// import { InvoiceHandler } from "./invoicehandler";

enum Mode { Simple, PerDelivery }

let mode: Mode
//mode = Mode.Simple
mode = Mode.PerDelivery

/*  
 */
export class EgvInvoiceHandler { //implements InvoiceHandler {
    signalInterest(invoice: Invoice): boolean {
        return !!invoice.pdftext && invoice.pdftext.indexOf("lautet DE12ZZZ00000373688") != -1
    }

    processInvoice(invoice: Invoice) {
        if (!invoice.pdftext) {
            return null
        }
        const deliveryNumbers = new Set<string>()
        let invoiceDescriptor: InvoiceDescriptor = {
            verify: true,
            net: true,
            documentDate: "11.11.2020",
            documentNumber: "",
            text: "",
            deliveryDateFrom: "01.01.2000",
            deliveryDateTo: "01.01.2000",
            workflow: "EGV-Prozess",
            kreditorAccount: "70001",
            positions: [
            ],
            articles: [],
            raw: invoice.pdftext
        }

        const lines = invoice.pdftext.split("\n")
        const linesTrimed = lines.map(x => x.trim())
        const articleLines =
            linesTrimed
                .filter(x => Util.isStringArticleNumber(x.split(' ')[0]))
                .filter(x => x.includes('53501 GRAFSCHAFT') === false)
/*        
ART-NR ARTIKELBEZEICHNUNG                COLLI EINH. BER.MG. E-PREIS  NETTO EUR M
43049 TUFFI NATURJOGHURT 1,5% 5KG EIM     2   5,000  10,000  0,9800     9,80 1
03976 KISTE EUROPOOL HIN                          1       1  3,8600     3,86 2
*/

        function getOthers(s: string) {
            console.log(s)
            const sub = s.substring(43)
            const tr = sub.trim()
            const sp = tr.split(' ')
            const fi = sp.filter(x => x !== "")
            const ma = fi.map(x=>x.trim())
            return ma
        }

        articleLines.forEach(x =>
            invoiceDescriptor.articles.push({
                artNr: x.substring(0, 5).trim(),
                artikelb: x.substring(6, 38).trim(),
                colli: x.substring(38, 43).trim(),
                einh: getOthers(x)[0],
                berMg: getOthers(x)[1],
                ePreis: getOthers(x)[2],
                netto: getOthers(x)[3],
                m: getOthers(x)[4],
            })
        )

        let currentDeliveryNumber = ""
        let currentDeliveryDate: Date | undefined
        for (let i = 0, n = lines.length; i < n - 1; i++) {
            const curr = lines[i]
            const next = lines[i + 1]
            if (curr.indexOf("RE.-NR.") != -1 && !invoiceDescriptor.documentNumber) {
                const comps = next.trim().split(/\s+/)
                invoiceDescriptor.documentNumber = comps[comps.length - 3]
                const dateRaw = comps[comps.length - 2]
                console.log("dateRaw" + dateRaw + " " + Util.parseGermanDate(dateRaw))
                // invoiceDescriptor.documentDate = Util.formatDate(Util.parseGermanDate(dateRaw)?.getTime())
                invoiceDescriptor.deliveryDateFrom = invoiceDescriptor.documentDate
                invoiceDescriptor.deliveryDateTo = invoiceDescriptor.documentDate
                invoiceDescriptor.text = "Rechnung " + invoiceDescriptor.documentNumber
            }
            if (curr.indexOf("Lieferschein:") != -1) {
                const match = curr.match(/Lieferschein:\s*([0-9]+)\/Lieferdatum:([0-9.]+)/)
                if (match) {
                    currentDeliveryNumber = match[1]
                    currentDeliveryDate = Util.parseGermanDate(match[2])
                    deliveryNumbers.add(currentDeliveryNumber)
                    //log.debug("dn:" + currentDeliveryNumber + ", dd: " + currentDeliveryDate)
                }
            } else if (curr.indexOf("Summen Lfsch: ") != -1) {
                const comps = curr.trim().split(/\s+/)
                //log.debug("comps: ls: " + curr)
                let buf = ""
                comps.forEach((s, index) => buf += `[${index}]=${s}`)
                //log.debug(buf)
                if (mode == Mode.PerDelivery) {
                    const amount7 = Util.parseGermanNumber(comps[4])
                    const amount19 = Util.parseGermanNumber(comps[7])
                    if (amount7) {
                        invoiceDescriptor.positions.push({
                            account: "3300",
                            amount: amount7.toFixed(2),
                            text: "Lieferschein " + currentDeliveryNumber + " vom " + Util.formatDate(currentDeliveryDate) + " 7%",
                            vatKey: "V7",
                        })
                    }
                    if (amount19) {
                        invoiceDescriptor.positions.push({
                            account: "3400",
                            amount: amount19.toFixed(2),
                            text: "Lieferschein " + currentDeliveryNumber + " vom " + Util.formatDate(currentDeliveryDate) + " 19%",
                            vatKey: "V19",
                        })
                    }
                }
            } else if (curr.indexOf("NETTO 1 ") != -1 && curr.indexOf("Lfsch") == -1) {
                /*
                NETTO 1 MWST 7% NETTO 2 MWST 19% NETTO-GES MWST-GES RE.-BETRAG
                    3436,30 240,54 260,81 49,55 3697,11 290,09 3987,20
                */
                const comps = next.trim().split(/\s+/)
                //log.debug("xxxcomps: " + JSON.stringify(comps, null, 4))
                if (mode == Mode.Simple) {
                    const amount7 = Util.parseGermanNumber(comps[0])
                    const amount19 = Util.parseGermanNumber(comps[2])
                    if (amount7) {
                        invoiceDescriptor.positions.push({
                            account: "3300",
                            amount: amount7.toFixed(2),
                            text: "Gesamtrechnung 7%",
                            vatKey: "V7",
                        })
                    } else if (amount19) {
                        invoiceDescriptor.positions.push({
                            account: "3400",
                            amount: amount19.toFixed(2),
                            text: "Gesamtrechnung 19%",
                            vatKey: "V19",
                        })
                    }
                }
            }
        }

        if (mode == Mode.PerDelivery) {
            invoiceDescriptor.text = "Rechnung " + invoiceDescriptor.documentNumber + " für Lieferschein(e): "
                + Array.from(deliveryNumbers).sort().join(", ")
        }

        return invoiceDescriptor
    }

}