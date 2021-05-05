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

class Compartment extends OkitResourceProperties {
    static model = {
        description: {
                required: true,
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
    }
}

export default Compartment
export { Compartment }
