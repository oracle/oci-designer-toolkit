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

class VcnResource extends OkitResourceTerraform {
    static model = {
        cidr_block: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Cidr Block'
            },
        cidr_blocks: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Cidr Blocks'
            },
        compartment_id: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Compartment Id'
            },
        default_dhcp_options_id: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Default Dhcp Options Id'
            },
        default_route_table_id: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Default Route Table Id'
            },
        default_security_list_id: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Default Security List Id'
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
        dns_label: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Dns Label'
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
        ipv6cidr_block: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Ipv6cidr Block'
            },
        ipv6public_cidr_block: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Ipv6public Cidr Block'
            },
        is_ipv6enabled: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Is Ipv6enabled'
            },
        vcn_domain_name: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Vcn Domain Name'
            },
    }

    constructor(resource) {
        super(resource)
        this.tf_resource_name = 'oci_core_vcn'
    }
}

export default VcnResource
export { VcnResource }
