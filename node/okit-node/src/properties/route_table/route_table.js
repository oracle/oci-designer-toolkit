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
** Generated : 28/04/2021 10:41:58
**
*/

import { OkitResourceProperties } from '../okit_resource_properties.js'

class RouteTable extends OkitResourceProperties {
    static model = {
        vcn_id: {
                required: true,
                editable: true,
                type: 'datalist',
                label: 'Vcn Id'
            },
    }
}

export default RouteTable
export { RouteTable }
