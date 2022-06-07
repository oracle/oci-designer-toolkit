/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded BoM View Javascript');

class OkitBoMView extends OkitJsonView {

    constructor(okitjson=null, oci_data=null, resource_icons=[], parent_id = 'bom-div') {
        super(okitjson, oci_data, resource_icons, parent_id);
    }
    get model() {return this.okitjson;}
    get data() {return this.oci_data;}

    static newView(model, oci_data=null, resource_icons=[], parent_id = 'bom-div') {
        return new OkitBoMView(model, oci_data, resource_icons, parent_id)
    }

    draw(for_export=false) {
        this.newCanvas()
        this.drawBoMPanel()
        this.drawEstimatePanel()
    }

    newCanvas(width=100, height=100, for_export=false) {
        const canvas_div = d3.select(d3Id(this.parent_id));
        // Empty existing Canvas
        canvas_div.selectAll('*').remove();
        // BoM
        this.bom_div = canvas_div.append('div').attr('id', 'bom_div').attr('class', 'okit-bom-bom-details')
        this.estimate_div = canvas_div.append('div').attr('id', 'bom_div').attr('class', 'okit-bom-estimate-details')
    }

    drawBoMPanel() {
        const table = this.bom_div.append('div').attr('class', 'table okit-table')
        const thead = table.append('div').attr('class', 'thead')
        const tr = thead.append('div').attr('class', 'tr')
        tr.append('div').attr('class', 'th').text('SKU')
        tr.append('div').attr('class', 'th').text('Description')
        tr.append('div').attr('class', 'th').text('Metric')
        tr.append('div').attr('class', 'th').text('List Price')
        tr.append('div').attr('class', 'th').text('Quantity')
        tr.append('div').attr('class', 'th').text('Units')
        tr.append('div').attr('class', 'th').text('Price per Month')
        const tbody = table.append('div').attr('class', 'tbody')
        const bom = okitOciProductPricing ? okitOciProductPricing.generateBoM(this.model) : {}
        Object.entries(bom).forEach(([k, v]) => {
            const tr = thead.append('div').attr('class', 'tr')
            tr.append('div').attr('class', 'td').text(k)
            tr.append('div').attr('class', 'td').text(v.description)
            tr.append('div').attr('class', 'td').text(v.metric)
            tr.append('div').attr('class', 'td right-align').text(`$${v.list_price.toFixed(5)}`)
            tr.append('div').attr('class', 'td right-align').text(v.quantity)
            tr.append('div').attr('class', 'td right-align').text(v.units)
            tr.append('div').attr('class', 'td right-align').text(`$${(Math.round((v.price_per_month + Number.EPSILON) * 100)/100).toFixed(2)}`)
        })
    }

    drawEstimatePanel() {}

}


okitViewClasses.push(OkitBoMView);

let okitBoMView = null;
