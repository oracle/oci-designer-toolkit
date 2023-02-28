/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdSchemaImporter } from './OcdSchemaImporter.js'

class OciTerraformSchemaImporter extends OcdSchemaImporter {
    resource_map = {
        oci_containerengine_cluster: 'cluster',
        oci_containerengine_node_pool: 'node_pool',

        oci_core_cpe: 'cpe',
        oci_core_dhcp_options: 'dhcp_options',
        oci_core_drg: 'drg',
        oci_core_instance: 'instance',
        oci_core_instance_pool: 'instance_pool',
        oci_core_internet_gateway: 'internet_gateway',
        oci_core_ipsec: 'ipsec',
        oci_core_local_peering_gateway: 'local_peering_gateway',
        oci_core_nat_gateway: 'nat_gateway',
        oci_core_network_security_group: 'network_security_group',
        oci_core_remote_peering_connection: 'remote_peering_connection',
        oci_core_route_table: 'route_table',
        oci_core_security_list: 'security_list',
        oci_core_service_gateway: 'service_gateway',
        oci_core_subnet: 'subnet',
        oci_core_vcn: 'vcn',
        oci_core_volume: 'volume',
        oci_core_volume_group: 'volume_group',

        oci_database_autonomous_database: 'autonomous_database',
        oci_database_db_system: 'db_system',

        oci_file_storage_file_system: 'file_system',

        oci_identity_compartment: 'compartment',

        oci_load_balancer_load_balancer: 'load_balancer',
        oci_load_balancer_backend: 'backend',
        oci_load_balancer_backend_set: 'backend_set',

        oci_mysql_mysql_db_system: 'mysql_db_system',

        oci_objectstorage_bucket: 'bucket',
    }
    ignore_elements = {
        common: [
            'id',
            'inactive_state', 
            'is_accessible',
            'state', 
            'time_created',
            'system_tags'
        ],
        oci_core_vcn: [
            'default_dhcp_options_id',
            'default_route_table_id',
            'default_security_list_id',
            'ipv6public_cidr_block',
            'vcn_domain_name'
        ],
        oci_database_autonomous_database: [
            'time_deletion_of_free_autonomous_database',
            'time_maintenance_begin',
            'time_maintenance_end',
            'time_of_last_failover',
            'time_of_last_refresh',
            'time_of_last_refresh_point',
            'time_of_last_switchover',
            'time_of_next_refresh',
            'time_reclamation_of_free_autonomous_database'
        ]
    }

    convert(source_schema) {
        const self = this
        // console.info('Processing', Object.entries(source_schema.provider_schemas["registry.terraform.io/hashicorp/oci"].resource_schemas).filter(([k, v]) => Object.keys(self.resource_map).indexOf(k) >= 0))
        Object.entries(source_schema.provider_schemas["registry.terraform.io/hashicorp/oci"].resource_schemas).filter(([k, v]) => Object.keys(self.resource_map).indexOf(k) >= 0).forEach(([key,value]) => {
            console.info('Processing', key)
            self.ocd_schema[this.resource_map[key]] = {
                'type': 'object',
                'subtype': '',
                'attributes': this.getAttributes(key, value.block)
            }
        })
    }

    getAttributes(key, block, hierarchy=[]) {
        const ignore_block_types = ['timeouts']
        const ignore_attributes = this.ignore_elements[key] ? [...this.ignore_elements.common, ...this.ignore_elements[key]] : this.ignore_elements.common
        // Simple attributes
        let attributes = block.attributes ? Object.entries(block.attributes).filter(([k, v]) => !ignore_attributes.includes(k)).reduce((r, [k, v]) => {
            r[k] = {
                name: k,
                type: Array.isArray(v.type) ? v.type[0] : v.type,
                subtype: Array.isArray(v.type) ? v.type[1] : '',
                required: v.required ? v.required : false,
                label: k.endsWith('_id') || k.endsWith('_id') ? this.titleCase(k.split('_').slice(0, -1).join(' ')) : this.titleCase(k.split('_').join(' ')),
                id: [...hierarchy, k].join('.')
            }
            return r
        }, {}) : {}
        // Block / Object Attributes
        if (block.block_types) {
            attributes = Object.entries(block.block_types).filter(([k, v]) => !ignore_block_types.includes(k)).reduce((r, [k, v]) => {
                r[k] = {
                    name: k,
                    type: v.nesting_mode === 'list' && v.max_items === 1 ? 'object' : v.nesting_mode === 'set' ? 'list' : v.nesting_mode,
                    subtype: v.nesting_mode === 'set' ? 'object' : '',
                    required: v.required ? v.required : false,
                    label: this.titleCase(k.split('_').join(' ')),
                    id: [...hierarchy, k].join('.'),
                    attributes: this.getAttributes(key, v.block, [...hierarchy, k])
                }
                return r
            }, attributes)
        }
        return attributes
    }

    titleCase(str) {
        return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
    }
}

export default OciTerraformSchemaImporter
export { OciTerraformSchemaImporter }
