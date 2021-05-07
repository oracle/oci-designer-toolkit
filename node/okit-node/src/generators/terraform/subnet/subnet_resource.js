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

class SubnetResource extends OkitResourceTerraform {
    static model = {
        availability_domain: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Availability Domain'
            },
        cidr_block: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Cidr Block'
            },
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
        dhcp_options_id: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Dhcp Options Id'
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
        ipv6virtual_router_ip: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Ipv6virtual Router Ip'
            },
        prohibit_public_ip_on_vnic: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Prohibit Public Ip On Vnic'
            },
        route_table_id: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Route Table Id'
            },
        security_list_ids: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Security List Ids'
            },
        subnet_domain_name: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Subnet Domain Name'
            },
        vcn_id: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Vcn Id'
            },
        virtual_router_ip: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Virtual Router Ip'
            },
        virtual_router_mac: {
                required: false,
                editable: true,
                type: 'datalist',
                label: 'Virtual Router Mac'
            },
    }

    constructor(resource) {
        super(resource)
        this.tf_resource_name = 'oci_core_subnet'
    }
}

export default SubnetResource
export { SubnetResource }
