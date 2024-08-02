/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded BoM View Javascript');

class OkitBoMView extends OkitJsonView {

    constructor(okitjson=null, oci_data=null, resource_icons=[], parent_id = 'bom-div') {
        super(okitjson, oci_data, resource_icons, parent_id);
        this.currency = 'GBP'
    }
    get model() {return this.okitjson;}
    get data() {return this.oci_data;}

    static newView(model, oci_data=null, resource_icons=[], parent_id = 'bom-div') {
        return new OkitBoMView(model, oci_data, resource_icons, parent_id)
    }

    currencies = OkitOciProductPricing.currencies

    draw(for_export=false) {
        this.newCanvas()
        this.getBoM()
        this.drawBoMPanel()
        this.drawEstimatePanel()
    }

    newCanvas(width=100, height=100, for_export=false) {
        const canvas_div = d3.select(d3Id(this.parent_id));
        // Empty existing Canvas
        canvas_div.selectAll('*').remove();
        // Heading 
        this.heading_div = canvas_div.append('div').attr('id', 'bom_heading_div').attr('class', 'bom_heading')
        // Toolbar
        const heading_left_div = this.heading_div.append('div')
            .attr('class', 'okit-toolbar-left')
            .attr('id', 'bom_view_toolbar')
        const buttons_div = heading_left_div.append('div')
        const export_excel = buttons_div.append('div')
            .attr('class', 'excel okit-toolbar-button')
            .attr('title', 'Export to Excel')
            .on('click', () => {
                const wb = new BoMWorkbook(this.bom, this.estimate, this.currency)
                const uri = 'data:Application/octet-stream,' + encodeURIComponent(wb.exportToXls())
                const name = 'okit-bom.xls'
                triggerDownload(uri, name)
            })
        // this.currency_div = this.heading_div.append('div').attr('class', 'align-right')
        const heading_right_div = this.heading_div.append('div')
            .attr('class', 'okit-toolbar-right')
            .attr('id', 'bom_view_currency_estimate')
        const currency_estimate_div = heading_right_div.append('div')
        // this.currency_div = this.heading_div.append('div')
        const currency_select = currency_estimate_div.append('select').attr('id', 'bom_currency_select')
            .on('change', (d, i, n) => {
                this.currency = n[i].value
                this.getBoM()
                this.drawBoMPanel()
                this.drawEstimatePanel()
            })
        Object.entries(this.currencies).forEach(([k, v]) => currency_select.append('option').attr('value', k).text(`${k} - ${v.name}`))
        currency_select.property('value', this.currency)
        // this.header_estimate_div = this.heading_div.append('div')
        currency_estimate_div.append('span').text('Estimated Monthly Cost')
        this.header_estimate = currency_estimate_div.append('label').attr('class', 'bom_header_estimate').text('$0.00')
        // Safe Harbour
        this.safe_harbour_div = canvas_div.append('div').attr('id', 'bom_safe_harbour_div').attr('class', 'bom_safe_harbour')
        this.safe_harbour_div.append('p').attr('class', 'okit-cost-small-print')
            .text("The values displayed are purely for estimation purposes only and are generated from our public pricing pages. For accurate costing you will need to consult your OCI Account Manager.")
        // BoM
        this.bom_div = canvas_div.append('div').attr('id', 'bom_div').attr('class', 'okit-bom-bom-details')
        this.bom_details = this.bom_div.append('details').attr('class', 'okit-details').attr('open', true)
        this.bom_details.append('summary').attr('class', 'summary-background').append('label').text('Bill of Materials')
        this.bom_details_div = this.bom_details.append('div').attr('class', 'okit-details-body')
        // Estimate
        this.estimate_div = canvas_div.append('div').attr('id', 'estimate_div').attr('class', 'okit-bom-estimate-details')
        this.estimate_details = this.estimate_div.append('details').attr('class', 'okit-details').attr('open', true)
        this.estimate_details.append('summary').attr('class', 'summary-background').append('label').text('Cost Estimate')
        this.estimate_details_div = this.estimate_details.append('div').attr('class', 'okit-details-body')
        // Disclaimer
        this.disclaimer_div = canvas_div.append('div').attr('id', 'bom_disclaimer_div').attr('class', 'bom_disclaimer')
        this.disclaimer_div.append('p').attr('class', 'okit-cost-small-print')
            .text("Disclaimer:  This sample quote is provided solely for evaluation purposes and is intended to further discussions between you and Oracle.  This sample quote is not eligible for acceptance by you and is not a binding contract between you and Oracle for the services specified.  If you would like to purchase the services specified in this sample quote, please request that Oracle issue you a formal quote (which may include an OMA or a CSA if you do not already have an appropriate agreement in place with Oracle) for your acceptance and execution.  Your formal quote will be effective only upon Oracle's acceptance of the formal quote (and the OMA or CSA, if required).						")
    }

