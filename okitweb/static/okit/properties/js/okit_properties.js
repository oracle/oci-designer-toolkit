/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded OKIT Properties Javascript');

class OkitResourceProperties {
    resource_tabs = []
    constructor (resource, resource_tabs=[]) {
        this.resource = resource
        this.resource_tabs = resource_tabs
        this.id = this.toId(this.resource.resource_type)
        this.properties_div = '<div></div>'
        this.build()
    }

    compartment_filter = (r) => r.compartment_id.toString() === this.resource.compartment_id.toString()
    vcn_filter = (r) => r.vcn_id.toString() === this.resource.vcn_id.toString()
    subnet_filter = (r) => r.subnet_id.toString() === this.resource.subnet_id.toString()

    build() {
        this.buildBaseSheet()
        this.buildCore()
        this.buildResource()
        this.buildTags()
    }

    buildBaseSheet() {
        const self = this
        const tabs = ['Properties', ...this.resource_tabs, 'Documentation', 'Tags']
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
        tabs.forEach((name, i) => {
            const tab_id = name.toLowerCase().replaceAll(' ', '_')
            self[`${tab_id}_btn`] = self.tabbar.append('button')
                                        .attr('id', `${self.id}_${tab_id}_tab`)
                                        .attr('class', `okit-tab ${i === 0 ? 'okit-tab-active' : ''}`)
                                        .text(name)
                                        .on('click', () => {
                                            $(`#${self.id}_panel .okit-tab-contents`).addClass('hidden')
                                            $(`#${self.id}_panel .okit-tab`).removeClass('okit-tab-active')
                                            $(`#${self.id}_${tab_id}_tab`).addClass('okit-tab-active')
                                            $(`#${self.id}_${tab_id}_contents`).removeClass('hidden')
                                        })
            self[`${tab_id}_contents`] = this.panel.append('div')
                                            .attr('id', `${self.id}_${tab_id}_contents`)
                                            .attr('class', `okit-tab-contents ${i > 0 ? 'hidden' : ''} ${self.resource.read_only && name !== 'Documentation' ? 'read-only' : ''}`)
        })
    
        console.info('Properties div', this.properties_div)
    }

    buildCore() {
        const self = this
        const [details, summary, div] = this.createDetailsSection('Core', `${self.id}_core_details`)
        this.append(this.properties_contents, details)
        const [table, thead, tbody] = this.createTable('', `${self.id}_core_properties`)
        this.core_tbody = tbody
        this.append(div, table)
        let [row, input] = this.createInput('text', 'Name', `${self.id}_display_name`, '', (d, i, n) => self.resource.display_name = n[i].value)
        this.display_name = input
        this.append(tbody, row)
        this.documentation_contents.append('textarea')
                                    .attr('id', `${self.id}_documentation`)
                                    .attr('class', 'resource-documentation')
                                    .attr('name', 'documentation')
                                    .attr('wrap', 'soft')
                                    .attr('placeholder', `Markdown documentation for this ${this.resource.resource_type} resource`)
                                    .on('change', (d, i, n) => self.resource.documentation = n[i].value)
    }

    buildResource() {}

