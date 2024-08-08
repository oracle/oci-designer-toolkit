/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Variables View Javascript');

class OkitVariablesView extends OkitJsonView {

    constructor(okitjson=null, oci_data=null, resource_icons=[], parent_id = 'variables-div') {
        super(okitjson, oci_data, resource_icons, parent_id);
        this.currency = 'GBP'
    }
    get model() {return this.okitjson;}
    get data() {return this.oci_data;}

    static newView(model, oci_data=null, resource_icons=[], parent_id = 'variables-div') {
        return new OkitVariablesView(model, oci_data, resource_icons, parent_id)
    }

    draw(for_export=false) {
        this.newCanvas()
        this.drawVariablesPanel()
    }

    newCanvas(width=100, height=100, for_export=false) {
        const canvas_div = d3.select(d3Id(this.parent_id));
        // Empty existing Canvas
        canvas_div.selectAll('*').remove();
        // Variables
        this.variables_div = canvas_div.append('div').attr('id', 'variables_div').attr('class', 'okit-variables-details')
        this.variables_details = this.variables_div.append('details').attr('class', 'okit-details').attr('open', true)
        this.variables_details.append('summary').attr('class', 'summary-background').append('label').text('Variables')
        this.variables_details_div = this.variables_details.append('div').attr('class', 'okit-details-body')
    }

    drawVariablesPanel() {
        this.variables_details_div.selectAll('*').remove()
        const table = this.variables_details_div.append('div').attr('class', 'table okit-table')
        const thead = table.append('div').attr('class', 'thead')
        const tbody = table.append('div').attr('class', 'tbody')
        const tr = thead.append('div').attr('class', 'tr')
        tr.append('div').attr('class', 'th').text('Name')
        tr.append('div').attr('class', 'th').text('Default')
        tr.append('div').attr('class', 'th').text('Description')
        tr.append('div').attr('class', 'th add-property action-button-background action-button-column').on('click', () => this.addVariable(tbody))
        this.model.variables_schema.variables.forEach((v) => this.addVariableHtml(tbody, v))
    }

    addVariableHtml(tbody, v) {
        const tr = tbody.append('div').attr('class', 'tr')
        const name_regex = '^(?=^.{1,}$)([a-zA-Z]+[a-zA-Z0-9_]*)$'
        tr.append('div').attr('class', 'td').append('input').attr('type', 'text').attr('class', 'okit-property-value').attr('pattern', name_regex).attr('title', 'Only alphanumeric characters and underscores.').attr('minlength', 1).on('blur', (d, i, n) => {if (n[i].reportValidity()) v.name = n[i].value}).property('value', v.name)
        tr.append('div').attr('class', 'td').append('input').attr('type', 'text').attr('class', 'okit-property-value').on('blur', (d, i, n) => v.default = n[i].value).property('value', v.default)
        tr.append('div').attr('class', 'td').append('input').attr('type', 'text').attr('class', 'okit-property-value').on('blur', (d, i, n) => v.description = n[i].value).property('value', v.description)
        tr.append('div').attr('class', 'td delete-property action-button-background delete').on('click', () => this.deleteVariable(tr, v))
    }

    addVariable(tbody) {
        const v = this.model.newVariable()
        this.model.variables_schema.variables.push(v)
        this.addVariableHtml(tbody, v)
    }

    deleteVariable(tr, v) {
        this.model.variables_schema.variables = this.model.variables_schema.variables.filter((e) => e !== v)
        tr.remove()
    }

}

