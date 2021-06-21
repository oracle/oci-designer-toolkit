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
** Generated : 07/05/2021 16:58:41
**
*/

import { OkitResourceModel } from '../okit_resource_model.js'

class VcnResource extends OkitResourceModel {
    constructor() {
        super()
        cidr_block = ''
        cidr_blocks = []
        default_dhcp_options_id = ''
        default_route_table_id = ''
        default_security_list_id = ''
        dns_label = ''
        ipv6cidr_block = ''
        ipv6public_cidr_block = ''
        is_ipv6enabled = false
        vcn_domain_name = ''
    }
}

export default VcnResource
export { VcnResource }