    buildTags() {
        const self = this
        // Freeform Tags
        const [fft_details, fft_summary, fft_div] = this.createDetailsSection('Freeform Tags', `${self.id}_fft_details`)
        this.append(this.tags_contents, fft_details)
        const [fft_table, fft_thead, fft_tbody] = this.createTable('', `${self.id}_fftags`)
        this.fft_tbody = fft_tbody
        this.append(fft_details, fft_table)
        let row = fft_thead.append('div').attr('class', 'tr')
        row.append('div').attr('class', 'th').text('Key')
        row.append('div').attr('class', 'th').text('Value')
        row.append('div').attr('class', 'th add-tag action-button-background action-button-column').on('click', () => handleAddFreeformTag(self.resource, () => self.loadFreeformTags()))
        // Defined Tags
        const [dt_details, dt_summary, dt_div] = this.createDetailsSection('Defined Tags', `${self.id}_dt_details`)
        this.append(this.tags_contents, dt_details)
        const [dt_table, dt_thead, dt_tbody] = this.createTable('', `${self.id}_dtags`)
        this.dt_tbody = dt_tbody
        this.append(dt_details, dt_table)
        row = dt_thead.append('div').attr('class', 'tr')
        row.append('div').attr('class', 'th').text('Namespace')
        row.append('div').attr('class', 'th').text('Key')
        row.append('div').attr('class', 'th').text('Value')
        row.append('div').attr('class', 'th add-tag action-button-background action-button-column').on('click', () => handleAddDefinedTag(self.resource, () => self.loadDefinedTags()))
    }

    load() {
        this.loadCore()
        this.loadResource()
        this.loadTags()
    }

    loadCore() {
        this.display_name.property('value', this.resource.display_name)
    }

    loadResource() {}

    loadTags() {
        this.loadFreeformTags()
        this.loadDefinedTags()
    }

    loadFreeformTags() {
        const self = this
        this.fft_tbody.selectAll('*').remove()
        for (const [key, value] of Object.entries(this.resource.freeform_tags)) {
            let tr = this.fft_tbody.append('div').attr('class', 'tr')
            tr.append('div').attr('class', 'td').append('label').text(key)
            tr.append('div').attr('class', 'td').append('label').text(value)
            tr.append('div').attr('class', 'td delete-tag action-button-background delete').on('click', () => {
                delete this.resource.freeform_tags[key];
                self.loadFreeformTags()
                d3.event.stopPropagation()
            })
        }
    }

    loadDefinedTags() {
        const self = this
        this.dt_tbody.selectAll('*').remove()
        for (const [namespace, tags] of Object.entries(this.resource.defined_tags)) {
            for (const [key, value] of Object.entries(tags)) {
                let tr = this.dt_tbody.append('div').attr('class', 'tr')
                tr.append('div').attr('class', 'td').append('label').text(namespace)
                tr.append('div').attr('class', 'td').append('label').text(key)
                tr.append('div').attr('class', 'td').append('label').text(value)
                tr.append('div').attr('class', 'td  delete-tag action-button-background delete').on('click', () => {
                    delete this.resource.defined_tags[namespace][key];
                    if (Object.keys(this.resource.defined_tags[namespace]).length === 0) {delete this.resource.defined_tags[namespace];}
                    self.loadDefinedTags()
                    d3.event.stopPropagation()
                })
            }
        }
    }

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

    // Formatting
    formatting = {
        // IPv4 IP Address
        ipv4: {
            placeholder: '0.0.0.0',
            pattern: "^((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$)+",
            title: 'IPv4 Address'
        },
        // IPv4 CIDR
        ipv4_cidr: {
            placeholder: '0.0.0.0/0',
            pattern: "^((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/(3[0-2]|[1-2][0-9]|[0-9]))$)+",
            title: 'IPv4 CIDR block'
        },
        // IPv4 CIDR List
        ipv4_cidr_list: {
            placeholder: '0.0.0.0/0,0.0.0.0/0',
            pattern: "^((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/(3[0-2]|[1-2][0-9]|[0-9]))(,\s?|$))+",
            title: 'Comma separated IPv4 CIDR blocks'
        },
        // IPv6 CIDR List
        ipv6_cidr_list: {
            placeholder: '2001:0db8:0123:45::/56',
            pattern: "^((((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4}))*::((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4}))*|((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4})){7})(,\s?|$))+",
            title: 'Comma separated IPv6 CIDR blocks'
        },
        // Port Range
        port_range: {
            placeholder:'80, 20-22',
            pattern: "(^$|^(?:[1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])(?:-([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5]))?$)",
            pattern0: "^(?:[1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])(?:-([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5]))?|\s*$",
            pattern1: "^(?:6553[0-5]|655[0-2]\\d|65[0-4]\\d\\d|6[0-4]\\d{3}|[0-5]\\d{4}|\\d{1,4})(?:-(?:6553[0-5]|655[0-2]\\d|65[0-4]\\d\\d|6[0-4]\\d{3}|[0-5]\\d{4}|\\d{1,4}))?(?:,(?:6553[0-5]|655[0-2]\\d|65[0-4]\\d\\d|6[0-4]\\d{3}|[0-5]\\d{4}|\\d{1,4})(-(?:6553[0-5]|655[0-2]\\d|65[0-4]\\d\\d|6[0-4]\\d{3}|[0-5]\\d{4}|\\d{1,4}))?)|^\s*$",
            title: 'Port range 80, 20-22'
        }
    }
    pattern = "^(?:[1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])|\s*$"
    pattern1 = "^(?:[1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])(?:-([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5]))?|\s*$"

