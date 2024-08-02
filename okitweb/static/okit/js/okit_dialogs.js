/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Dialog Javascript');

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
        if (this.heading) {this.heading.text(this.title)}
        if (this.body) {
            this.body.select('div').remove()
            const div = this.body.append('div')
            // this.body.append(this.framework.table)
            this.append(div, this.framework.table)
        }
        if (this.footer) {
            this.footer.select('div').remove()
            const div = this.footer.append('div')
            // this.footer.append(this.action.button)
            this.append(div, this.action.button)
        }
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
        this.responses.profile = okitSettings.profile
        this.responses.region = okitSettings.last_used_region
        this.responses.compartment_id = okitSettings.last_used_compartment
        this.responses.stack_id = ''
    }

    buildDialog() {
        const idx = ''
        // Config Profile
        this.profile = this.createInput('select', 'Profile', `${this.id}_config_profile`, idx, (d, i, n) => {this.responses.profile = n[i].value; this.profileChanged()})
        this.append(this.framework.tbody, this.profile.row)
        this.profile.input.append('option').attr('value', '').text('Retrieving......')
        // Region
        this.region = this.createInput('select', 'Region', `${this.id}_region`, idx, (d, i, n) => {this.responses.region = n[i].value; this.loadStacks()})
        this.append(this.framework.tbody, this.region.row)
        this.region.input.append('option').attr('value', '').text('Retrieving......')
        // Compartment
        this.compartment = this.createInput('select', 'Compartment', `${this.id}_compartment`, idx, (d, i, n) => {this.responses.compartment_id = n[i].value; this.loadStacks()})
        this.append(this.framework.tbody, this.compartment.row)
        this.compartment.input.append('option').attr('value', '').text('Retrieving......')
        // Stack
        this.stack = this.createInput('select', 'Stack', `${this.id}_stack`, idx, (d, i, n) => this.responses.stack_id = n[i].value)
        this.append(this.framework.tbody, this.stack.row)
        this.stack.input.append('option').attr('value', '').text('Retrieving......')
        // Action
        this.action = this.createButton('Import', `${this.id}_action`, idx, () => {
            console.info('Import Action', this.responses)
            $.ajax({
                cache: false, 
                type: 'get',
                url: 'import/rmtfstate',
                data: this.responses
            }).done((resp) => {
                resp = resp instanceof Object ? resp : JSON.parse(resp)
                // okitJsonModel = new OkitJson(JSON.stringify(resp.okit_json));
                newModel(JSON.stringify(resp.okit_json));
                newCompartmentView();
                displayOkitJson();
                displayCompartmentView();
                displayTreeView();    
            }).always(() => {this.wrapper.classed('hidden', true)})
        })
    }

    clear() {
        this.region.input.selectAll('*').remove()
        this.region.input.append('option').attr('value', '').text('Retrieving......')
        this.compartment.input.selectAll('*').remove()
        this.compartment.input.append('option').attr('value', '').text('Retrieving......')
        this.stack.input.selectAll('*').remove()
        this.stack.input.append('option').attr('value', '').text('Retrieving......')
    }

    load() {
        this.clear()
        this.loadConfigProfiles().then(() => {
            this.profileChanged()
            // Promise.all([this.loadRegions(), this.loadCompartments()]).then(values => this.loadStacks())
        })
    }

    profileChanged() {
        Promise.all([this.loadRegions(), this.loadCompartments()]).then(values => this.loadStacks())
    }

    loadConfigProfiles() {
        return $.ajax({cache: false, type: 'get', url: 'config/sections'}).done((resp) => {
            const options = resp.sections.map((s) => {return {value: s, text: s}})
            this.loadSelect(this.profile.input, options)
            this.profile.input.property('value', this.responses.profile)
        })
    }

    loadRegions() {
        this.region.input.selectAll('*').remove()
        this.region.input.append('option').attr('value', '').text('Retrieving......')
        return $.ajax({
            cache: false, 
            type: 'get', 
            url: `oci/regions/${this.responses.profile}`,
            data: {
                config_profile: this.responses.profile
            }
        }).done((resp) => {
            resp = resp instanceof Object ? resp : JSON.parse(resp)
            const options = resp.map((r) => {return {value: r.name, text: r.display_name}}).sort((a, b) => a.value < b.value ? -1 : a.value > b.value ? 1 : 0)
            this.loadSelect(this.region.input, options)
            this.responses.region = options.map((o) => o.value).includes(this.responses.region) ? this.responses.region : options.length > 0 ? resp.filter((r) => r.is_home_region)[0].name : ''
            this.region.input.property('value', this.responses.region)
        })
    }

    loadCompartments() {
        this.compartment.input.selectAll('*').remove()
        this.compartment.input.append('option').attr('value', '').text('Retrieving......')
        return $.ajax({
            cache: false, 
            type: 'get', 
            url: `oci/compartments/${this.responses.profile}`,
            data: {
                config_profile: this.responses.profile
            }
        }).done((resp) => {
            resp = resp instanceof Object ? resp : JSON.parse(resp)
            const options = resp.map((c) => {return {value: c.id, text: c.canonical_name}})
            this.loadSelect(this.compartment.input, options)
            this.responses.compartment_id = options.map((o) => o.value).includes(this.responses.compartment_id) ? this.responses.compartment_id : options.length > 0 ? options[0].value : ''
            this.compartment.input.property('value', this.responses.compartment_id)
        })
    }

    loadStacks() {
        this.stack.input.selectAll('*').remove()
        this.stack.input.append('option').attr('value', '').text('Retrieving......')
        return $.ajax({
            cache: false, 
            type: 'get',
            url: 'oci/resourcemanager',
            data: {
                config_profile: this.responses.profile,
                compartment_id: this.responses.compartment_id,
                region: this.responses.region
            }
        }).done((resp) => {
            resp = resp instanceof Object ? resp : JSON.parse(resp)
            const options = resp.map((r) => {return {value: r.id, text: r.display_name}})
            this.loadSelect(this.stack.input, options)
            this.responses.stack_id = options.map((o) => o.value).includes(this.responses.stack_id) ? this.responses.stack_id : options.length > 0 ? options[0].value : ''
            this.stack.input.property('value', this.responses.stack_id)
        })
    }

    loadSelect(select, options) {
        select.selectAll('*').remove()
        options.forEach((o) => select.append('option').attr('value', o.value).text(o.text))
    }
}

$(document).ready(() => {okitDialogs = new OkitDialogs('modal_dialog_wrapper', 'modal_dialog_title', 'modal_dialog_body', 'modal_dialog_footer')})
