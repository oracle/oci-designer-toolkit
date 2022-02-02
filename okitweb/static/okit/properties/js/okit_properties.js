/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded OKIT Properties Javascript');

class OkitResourceProperties {
    constructor (resource) {
        this.resource = resource
        this.id = this.toId(this.resource.resource_type)
        this.properties_div = '<div></div>'
        this.build()
    }

    build() {
        this.buildCommon()
        this.buildResource()
        this.buildTags()
    }

    buildCommon() {
        const self = this
        this.properties_div = d3.create('div')
                                .attr('id', `${self.id}_editor`)
                                .attr('class', 'okit-property-editor')
        this.title = this.properties_div.append('div')
                                .attr('class', `property-editor-title`)
                                .append('h3')
                                .attr('class', `heading-background ${self.resource.read_only ? 'padlock-closed' : 'padlock-open'}`)
                                    .text(this.resource.resource_type)
        this.panel = this.properties_div.append('div')
                                .attr('id', `${self.id}_panel`)
                                .attr('class', 'okit-resource-properties-panel')
        this.tabbar = this.panel.append('div')
                                .attr('id', `${self.id}_tab_bar`)
                                .attr('class', 'okit-tab-bar')
        this.sheet_btn = this.tabbar.append('button')
                                .attr('id', `${self.id}_sheet_tab`)
                                .attr('class', 'okit-tab okit-tab-active')
                                .text('Properties')
                                .on('click', () => {
                                    $(`#${self.id}_panel .okit-tab-contents`).addClass('hidden')
                                    $(`#${self.id}_panel .okit-tab`).removeClass('okit-tab-active')
                                    $(`#${self.id}_sheet_tab`).addClass('okit-tab-active')
                                    $(`#${self.id}_sheet_contents`).removeClass('hidden')
                                })
        this.notes_btn = this.tabbar.append('button')
                                .attr('id', `${self.id}_notes_tab`)
                                .attr('class', 'okit-tab okit-tab-active')
                                .text('Documentation')
                                .on('click', () => {
                                    $(`#${self.id}_panel .okit-tab-contents`).addClass('hidden')
                                    $(`#${self.id}_panel .okit-tab`).removeClass('okit-tab-active')
                                    $(`#${self.id}_notes_tab`).addClass('okit-tab-active')
                                    $(`#${self.id}_notes_contents`).removeClass('hidden')
                                })
        this.sheet = this.panel.append('div')
                                .attr('id', `${self.id}_properties_sheet`)
                                .attr('class', 'okit-tab-contents')
        this.notes = this.panel.append('div')
                                .attr('id', `${self.id}_notes`)
                                .attr('class', 'okit-tab-contents hidden')
                                .append('textarea')
                                    .attr('id', `${self.id}_documentation`)
                                    .attr('class', 'resource-documentation')
                                    .attr('name', 'documentation')
                                    .attr('wrap', 'soft')
                                    .attr('placeholder', `Markdown documentation for this ${this.resource.resource_type} resource`)
                                    .on('change', () => self.resource.documentation = $(`#${self.id}_notes`).val())

        console.info('Properties div', this.properties_div)
    }

    buildResource() {}

    buildTags() {}

    load() {}

    show(parent) {
       parent.childNodes.length > 0 ? parent.replaceChild(this.properties_div.node(), parent.childNodes[0]) : parent.appendChild(this.properties_div.node()) 
    }

    toId(name) {
        return name.replaceAll(' ', '_').toLowerCase()
    }

    /*
    ** Property Creation Routines
    */   
    append = (parent, child) => parent.append(() => child.node())

    createTable(label='', id='', idx=0, callback=undefined, data={}) {
        const table = d3.create('div').attr('class', 'table okit-table')
        const thead = table.append('div').attr('class', 'thead')
        const tbody = table.append('div').attr('class', 'tbody').attr('id', this.tbodyId(id, idx))
        return [thead, tbody]
    }

    createPropertiesTable(label='', id='', idx=0, callback=undefined, data={}) {
        const [thead, tbody] = this.createTable(label, id, idx, callback, data)
        const row = thead.append('div').attr('class', 'tr')
        row.append('div').attr('class', 'th').text('Property')
        row.append('div').attr('class', 'th').text('Value')
        return [thead, tbody]
    }

    createArrayTable(label='', id='', idx=0, callback=undefined, data={}) {
        const [thead, tbody] = this.createTable(label, id, idx, callback, data)
        const row = thead.append('div').attr('class', 'tr')
        row.append('div').attr('class', 'th').text(label)
        row.append('div').attr('class', 'th add-property action-button-background action-button-column').on('click', callback)
        return [thead, tbody]
    }

