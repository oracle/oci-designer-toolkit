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
                                            .attr('class', `okit-tab-contents ${i > 0 ? 'hidden' : ''}`)
        })
        // this.sheet_btn = this.tabbar.append('button')
        //                         .attr('id', `${self.id}_sheet_tab`)
        //                         .attr('class', 'okit-tab okit-tab-active')
        //                         .text('Properties')
        //                         .on('click', () => {
        //                             $(`#${self.id}_panel .okit-tab-contents`).addClass('hidden')
        //                             $(`#${self.id}_panel .okit-tab`).removeClass('okit-tab-active')
        //                             $(`#${self.id}_sheet_tab`).addClass('okit-tab-active')
        //                             $(`#${self.id}_sheet_contents`).removeClass('hidden')
        //                         })
        // this.notes_btn = this.tabbar.append('button')
        //                         .attr('id', `${self.id}_notes_tab`)
        //                         .attr('class', 'okit-tab')
        //                         .text('Documentation')
        //                         .on('click', () => {
        //                             $(`#${self.id}_panel .okit-tab-contents`).addClass('hidden')
        //                             $(`#${self.id}_panel .okit-tab`).removeClass('okit-tab-active')
        //                             $(`#${self.id}_notes_tab`).addClass('okit-tab-active')
        //                             $(`#${self.id}_notes_contents`).removeClass('hidden')
        //                         })
        // this.tags_btn = this.tabbar.append('button')
        //                         .attr('id', `${self.id}_tags_tab`)
        //                         .attr('class', 'okit-tab')
        //                         .text('Tags')
        //                         .on('click', () => {
        //                             $(`#${self.id}_panel .okit-tab-contents`).addClass('hidden')
        //                             $(`#${self.id}_panel .okit-tab`).removeClass('okit-tab-active')
        //                             $(`#${self.id}_tags_tab`).addClass('okit-tab-active')
        //                             $(`#${self.id}_tags_contents`).removeClass('hidden')
        //                         })
        // this.sheet = this.panel.append('div')
        //                         .attr('id', `${self.id}_sheet_contents`)
        //                         .attr('class', 'okit-tab-contents')
        // this.notes = this.panel.append('div')
        //                         .attr('id', `${self.id}_notes_contents`)
        //                         .attr('class', 'okit-tab-contents hidden')
        //                         .append('textarea')
        //                             .attr('id', `${self.id}_documentation`)
        //                             .attr('class', 'resource-documentation')
        //                             .attr('name', 'documentation')
        //                             .attr('wrap', 'soft')
        //                             .attr('placeholder', `Markdown documentation for this ${this.resource.resource_type} resource`)
        //                             .on('change', (d, i, n) => self.resource.documentation = n[i].value)
        // this.tags = this.panel.append('div')
        //                         .attr('id', `${self.id}_tags_contents`)
        //                         .attr('class', 'okit-tab-contents hidden')
    
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

    createInput(type='text', label='', id='', idx=0, callback=undefined, data={}) {
        const row = d3.create('div').attr('class', 'tr').attr('id', this.trId(id, idx))
        let input = undefined
        row.append('div').attr('class', 'td').text(label)
        if (['text', 'password', 'email', 'date', 'number'].includes(type)) {
            input = row.append('div').attr('class', 'td').append('input').attr('name', this.inputId(id, idx)).attr('id', this.inputId(id, idx)).attr('type', type).attr('class', 'okit-property-value').on('blur', callback)
            if (data) {
                if (data.min) element.attr('min', data.min)
                if (data.max) element.attr('max', data.max)
            }
        } else if (type === 'ipv4') {
            const placeholder = '0.0.0.0'
            const ipv4_regex = "^((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$)+"
            input = row.append('div').attr('class', 'td').append('input').attr('name', this.inputId(id, idx)).attr('id', this.inputId(id, idx)).attr('type', 'text').attr('class', 'okit-property-value').attr('pattern', ipv4_regex).attr('title', "IPv4 Address").attr('placeholder', placeholder).on('blur', callback)
        } else if (type === 'ipv4_cidr') {
            const placeholder = '0.0.0.0/0'
            const ipv4_cidr_regex = "^((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/(3[0-2]|[1-2][0-9]|[0-9]))$)+"
            input = row.append('div').attr('class', 'td').append('input').attr('name', this.inputId(id, idx)).attr('id', this.inputId(id, idx)).attr('type', 'text').attr('class', 'okit-property-value').attr('pattern', ipv4_cidr_regex).attr('title', "IPv4 CIDR block").attr('placeholder', placeholder).on('blur', callback)
        } else if (type === 'select') {
            input = row.append('div').attr('class', 'td').append('select').attr('id', this.inputId(id, idx)).attr('class', 'okit-property-value').on('change', callback)
            if (data && data.options) {
                Object.entries(data.options).forEach(([k, v]) => input.append('option').attr('value', k).text(v))
            }
        } else if (type === 'multiselect') {
            input = row.append('div').attr('class', 'td').append('div').attr('id', this.inputId(id, idx)).attr('class', 'okit-multiple-select').on('change', callback)
        } else {
            alert(`Unknown Type ${type}`)
        }
        return [row, input]
    }

    createTable(label='', id='', idx=0, callback=undefined, data={}) {
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

    createDetailsSection(label='', id='', idx=0, callback=undefined, data={}, open='open') {
        const details = d3.create('details').attr('class', 'okit-details').attr('open', open)
        const summary = details.append('summary').attr('class', 'summary-background').append('label').text(label)
        const div = details.append('div').attr('class', 'okit-details-body')
        return [details, summary, div]
    }

    tbodyId = (id, idx) => `${id.replaceAll(' ', '_').toLowerCase()}_tbody${idx}`
    trId = (id, idx) => `${id.replaceAll(' ', '_').toLowerCase()}${idx}_row`
    inputId = (id, idx) => `${id.replaceAll(' ', '_').toLowerCase()}${idx}`

    loadSelect(select, resource_type, empty_option=false, filter=undefined) {
        select.selectAll('*').remove()
        if (!filter) filter = () => true
        if (empty_option) select.append('option').attr('value', '').text('')
        const resources = this.resource.okit_json[`${resource_type}s`] ? this.resource.okit_json[`${resource_type}s`] : this.resource.okit_json[`${resource_type}`] ? this.resource.okit_json[`${resource_type}`] : []
        resources.filter(filter).forEach((r) => select.append('option').attr('value', r.id).text(r.display_name))
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
}
