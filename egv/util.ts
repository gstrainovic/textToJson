export class Util {
    static parseGermanDate(val) {
        var parsed = val.match(/^(\d{1,2})\.\s?(\d{1,2}).\s?(\d{2,4})$/);
        if (parsed) {
            var year = (parsed[3].length === 2) ? parseInt('20' + parsed[3], 10) : parseInt(parsed[3], 10);
            var month = parseInt(parsed[2], 10) - 1;
            var day = parseInt(parsed[1]);
            return new Date(year, month, day);
        }
        return;
    }

    static isNumeric(str: any) {
        if (typeof str != "string") return false // we only process strings!  
        const anyStr: any = str
        return !isNaN(anyStr) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
            !isNaN(parseFloat(anyStr)) // ...and ensure strings of whitespace fail
    }

    static isStringArticleNumber(str: string): boolean {
        return str.length === 5 && this.isNumeric(str[0])
    }

    static formatDate(val: Date) {

        try {
            let ddn = val.getDate();
            let mmn = val.getMonth() + 1;
            let yyyy = val.getFullYear();

            const dd = (ddn < 10) ? (0 + ddn.toString()) : ddn.toString();
            const mm = (mmn < 10) ? (0 + mmn.toString()) : ddn.toString();

            return dd + '.' + mm + '.' + yyyy;
        } catch { return "" }


    }

    static parseGermanNumber(number: string): number {
        return parseFloat(number.replace(/[.]/g, "").replace(/,/g, "."))
    }


}


