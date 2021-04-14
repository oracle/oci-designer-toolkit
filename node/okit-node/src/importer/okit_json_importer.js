/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Author: Andrew Hopkinson
*/

/*
** Author: Andrew Hopkinson
*/

import { OkitData } from '../data/okit.js'

class OkitJsonImporter {
    constructor(data) {
        this.okit_data = new OkitData()
        this.json = undefined
        if (data && typeof data === 'string') this.loadString(data)
        else if (data && data instanceof Object) this.loadJson(data)
        else this.loadJson({})
    }

    loadString(str) {
        this.loadJson(JSON.parse(str))
    }

    loadJson(data) {
        this.json = data
    }

    resource_map = {
        autonomous_databases: 'autonomous_database',
        block_storage_volumes: 'volume',
        compartments: 'compartment',
        customer_premise_equipments: 'cpe',
        database_systems: 'database',
        dynamic_routing_gateways: 'drg',
        fast_connects: 'fast_connects',
        file_storage_systems: 'file_system',
        instances: 'instance',
        instance_pools: 'instance_pool',
        internet_gateways: 'internet_gateway',
        ipsec_connections: 'ipsec_connection',
        load_balancers: 'load_balancer',
        local_peering_gateways: 'local_peering_gateway',
        mysql_database_systems: 'mysql_db_system',
        nat_gateways: 'nat_gateway',
        network_security_groups: 'network_security_group',
        object_storage_buckets: 'bucket',
        oke_clusters: 'cluster',
        remote_peering_connections: 'remote_peering_connection',
        route_tables: 'route_table',
        security_lists: 'security_list',
        service_gateways: 'service_gateway',
        subnets: 'subnet',
        virtual_cloud_networks: 'vcn',
    }
    cross_region_resources = ['compartment']

    convert(region=undefined) {
        if (this.json) {
            Object.entries(this.json).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    if (value.length > 0) {
                        if (this.cross_region_resources.includes(this.resource_map[key])) {
                            this.okit_data.okit.region.cross_region.resources[this.resource_map[key]] = value
                        } else {
                            this.okit_data.okit.region[String(region)].resources[this.resource_map[key]] = value
                        }
                    }
                } else {
                    this.okit_data.okit[key] = value
                }
            })
        }
        return this.okit_data
    }

}

export { OkitJsonImporter }