    createInput(type='text', label='', id='', idx=0, callback=undefined, data={}) {
        const row = d3.create('div').attr('class', 'tr').attr('id', this.trId(id, idx))
        let input = undefined
        if (Object.keys(this.formatting).includes(type)) {
            data = data ? {...data, ...this.formatting[type]} : formatting[type]
            type = 'text'
        }
        if (['text', 'password', 'email', 'date', 'number'].includes(type)) {
            return this.createSimplePropertyRow(type, label, id, idx, callback, data)
        // } else if (['text', 'password', 'email', 'date', 'number'].includes(type)) {
        //     row.append('div').attr('class', 'td').text(label)
        //     input = row.append('div').attr('class', 'td').append('input').attr('name', this.inputId(id, idx)).attr('id', this.inputId(id, idx)).attr('type', type).attr('class', 'okit-property-value').on('blur', callback)
        //     this.addExtraAttributes(input, data)
        //     // if (data) {
        //     //     if (data.min) input.attr('min', data.min)
        //     //     if (data.max) input.attr('max', data.max)
        //     //     if (data.maxlength) input.attr('maxlength', data.maxlength)
        //     //     if (data.pattern) input.attr('pattern', data.pattern)
        //     //     if (data.title) input.attr('title', data.title)
        //     // }
        // } else if (type === 'ipv4') {
        //     const placeholder = '0.0.0.0'
        //     const ipv4_regex = "^((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$)+"
        //     row.append('div').attr('class', 'td').text(label)
        //     input = row.append('div').attr('class', 'td').append('input').attr('name', this.inputId(id, idx)).attr('id', this.inputId(id, idx)).attr('type', 'text').attr('class', 'okit-property-value').attr('pattern', ipv4_regex).attr('title', "IPv4 Address").attr('placeholder', placeholder).on('blur', callback)
        // } else if (type === 'ipv4_cidr') {
        //     const placeholder = '0.0.0.0/0'
        //     const ipv4_cidr_regex = "^((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/(3[0-2]|[1-2][0-9]|[0-9]))$)+"
        //     row.append('div').attr('class', 'td').text(label)
        //     input = row.append('div').attr('class', 'td').append('input').attr('name', this.inputId(id, idx)).attr('id', this.inputId(id, idx)).attr('type', 'text').attr('class', 'okit-property-value').attr('pattern', ipv4_cidr_regex).attr('title', "IPv4 CIDR block").attr('placeholder', placeholder).on('blur', callback)
        // } else if (type === 'ipv4_cidr_list') {
        //     const placeholder = '0.0.0.0/0,0.0.0.0/0'
        //     const ipv4_cidr_regex = "^((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/(3[0-2]|[1-2][0-9]|[0-9]))(,\s?|$))+"
        //     row.append('div').attr('class', 'td').text(label)
        //     input = row.append('div').attr('class', 'td').append('input').attr('name', this.inputId(id, idx)).attr('id', this.inputId(id, idx)).attr('type', 'text').attr('class', 'okit-property-value').attr('pattern', ipv4_cidr_regex).attr('title', "Comma separated IPv4 CIDR blocks").attr('placeholder', placeholder).on('blur', callback)
        // } else if (type === 'ipv6_cidr_list') {
        //     const placeholder = '2001:0db8:0123:45::/56'
        //     const ipv4_cidr_regex = "^((((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4}))*::((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4}))*|((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4})){7})(,\s?|$))+"
        //     row.append('div').attr('class', 'td').text(label)
        //     input = row.append('div').attr('class', 'td').append('input').attr('name', this.inputId(id, idx)).attr('id', this.inputId(id, idx)).attr('type', 'text').attr('class', 'okit-property-value').attr('pattern', ipv4_cidr_regex).attr('title', "Comma separated IPv6 CIDR blocks").attr('placeholder', placeholder).on('blur', callback)
        } else if (type === 'select') {
            row.append('div').attr('class', 'td').text(label)
            input = row.append('div').attr('class', 'td').append('select').attr('id', this.inputId(id, idx)).attr('class', 'okit-property-value').on('change', callback)
            if (data && data.options) {
                Object.entries(data.options).forEach(([k, v]) => input.append('option').attr('value', k).text(v))
            }
        } else if (type === 'multiselect') {
            row.append('div').attr('class', 'td').text(label)
            input = row.append('div').attr('class', 'td').append('div').attr('id', this.inputId(id, idx)).attr('class', 'okit-multiple-select').on('change', callback)
        } else if (type === 'checkbox') {
            row.append('div').attr('class', 'td')
            const cell = row.append('div').attr('class', 'td')
            input = cell.append('input').attr('type', 'checkbox').attr('id', this.inputId(id, idx)).attr('class', 'okit-property-value').on('input', callback)
            cell.append('label').attr('for', this.inputId(id, idx)).text(label)
        } else {
            alert(`Unknown Type ${type}`)
        }
        return [row, input]
    }
    createSimplePropertyRow(type='text', label='', id='', idx=0, callback=undefined, data={}) {
        const row = d3.create('div').attr('class', 'tr').attr('id', this.trId(id, idx))
        row.append('div').attr('class', 'td').text(label)
        const [cell, input] = this.createSimpleInputCell(type, id, idx, callback, data)
        this.append(row, cell)
        return [row, input]
    }
    createSimpleInputCell(type='text', id='', idx=0, callback=undefined, data={}) {
        const cell = d3.create('div').attr('class', 'td')
        const input = this.createSimpleInput(type, id, idx, callback, data)
        this.append(cell, input)
        return [cell, input]
    }
    createSimpleInput(type='text', id='', idx=0, callback=undefined, data={}) {
        const input = d3.create('input').attr('name', this.inputId(id, idx)).attr('id', this.inputId(id, idx)).attr('type', type).attr('class', 'okit-property-value').on('blur', callback)
        this.addExtraAttributes(input, data)
        return input
    }

