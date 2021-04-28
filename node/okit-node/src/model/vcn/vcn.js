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
** Generated : 28/04/2021 10:42:41
**
*/

import { OkitResourceModel } from '../okit_resource_model.js'

class Vcn extends OkitResourceModel {
    static model = {}
    constructor() {
        super()
        cidr_block = undefined
        cidr_blocks = undefined
        default_dhcp_options_id = undefined
        default_route_table_id = undefined
        default_security_list_id = undefined
        dns_label = undefined
        ipv6cidr_block = undefined
        ipv6public_cidr_block = undefined
        is_ipv6enabled = undefined
        vcn_domain_name = undefined
    }
}

export default Vcn
export { Vcn }
