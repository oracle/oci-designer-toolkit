/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Author: Andrew Hopkinson
*/

class OkitCodeGenerator {
    static resource_map = {
        // oci_containerengine_cluster: 'cluster',
        // oci_containerengine_node_pool: 'node_pool',

        // oci_core_cpe: 'cpe',
        // oci_core_drg: 'drg',
        // oci_core_instance: 'instance',
        // oci_core_instance_pool: 'instance_pool',
        oci_core_internet_gateway: 'internet_gateway',
        // oci_core_ipsec: 'ipsec',
        // oci_core_local_peering_gateway: 'local_peering_gateway',
        oci_core_nat_gateway: 'nat_gateway',
        // oci_core_network_security_group: 'network_security_group',
        // oci_core_remote_peering_connection: 'remote_peering_connection',
        oci_core_route_table: 'route_table',
        oci_core_security_list: 'security_list',
        // oci_core_service_gateway: 'service_gateway',
        oci_core_subnet: 'subnet',
        oci_core_vcn: 'vcn',
        // oci_core_volume: 'volume',
        // oci_core_volume_group: 'volume_group',

        // oci_database_autonomous_database: 'autonomous_database',
        // oci_database_db_system: 'db_system',

        // oci_file_storage_file_system: 'file_system',

        oci_identity_compartment: 'compartment',

        // oci_load_balancer_load_balancer: 'load_balancer',
        // oci_load_balancer_backend: 'backend',
        // oci_load_balancer_backend_set: 'backend_set',

        // oci_mysql_mysql_db_system: 'mysql_db_system',

        // oci_objectstorage_bucket: 'bucket',
    }
    ignore_elements = [
        'compartment_id', // Common Element
        'defined_tags',   // Common Element
        'display_name',   // Common Element
        'freeform_tags',  // Common Element
        'id',             // Common Element
        'inactive_state', 
        'is_accessible',
        'name',           // Common Element
        'state', 
        'time_created'
    ]

    constructor(resource, schema) {
        this.resource = resource
        this.schema = schema
    }

    get today() {
        const today = new Date()
        return `${today.getDate() < 10 ? '0' : ''}${today.getDate()}/${today.getMonth() + 1 < 10 ? '0' : ''}${today.getMonth() + 1}/${today.getFullYear()}`
    }

    get now() {
        const today = new Date()
        // return `${today.getDate() < 10 ? '0' : ''}${today.getDate()}/${today.getMonth() + 1 < 10 ? '0' : ''}${today.getMonth() + 1}/${today.getFullYear()} `
        return `${this.today} ${today.getHours()}:${today.getMinutes() < 10 ? '0' : ''}${today.getMinutes()}:${today.getSeconds() < 10 ? '0' : ''}${today.getSeconds()}`
    }

    get copyright() {
        return `/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/`
    }

    get author() {
        return `
/*
** Author: Andrew Hopkinson
*/`
    }

    get auto_generated_warning() {
        return `
/*
** ======================================================================
** === Auto Generated Code All Edits Will Be Lost During Regeneration ===
** ======================================================================
**
** Generated : ${this.now}
**
*/`
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