    addExtraAttributes(input, data) {
        if (data) {
            if (data.min) input.attr('min', data.min)
            if (data.max) input.attr('max', data.max)
            if (data.maxlength) input.attr('maxlength', data.maxlength)
            if (data.pattern) input.attr('pattern', data.pattern)
            if (data.title) input.attr('title', data.title)
            if (data.placeholder) input.attr('placeholder', data.placeholder)
        }
    }

    createTable(label='', id='', idx='', callback=undefined, data={}) {
        const table = d3.create('div').attr('class', 'table okit-table')
        const thead = table.append('div').attr('class', 'thead')
        const tbody = table.append('div').attr('class', 'tbody').attr('id', this.tbodyId(id, idx))
        return [table, thead, tbody]
    }

    createPropertiesTable(label='', id='', idx=0, callback=undefined, data={}) {
        const [table, thead, tbody] = this.createTable(label, id, idx, callback, data)
        const row = thead.append('div').attr('class', 'tr')
        row.append('div').attr('class', 'th').text('Property')
        row.append('div').attr('class', 'th').text('Value')
        return [table, thead, tbody]
    }

    createArrayTable(label='', id='', idx='', callback=undefined, data={}) {
        const [table, thead, tbody] = this.createTable(label, id, idx, callback, data)
        const row = thead.append('div').attr('class', 'tr')
        row.append('div').attr('class', 'th').text(label)
        row.append('div').attr('class', 'th add-property action-button-background action-button-column').on('click', callback)
        return [table, thead, tbody]
    }