    drawBoMPanel() {
        this.bom_details_div.selectAll('*').remove()
        const table = this.bom_details_div.append('div').attr('class', 'table okit-table')
        const thead = table.append('div').attr('class', 'thead')
        const tr = thead.append('div').attr('class', 'tr')
        tr.append('div').attr('class', 'th').text('SKU')
        tr.append('div').attr('class', 'th').text('Quantity')
        tr.append('div').attr('class', 'th').text('Description')
        tr.append('div').attr('class', 'th').text('Metric')
        tr.append('div').attr('class', 'th').text('List Price')
        tr.append('div').attr('class', 'th').text('Units')
        tr.append('div').attr('class', 'th').text('Utilisation')
        tr.append('div').attr('class', 'th').text('Price per Month')
        const tbody = table.append('div').attr('class', 'tbody')
        Object.entries(this.bom).sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0).forEach(([k, v]) => {
            const tr = tbody.append('div').attr('class', 'tr')
            tr.append('div').attr('class', 'td').text(k)
            tr.append('div').attr('class', 'td right-align').text(v.quantity)
            tr.append('div').attr('class', 'td').text(v.description)
            tr.append('div').attr('class', 'td').text(v.metric)
            tr.append('div').attr('class', 'td right-align').append('pre').text(`${v.list_price}`)
            // tr.append('div').attr('class', 'td right-align').text(`${v.list_price}`)
            // tr.append('div').attr('class', 'td right-align').text(`${this.currencies[this.currency].symbol}${v.list_price.toFixed(5)}`)
            tr.append('div').attr('class', 'td right-align').text(v.units)
            tr.append('div').attr('class', 'td right-align').text(v.utilization)
            tr.append('div').attr('class', 'td right-align').text(OkitOciProductPricing.formatPrice(v.price_per_month, this.currency))
            // tr.append('div').attr('class', 'td right-align').text(`${this.currencies[this.currency].symbol}${(Math.round((v.price_per_month + Number.EPSILON) * 100)/100).toFixed(2)}`)
        })
        const estimate = Object.values(this.bom).reduce((p, v) => p + v.price_per_month, 0)
        console.info('Estimate Total', estimate)
        // this.header_estimate.property('value', `${this.currencies[this.currency].symbol}${(Math.round((estimate + Number.EPSILON) * 100)/100).toFixed(2)}`)
        // this.header_estimate.text(`${this.currencies[this.currency].symbol}${(Math.round((estimate + Number.EPSILON) * 100)/100).toFixed(2)}`)
        this.header_estimate.text(OkitOciProductPricing.formatPrice(estimate, this.currency))
    }

    drawEstimatePanel() {
        this.estimate_details_div.selectAll('*').remove()
        const table = this.estimate_details_div.append('div').attr('class', 'table okit-table')
        const thead = table.append('div').attr('class', 'thead')
        const tr = thead.append('div').attr('class', 'tr')
        tr.append('div').attr('class', 'th').text('Resource')
        tr.append('div').attr('class', 'th').text('Monthly Spend')
        const tbody = table.append('div').attr('class', 'tbody')
        // const bom = okitOciProductPricing ? okitOciProductPricing.generateBoM(this.model) : {estimate: {}}
        Object.entries(this.estimate).sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0).forEach(([k, v]) => {
            const tr = tbody.append('div').attr('class', 'tr')
            tr.append('div').attr('class', 'td').text(k)
            tr.append('div').attr('class', 'td right-align').text(OkitOciProductPricing.formatPrice(v, this.currency))
            // tr.append('div').attr('class', 'td right-align').text(`${this.currencies[this.currency].symbol}${(Math.round((v + Number.EPSILON) * 100)/100).toFixed(2)}`)
        })
    }

    getBoM(currency) {
        currency = currency ? currency : this.currency
        const bom = okitOciProductPricing ? okitOciProductPricing.generateBoM(this.model, currency) : {bom: {}, estimate: {}}
        this.bom = bom.bom
        this.estimate = bom.estimate
        console.info('BoM Panel Data', this.bom)
        console.info('Estimate Panel Data', this.estimate)
    }

}

