/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Dialog Javascript');

class OkitDialogs {
    constructor(wrapper=undefined, heading=undefined, body=undefined, footer=undefined) {
        this.wrapper_id = wrapper
        this.heading_id = heading
        this.body_id = body
        this.footer_id = footer
        this.wrapper = d3.select(`#${wrapper}`)
        this.heading = d3.select(`#${heading}`)
        this.body = d3.select(`#${body}`)
        this.footer = d3.select(`#${footer}`)
        this.dialogs = {
            ImportResourceManager: new OkitImportResourceManagerDialog(this.wrapper, this.heading, this.body, this.footer)
        }
    }
    get(dialog) {
        return this.dialogs[dialog] 
    }
}

class OkitDialog {
    constructor(wrapper=undefined, heading=undefined, body=undefined, footer=undefined) {
        this.wrapper = wrapper
        this.heading = heading
        this.body = body
        this.footer = footer
        this.responses = {}
        this.dialog = this.build()
    }

    get id() {return this.constructor.name.toLowerCase()}

    formatting = {}

    tbodyId = (id, idx) => `${id.replaceAll(' ', '_').toLowerCase()}_tbody${idx}`
    trId = (id, idx) => `${id.replaceAll(' ', '_').toLowerCase()}${idx}_row`
    inputId = (id, idx) => `${id.replaceAll(' ', '_').toLowerCase()}${idx}`
    hideProperty = (id, idx) => d3.select(`#${this.trId(id, idx)}`).classed('collapsed', true)
    showProperty = (id, idx) => d3.select(`#${this.trId(id, idx)}`).classed('collapsed', false)

    build() {
        this.buildCore()
        this.buildDialog()
    }

    buildCore() {
        this.framework = this.createTable('okit_dialog_table')
    }

    buildDialog() {}

    show() {
        console.info('Show', this)
        if (this.heading) {this.heading.text(this.title)}
        if (this.body) {
            this.body.selectAll('*').remove()
            const div = this.body.append('div')
            // this.body.append(this.framework.table)
            this.append(div, this.framework.table)
        }
        if (this.footer) {
            this.footer.selectAll('*').remove()
            const div = this.footer.append('div')
            // this.footer.append(this.action.button)
            this.append(div, this.action.button)
        }
        console.info('Showing', this.wrapper)
        this.wrapper.classed('hidden', false)
        this.load()
    }

    load() {}

    append = (parent, child) => parent.append(() => child.node())

    createTable(id='', idx='') {
        const table = d3.create('div').attr('class', 'table okit-table')
        const thead = table.append('div').attr('class', 'thead')
        const tbody = table.append('div').attr('class', 'tbody').attr('id', this.tbodyId(id, idx))
        return {table: table, thead: thead, tbody: tbody}
    }

    createInput(type='text', label='', id='', idx='', callback=undefined, data={}) {
        const row = d3.create('div').attr('class', 'tr').attr('id', this.trId(id, idx))
        let input = undefined
        let cell = undefined
        let title = undefined
        if (Object.keys(this.formatting).includes(type)) {
            data = data ? {...data, ...this.formatting[type]} : formatting[type]
            type = 'text'
        }
        if (['text', 'password', 'email', 'date', 'number', 'range'].includes(type)) {
            title = row.append('div').attr('class', 'td').text(label)
            cell = row.append('div').attr('class', 'td')
            input = cell.append('input').attr('name', this.inputId(id, idx)).attr('id', this.inputId(id, idx)).attr('type', type).attr('class', 'okit-property-value').on('change', callback)
            this.addExtraAttributes(input, data)
            // return this.createSimplePropertyRow(type, label, id, idx, callback, data)
        } else if (type === 'select') {
            title = row.append('div').attr('class', 'td').text(label)
            input = row.append('div').attr('class', 'td').append('select').attr('id', this.inputId(id, idx)).attr('class', 'okit-property-value').on('change', callback)
            if (data && data.options) {
                Object.entries(data.options).forEach(([k, v]) => input.append('option').attr('value', k).text(v))
            }
        } else if (type === 'multiselect') {
            title = row.append('div').attr('class', 'td').text(label)
            input = row.append('div').attr('class', 'td').append('div').attr('id', this.inputId(id, idx)).attr('class', 'okit-multiple-select').on('change', callback)
        } else if (type === 'checkbox') {
            row.append('div').attr('class', 'td')
            cell = row.append('div').attr('class', 'td')
            input = cell.append('input').attr('type', 'checkbox').attr('id', this.inputId(id, idx)).attr('class', 'okit-property-value').on('input', callback)
            cell.append('label').attr('for', this.inputId(id, idx)).text(label)
        } else {
            alert(`Unknown Type ${type}`)
        }
        return {row: row, cell: cell, input: input, title: title}
    }

    createButton(label='', id='', idx='', callback=undefined, data={}) {
        const div = d3.create('div')
        const button = div.append('button')
                .attr('id', this.inputId(id, idx))
                .attr('type', 'button')
                .text(label)
                .on('click', callback)
        return {div: div, button: button}
    }

    addExtraAttributes(input, data) {
        const attributes = ['min', 'max', 'step', 'maxlength', 'pattern', 'title', 'placeholder']
        if (data) {
            Object.entries(data).forEach(([k, v]) => {
                if (attributes.includes(k)) input.attr(k, v)
            })
        }
    }
}

class OkitImportResourceManagerDialog extends OkitDialog {
    constructor(wrapper=undefined, heading=undefined, body=undefined, footer=undefined) {
        super(wrapper, heading, body, footer)
        this.title = 'Import Resource Manager Terraform State'
    }

    buildDialog() {
        const idx = ''
        // Config Profile
        this.profile = this.createInput('select', 'Profile', `${this.id}_config_profile`, idx, (d, i, n) => this.responses.profile = n[i].value)
        this.append(this.framework.tbody, this.profile.row)
        // Region
        this.region = this.createInput('select', 'Region', `${this.id}_region`, idx, (d, i, n) => this.responses.region = n[i].value)
        this.append(this.framework.tbody, this.region.row)
        // Compartment
        this.compartment = this.createInput('select', 'Compartment', `${this.id}_compartment`, idx, (d, i, n) => this.responses.compartment = n[i].value)
        this.append(this.framework.tbody, this.compartment.row)
        // Stack
        this.stack = this.createInput('select', 'Stack', `${this.id}_stack`, idx, (d, i, n) => this.responses.stack = n[i].value)
        this.append(this.framework.tbody, this.stack.row)
        // Action
        this.action = this.createButton('Import', `${this.id}_action`, idx, () => {})
    }

    load() {
        this.loadConfigProfiles().then(() => {console.info('Then after load profiles')})
    }

    loadConfigProfiles() {
        return $.ajax({cache: false, type: 'get', url: 'config/sections'}).done((resp) => {
            const options = resp.sections.map((s) => {return {value: s, text: s}})
            console.info('Options', options)
        })
    }

    loadSelect(select, options) {

    }
}

$(document).ready(() => {okitDialogs = new OkitDialogs('modal_dialog_wrapper', 'modal_dialog_title', 'modal_dialog_body', 'modal_dialog_footer')})
