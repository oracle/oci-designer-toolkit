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
    get all_properties() {return {...this.constructor.common, ...this.constructor.model}}
    get required_properties() {return Object.entries(this.all_properties).reduce((r, [k, v]) => {
        if (v.required) r[k] = v
        return r
    }, {})}
    get optional_properties() {return Object.entries(this.all_properties).reduce((r, [k, v]) => {
        if (!v.required) r[k] = v
        return r
    }, {})}
    constructor(resource) {
        this.resource = resource
    }

    toResource() {return ''}

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
