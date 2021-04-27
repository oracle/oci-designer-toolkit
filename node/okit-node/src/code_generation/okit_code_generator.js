/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Author: Andrew Hopkinson
*/

class OkitCodeGenerator {
    static resource_map = {
        // oci_core_drg: 'drg',
        oci_core_instance: 'instance',
        oci_core_instance_pool: 'instance_pool',
        // oci_core_internet_gateway: 'intergnet_gateway',
        // oci_core_ipsec: 'ipsec',
        // oci_core_local_peering_gateway: 'local_peering_gateway',
        // oci_core_nat_gateway: 'nat_gateway',
        // oci_core_network_security_group: 'network_security_group',
        // oci_core_remote_peering_connection: 'remote_peering_connection',
        // oci_core_route_table: 'route_table',
        // oci_core_security_list: 'security_list',
        // oci_core_service_gateway: 'service_gateway',
        oci_core_subnet: 'subnet',
        oci_core_vcn: 'vcn',
        // oci_core_volume: 'volume',
        // oci_core_volume_group: 'volume_group',
        // oci_database_autonomous_database: 'autonomous_database',
    }
    ignore_elements = ['id', 'compartment_id', 'display_name', 'name', 'defined_tags', 'freeform_tags', 'state', 'time_created']
    constructor(resource, schema) {
        this.resource = resource
        this.schema = schema
    }

    generate() {}

    generateClassName() {
        return OkitCodeGenerator.titleCase(OkitCodeGenerator.resource_map[this.resource].split('_').join(' ')).split(' ').join('')
    }

    static titleCase(str) {
        return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    }

    getAttributes() {

    }
}

export default OkitCodeGenerator
export { OkitCodeGenerator }

