   


/*
 * Definition of the invoice datastructure that is accepted
 * by the SCopevisio External Invoice Processeor
 */

export interface InvoiceDescriptor {
    documentDate?: string              // document date like this  "25.10.2020" or as timestamp
    deliveryDateFrom?: string          // deliveryDate optional
    deliveryDateTo?: string            // end of deliveryDate / Leistungszeitraum, optional implies deliveryDateFrom
    documentNumber?: string
    text?: string
    net: boolean                       // net otherweise gross
    verify: boolean                    // formally verify the invoice
    workflow?: string                  // optional workflow name
    zone?: string                      // optional zone/rechnungskreis number
    kreditorAccount?: string           // optional kreiitor account number
    taxCountryCodeIso2?: string        // optional country iso2-code (DE, IT, etc) for the tax base
    positions: InvoiceDescriptorPosition[]
}

export interface InvoiceDescriptorPosition {
    amount: string        // monetary values using . as decimal-point (english/us)
    text: string          // text
    account: string       // account number
    vatKey?: string       // optional vakkey
    dimension1?: number
    dimension2?: number
    dimension3?: number
    dimension4?: number
    dimension5?: number
    dimension6?: number
    dimension7?: number
    dimension8?: number
    dimension9?: number
    dimension10?: number
}