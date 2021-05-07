/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Author: Andrew Hopkinson
*/

/*
** ======================================================================
** === Auto Generated Code All Edits Will Be Lost During Regeneration ===
** ======================================================================
**
** Generated : 07/05/2021 16:58:49
**
*/

import { OkitResourceProperties } from '../okit_resource_properties.js'

class CompartmentResource extends OkitResourceProperties {
    static model = {
        compartment_id: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Compartment Id'
            },
        defined_tags: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Defined Tags'
            },
        description: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Description'
            },
        enable_delete: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Enable Delete'
            },
        freeform_tags: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Freeform Tags'
            },
        id: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Id'
            },
        name: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Name'
            },
    }

    constructor(resource) {
        super(resource)
        this.tf_resource_name = 'oci_identity_compartment'
    }
}

export default CompartmentResource
export { CompartmentResource }
