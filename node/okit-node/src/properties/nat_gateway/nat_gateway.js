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

class NatGateway extends OkitResourceProperties {
    static model = {
        block_traffic: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Block Traffic'
            },
        nat_ip: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Nat Ip'
            },
        public_ip_id: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Public Ip Id'
            },
        vcn_id: {
                required: true,
                editable: true,
                type: 'datalist',
                label: 'Vcn Id'
            },
    }
}

export default NatGateway
export { NatGateway }