    createDetailsSection(label='', id='', idx='', callback=undefined, data={}, open=true) {
        // const details = d3.create('details').attr('class', 'okit-details').attr('open', open)
        const details = d3.create('details').attr('class', 'okit-details')
        if (open) details.attr('open', open)
        const summary = details.append('summary').attr('class', 'summary-background').append('label').text(label)
        const div = details.append('div').attr('class', 'okit-details-body')
        return [details, summary, div]
    }

    createDeleteRow(id='', idx='', callback=undefined, data={}) {
        const row = d3.create('div').attr('class', 'tr').attr('id', this.trId(id, idx))
        const div = row.append('div').attr('class', 'td')
        row.append('div').attr('class', 'td delete-property action-button-background delete').on('click', callback)
        return [row, div]
    }

    createMultiValueRow(label='', id='', idx='', callback=undefined, data={}) {
        const row = d3.create('div').attr('class', 'tr').attr('id', this.trId(id, idx))
        row.append('div').attr('class', 'td').text(label)
        const div = row.append('div').attr('class', 'td multi-value').append('div').attr('class', 'tr')
        return [row, div]
    }

    tbodyId = (id, idx) => `${id.replaceAll(' ', '_').toLowerCase()}_tbody${idx}`
    trId = (id, idx) => `${id.replaceAll(' ', '_').toLowerCase()}${idx}_row`
    inputId = (id, idx) => `${id.replaceAll(' ', '_').toLowerCase()}${idx}`

    hideProperty = (id, idx) => d3.select(`#${this.trId(id, idx)}`).classed('collapsed', true)
    showProperty = (id, idx) => d3.select(`#${this.trId(id, idx)}`).classed('collapsed', false)

    loadSelect(select, resource_type, empty_option=false, filter=undefined) {
        select.selectAll('*').remove()
        if (!filter) filter = () => true
        if (empty_option) select.append('option').attr('value', '').text('')
        let id = ''
        const resources = this.resource.okit_json[`${resource_type}s`] ? this.resource.okit_json[`${resource_type}s`] : this.resource.okit_json[`${resource_type}`] ? this.resource.okit_json[`${resource_type}`] : []
        resources.filter(filter).forEach((r, i) => {
            const option = select.append('option').attr('value', r.id).text(r.display_name)
            if (i === 0) {
                option.attr('selected', 'selected')
                id = r.id
            }
        })
        return id
    }

    loadMultiSelect(select, resource_type, empty_option=false, filter=undefined) {
        select.selectAll('*').remove()
        if (!filter) filter = () => true
        const resources = this.resource.okit_json[`${resource_type}s`] ? this.resource.okit_json[`${resource_type}s`] : this.resource.okit_json[`${resource_type}`] ? this.resource.okit_json[`${resource_type}`] : []
        resources.filter(filter).forEach((r) => {
            const div = select.append('div')
            const safeid = r.id.replace(/[\W_]+/g,"_")
            div.append('input').attr('type', 'checkbox').attr('id', safeid).attr('value', r.id)
            div.append('label').attr('for', safeid).text(r.display_name)
        })
    }

    loadSelectFromMap(select, map) {
        map.forEach((v, t) => select.append('option').attr('value', v).text(t))
    }
}
