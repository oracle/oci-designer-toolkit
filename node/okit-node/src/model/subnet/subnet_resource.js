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

class SubnetResource extends OkitResourceModel {
    constructor() {
        super()
        availability_domain = ''
        cidr_block = ''
        dhcp_options_id = ''
        dns_label = ''
        ipv6cidr_block = ''
        ipv6public_cidr_block = ''
        ipv6virtual_router_ip = ''
        prohibit_public_ip_on_vnic = false
        route_table_id = ''
        security_list_ids = []
        subnet_domain_name = ''
        vcn_id = ''
        virtual_router_ip = ''
        virtual_router_mac = ''
    }
}

export default SubnetResource
export { SubnetResource }
