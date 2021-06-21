/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Author: Andrew Hopkinson
*/

class OkitResourceTerraform {
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
    }
    static model = {}

    constructor(resource) {
        this.resource = resource
    }

    get all_properties() {return {...this.constructor.common, ...this.constructor.model}}
    get required_properties() {return Object.entries(this.all_properties).reduce((r, [k, v]) => {
        if (v.required) r[k] = v
        return r
    }, {})}
    get optional_properties() {return Object.entries(this.all_properties).reduce((r, [k, v]) => {
        if (!v.required) r[k] = v
        return r
    }, {})}
    get resource_name() {return this.generateResourceName(this.resource.resource_name)}

    generateResourceName(str) {
        return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()}).split(' ').join('')
    }

    varValOrRef(key, val) {
        if (this.ids) {}
    }

    buildRequired() {

    }

    buildOptional() {

    }

    buildTags() {

    }

    toResource() {
        return `
resource "${this.tf_resource_name}" "${this.resource_name}" {
    # Required
    ${this.buildRequired()}
    # Optional
    ${this.buildOptional()}
    # Tags
    ${this.buildTags()}
}
        `
    }

    toData() {return ''}

    toLocalVariables() {return ''}

    toString() {
        return `
        ${this.resource.read_only ? this.toData() : this.toResource()}

        ${this.toLocalVariables()}
        `
    }
}

export default OkitResourceTerraform
export { OkitResourceTerraform }