okitViewClasses.push(OkitBoMView);

let okitBoMView = null;

class BoMWorkbook extends OkitWorkbook {
    constructor(bom={}, estimate={}, currency) {
        super()
        Object.defineProperty(this, 'bom', {get: () => {return bom}})
        Object.defineProperty(this, 'estimate', {get: () => {return estimate}})
        Object.defineProperty(this, 'currency', {get: () => {return currency}})
        this.build(bom, estimate)
    }

    currencies = OkitOciProductPricing.currencies

    build(bom, estimate) {
        bom = bom || this.bom || {}
        estimate = estimate || this.estimate || {}
        const bom_headings = ['Part', 'Quantity', 'Description', 'List Price', 'Units', 'Utilisation', 'Monthly Cost']
        // const bom_data = Object.entries(bom).reduce((arr, [k, v]) => [...arr, [k, v.quantity, `${v.description} (${v.metric})`, `${this.currencies[this.currency].symbol}${v.list_price.toFixed(5)}`, v.units, v.utilization, `${this.currencies[this.currency].symbol}${(Math.round((v.price_per_month + Number.EPSILON) * 100)/100).toFixed(2)}`]], [])
        const bom_data = Object.entries(bom).sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0).reduce((arr, [k, v]) => [...arr, [k, v.quantity, `${v.description} (${v.metric})`, v.list_price, v.units, v.utilization, `${this.currencies[this.currency].symbol}${(Math.round((v.price_per_month + Number.EPSILON) * 100)/100).toFixed(2)}`]], [])
        const bom_sheet = new BoMWorksheet('Bill of Materials', bom_data, bom_headings)
        const estimate_headings = ['OCI Resource', 'Monthly Cost']
        const estimate_data = Object.entries(estimate).reduce((arr, [k, v]) => [...arr, [k, `${this.currencies[this.currency].symbol}${(Math.round((v + Number.EPSILON) * 100)/100).toFixed(2)}`]], [])
        const estimate_sheet = new BoMWorksheet('Resource Costs', estimate_data, estimate_headings)
        this.worksheets = [bom_sheet, estimate_sheet]
    }
}

class BoMWorksheet extends OkitWorksheet {
    constructor(name, data, headings) {
        super(name)
        Object.defineProperty(this, 'data', {get: () => {return data}})
        Object.defineProperty(this, 'headings', {get: () => {return headings}})
        this.build(name, data, headings)
    }

    build(name, data, headings) {
        name = name || this.name
        data = data || this.data || []
        headings = headings || this.headings || []
        this.header = new OkitWorksheetRow()
        headings.forEach(k => this.header.cells.push(new BoMWorksheetCell(k)))
        data.forEach(r => this.rows.push(new BoMWorksheetRow(r)))
    }
}

class BoMWorksheetRow extends OkitWorksheetRow {
    constructor(data) {
        super()
        Object.defineProperty(this, 'data', {get: () => {return data}})
        this.build(data)
    }
    build(data) {
        data = data || this.data || []
        data.forEach(v => this.cells.push(new BoMWorksheetCell(this.getCellData(v), typeof v)))
    }

    getCellData(v) {
        return v
    }
}

class BoMWorksheetCell extends OkitWorksheetCell {
    constructor(data, type=undefined) {
        super(data, type)
    }
}
