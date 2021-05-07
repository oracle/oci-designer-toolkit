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
** Generated : 07/05/2021 16:58:57
**
*/

import { OkitResourceTerraform } from '../okit_resource_terraform.js'

class RouteTableResource extends OkitResourceTerraform {
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
        display_name: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Display Name'
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
        vcn_id: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Vcn Id'
            },
        route_rules: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Route Rules'
            },
    }

    constructor(resource) {
        super(resource)
        this.tf_resource_name = 'oci_core_route_table'
    }
}

export default RouteTableResource
export { RouteTableResource }
