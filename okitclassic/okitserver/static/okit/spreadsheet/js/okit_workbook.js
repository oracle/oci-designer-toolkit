/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded OKIT Workbook Javascript');

class OkitWorkbook {
    constructor() {
        this.worksheets = []
    }

    exportToXls() {
        return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:html="https://www.w3.org/TR/html401/">
${this.worksheets.map(ws => `${ws.exportToXls()}`).join('\n')}
</Workbook>`
    }
}

class OkitWorksheet {
    constructor(name) {
        this.name = name
        this.rows = []
    }

    exportToXls() {
        return `<Worksheet ss:Name="${this.name}">
<Table>
${this.header.cells.map((k, i) => `<Column ss:Index="${i + 1}" ss:AutoFitWidth="1"/>`).join('\n')}
${this.header.exportToXls()}
${this.rows.map(row => `${row.exportToXls()}`).join('\n')}
</Table>
</Worksheet>`
    }
}

class OkitWorksheetRow {
    constructor() {
        this.cells = []
    }


    exportToXls() {
        return `<Row>
${this.cells.map(cell => `${cell.exportToXls()}`).join('\n')}
</Row>`
    }
}

class OkitWorksheetCell {
    constructor(data, type=undefined) {
        this.data = data 
        this.type = type 
    }

    exportToXls() {
        return `<Cell><Data ss:Type="${this.type ? titleCase(this.type) : 'String'}">${this.data}</Data></Cell>`
    }
}