    createDetailsSection(label='', id='', idx=0, callback=undefined, data={}, open='open') {
        const details = d3.create('details').attr('class', 'okit-details').attr('open', open)
        details.append('summary').text(label)
        const div = details.append('div').attr('class', 'okit-details-body')
        return div
    }

    addPropertyHTML(parent, type='text', label='', id='', idx=0, callback=undefined, data={}) {
        let element = undefined;
        parent = (typeof parent === 'string') ? d3.select(`#${parent}`) : parent
        // Check to see if we require a collapsable group
        if (type === 'array') {
            const table = parent.append('div').attr('class', 'table okit-table')
            const thead = table.append('div').attr('class', 'thead')
            const row = thead.append('div').attr('class', 'tr')
            row.append('div').attr('class', 'th').text(label)
            row.append('div').attr('class', 'th add-property action-button-background action-button-column').on('click', callback)
            // element = table.append('div').attr('class', 'tbody').attr('id', `${label.replaceAll(' ', '_').toLowerCase()}_tbody${idx}`)
            element = table.append('div').attr('class', 'tbody').attr('id', this.tbodyId(id, idx))
        } else if (type === 'object') {
            const details = parent.append('details').attr('class', 'okit-details').attr('open', 'open')
            details.append('summary').text(label)
            element = details.append('div').attr('class', 'okit-details-body')
        } else if (type === 'object-input') {
            const details = parent.append('details').attr('class', 'okit-details').attr('open', 'open')
            details.append('summary').append('input').attr('name', this.inputId(id, idx)).attr('id', this.inputId(id, idx)).attr('type', 'text').attr('class', 'okit-property-value').on('blur', callback)
            element = details.append('div').attr('class', 'okit-details-body')
        } else if (type === 'row') {
            const row = parent.append('div').attr('class', 'tr').attr('id', this.trId(id, idx))
            element = row.append('div').attr('class', 'td')
            row.append('div').attr('class', 'td delete-property action-button-background delete').on('click', callback)
        } else if (type === 'properties') {
            const table = parent.append('div').attr('class', 'table okit-table okit-properties-table')
            element = table.append('div').attr('class', 'tbody')
        } else if (type === 'checkbox') {
            const row = parent.append('div').attr('class', 'tr').attr('id', this.trId(id, idx))
            row.append('div').attr('class', 'td')
            const cell = row.append('div').attr('class', 'td')
            element = cell.append('input').attr('type', 'checkbox').attr('id', this.inputId(id, idx)).attr('class', 'okit-property-value').on('input', callback)
            cell.append('label').attr('for', this.inputId(id, idx)).text(label)
        } else {
            const row = parent.append('div').attr('class', 'tr').attr('id', this.trId(id, idx))
            row.append('div').attr('class', 'td').text(label)
            if (['text', 'password', 'email', 'date', 'number'].includes(type)) {
                element = row.append('div').attr('class', 'td').append('input').attr('name', this.inputId(id, idx)).attr('id', this.inputId(id, idx)).attr('type', type).attr('class', 'okit-property-value').on('blur', callback)
                if (data) {
                    if (data.min) element.attr('min', data.min)
                    if (data.max) element.attr('max', data.max)
                }
            } else if (type === 'ipv4_cidr') {
                const placeholder = '0.0.0.0/0'
                const ipv4_cidr_regex = "^((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/(3[0-2]|[1-2][0-9]|[0-9]))$)+"
                element = row.append('div').attr('class', 'td').append('input').attr('name', this.inputId(id, idx)).attr('id', this.inputId(id, idx)).attr('type', 'text').attr('class', 'okit-property-value').attr('pattern', ipv4_cidr_regex).attr('title', "IPv4 CIDR block").attr('placeholder', placeholder).on('blur', callback)
            } else if (type === 'select') {
                element = row.append('div').attr('class', 'td').append('select').attr('id', this.inputId(id, idx)).attr('class', 'okit-property-value').on('change', callback)
            } else if (type === 'multiselect') {
                element = row.append('div').attr('class', 'td').append('div').attr('id', this.inputId(id, idx)).attr('class', 'okit-multiple-select').on('change', callback)
            }
        }
        return element;
    }
    tbodyId = (id, idx) => `${id.replaceAll(' ', '_').toLowerCase()}_tbody${idx}`
    trId = (id, idx) => `${id.replaceAll(' ', '_').toLowerCase()}${idx}_row`
    inputId = (id, idx) => `${id.replaceAll(' ', '_').toLowerCase()}${idx}`
}
