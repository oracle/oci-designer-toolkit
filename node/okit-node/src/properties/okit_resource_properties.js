/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Author: Andrew Hopkinson
*/

class OkitResourceProperties {
    static common = {
        id: {
            required: true,
            editable: false,
            type: 'string',
            label: 'Ocid'
        },
        compartment_id: {
            required: true,
            editable: true,
            type: 'reference',
            label: 'Compartment'
        },
        display_name: {
            required: true,
            editable: true,
            type: 'datalist',
            label: 'Display Name'
        },
        resource_name: {
            required: true,
            editable: true,
            type: 'string',
            label: 'Resource Name'
        },
        documentation: {
            required: true,
            editable: true,
            type: 'textarea',
            label: 'Documentation'
        },
        read_only: {
            required: true,
            editable: true,
            type: 'boolean',
            label: 'Read Only'
        },
    }
    static model = {}
    get all_properties() {return {...this.constructor.common, ...this.constructor.model}}
    get required_properties() {return Object.entries(this.all_properties).reduce((r, [k, v]) => {
        if (v.required) r[k] = v
        return r
    }, {})}
    get optional_properties() {return Object.entries(this.all_properties).reduce((r, [k, v]) => {
        if (!v.required) r[k] = v
        return r
    }, {})}
    handler = {
        get: function(obj, prop) {
            if (typeof obj[prop] === 'object') {
                this.updateHierarchy(obj, prop)
                return new Proxy(obj[prop], this.handler)
            }
            return obj[prop]
        },
        set: function(obj, prop, value) {
            const id = this.hierarchy.length > 0 ? `${this.hierarchy.join('.')}.${prop}` : prop
            console.info('Property:', prop, value, 'Id:', id)
            obj[prop] = value
            if (this.document) {
                const element = this.document.getElementById(id)
                if (!element) console.warn('Element', id, 'was not found')
                else if (element.type === 'checkbox' | element.type === 'radio') element.checked = value
                else element.setAttribute('value', value)
            }
            return true
        },
        hierarchy: [],
        updateHierarchy: function(obj, prop) {
            if (this.hierarchy.slice(-1)[0] !== prop) this.hierarchy.push(prop)
        }
    }    
    constructor(json={}, document=undefined, panel_id=undefined) {
        this.document = document
        this.resource = new Proxy(json, this.handler)
        this.panel_id = panel_id
        this.properties_div = undefined
        this.build()
    }

    build(type='simple') {
        const properties_panel = document.getElementById(this.panel_id)
        // Clear
        if (properties_panel.lastChild) properties_panel.removeChild(properties_panel.lastChild)
        // Get / build panel
        if (!this.properties_div) {
            this.properties_div = this.document.createElement('div')
            this.properties_div.setAttribute('class', 'okit-properties-div')
            // Build Simple Panel
            this.buildSimplePanel(this.properties_div)
            // Build Terraform Panel
            // this.buildTerraformPanel(this.properties_div)
            // Build Ansible Panel
            // this.buildAnsiblePanel(this.properties_div)
        }
        properties_panel.appendChild(this.properties_div)
        // Add Simple Panel
    }

    buildAnsiblePanel(panel) {}

    buildTerraformPanel(panel) {}

    buildSimplePanel(panel) {
        // Add Title
        // Build Table for Common Properties
        const table = this.document.createElement('div')
        table.setAttribute('class', 'table')
        panel.appendChild(table)
        const thead = this.document.createElement('div')
        thead.setAttribute('class', 'thead')
        table.appendChild(thead)
        const tbody = this.document.createElement('div')
        tbody.setAttribute('class', 'tbody')
        table.appendChild(tbody)
    }
}

export default OkitResourceProperties
export { OkitResourceProperties }
