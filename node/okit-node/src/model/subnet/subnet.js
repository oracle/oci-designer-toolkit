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

class Subnet extends OkitResourceModel {
    static model = {}
    constructor() {
        super()
        availability_domain = undefined
        cidr_block = undefined
        dhcp_options_id = undefined
        dns_label = undefined
        ipv6cidr_block = undefined
        ipv6public_cidr_block = undefined
        ipv6virtual_router_ip = undefined
        prohibit_public_ip_on_vnic = undefined
        route_table_id = undefined
        security_list_ids = undefined
        subnet_domain_name = undefined
        vcn_id = undefined
        virtual_router_ip = undefined
        virtual_router_mac = undefined
    }
}

export default Subnet
export { Subnet }
