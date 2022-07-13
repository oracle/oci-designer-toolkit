/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded OKIT Workbook Javascript');

class OkitWorkbook {
    constructor(model={}, data={}, elements={}) {
        // this.model = model
        // this.data = data
        // this.elements = elements 
        this.worksheets = []
        Object.defineProperty(this, 'model', {get: () => {return model}})
        Object.defineProperty(this, 'data', {get: () => {return data}})
        Object.defineProperty(this, 'elements', {get: () => {return elements}})
        this.build(model)
    }

    build(model, elements) {
        model = model || this.model || {}
        elements = elements || this.elements || {}
        Object.entries(model.getResourceLists()).sort((a, b) => a[0].localeCompare(b[0])).forEach(([key, value]) => {if (value.length) this.worksheets.push(new OkitWorksheet(this.generateSheetName(key), value, {...elements['common'], ...elements[key]}, this));})
    }

    generateSheetName(name) {return titleCase(name.replaceAll('_', ' '))}

    getResource(lookup, id) {
        const sections = lookup.split('.');
        const obj = sections[0];
        const getFunction = sections[1];
        const resource = this[obj][getFunction](id);
        return resource ? resource : {display_name: 'Unknown'}
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
    constructor(name, resources, elements, workbook) {
        this.name = name
        // this.resources = resources
        // this.elements = elements
        // this.workbook = workbook
        this.rows = []
        Object.defineProperty(this, 'workbook', {get: () => {return workbook}})
        Object.defineProperty(this, 'resources', {get: () => {return resources}})
        Object.defineProperty(this, 'elements', {get: () => {return elements}})
        this.build(name, resources, elements)
    }

    build(name, resources, elements, workbook) {
        name = name || this.name
        resources = resources || this.resources || []
        elements = elements || this.elements || {}
        workbook = workbook || this.workbook
        this.header = new OkitWorksheetRow()
        Object.keys(elements).forEach(k => this.header.cells.push(new OkitWorksheetCell(k)))
        resources.forEach(r => this.rows.push(new OkitWorksheetRow(r, elements, workbook)))
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
    constructor(resource, elements, workbook) {
        // this.resource = resource
        // this.elements = elements
        // this.workbook = workbook
        Object.defineProperty(this, 'workbook', {get: () => {return workbook}})
        Object.defineProperty(this, 'resource', {get: () => {return resource}})
        Object.defineProperty(this, 'elements', {get: () => {return elements}})
        this.cells = []
        this.build(resource, elements)
    }

    build(resource, elements, workbook) {
        resource = resource || this.resource || {}
        elements = elements || this.elements || {}
        workbook = workbook || this.workbook
        Object.values(elements).forEach(v => this.cells.push(new OkitWorksheetCell(this.getCellData(resource, v, workbook))))
    }

    getCellData(resource, value, workbook) {
        let cell_data = '';
        if (value.lookup) {
            if (Array.isArray(resource[value.property])) {
                const array_data = resource[value.property].map(id => workbook.getResource(value.lookup, id).display_name);
                cell_data = array_data.join(', ');
            } else {
                const lookup = workbook.getResource(value.lookup, resource[value.property]);
                if (lookup && Array.isArray(lookup)) {
                    cell_data = lookup.map(l => l.display_name).join(', ');
                } else if (lookup) {
                    cell_data = lookup.display_name;
                } else {
                    cell_data = '';
                }
            }
        } else {
            cell_data = this.getValue(resource, value.property);
        }
        return cell_data
    }

    getValue(resource, key) {
        const keys = key.split('.');
        if (keys.length > 1) {
            return this.getValue(resource[keys[0]], keys.slice(1).join('.'));
        } else {
            return resource[key];
        }
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
        return `<Cell><Data ss:Type="${this.type ? this.type : 'String'}">${this.data}</Data></Cell>`
    }
}
