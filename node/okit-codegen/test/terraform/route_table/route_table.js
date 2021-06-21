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
** Generated : 04/05/2021 17:54:52
**
*/

import { OkitResourceTerraform } from '../okit_resource_terraform.js'

class RouteTable extends OkitResourceTerraform {
    static model = {}
    constructor(resource) {
        super(resource)
    }

    toResource() {
        return `
resource "oci_core_route_table" "${this.resource_name}" {
    # Required
    undefined
    # Optional
}
        `
    }

    toData() {

    }

    toLocalVariables() {

    }
}

export default RouteTable
export { RouteTable }
