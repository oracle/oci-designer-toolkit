/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded ServiceGateway Properties Javascript');

/*
** Define ServiceGateway Properties Class
*/
class ServiceGatewayProperties extends OkitResourceProperties {
    constructor (resource) {
        const resource_tabs = []
        super(resource, resource_tabs)
    }

    // Build Additional Resource Specific Properties
    buildResource() {
        // VCN
        const vcn_id = this.createInput('select', 'Virtual Cloud Network', `${this.id}_vcn_id`, '', (d, i, n) => this.resource.vcn_id = n[i].value)
        this.vcn_id = vcn_id.input
        this.append(this.core_tbody, vcn_id.row)
        // Service
        const service_name_data = {
            options: {
                All: 'All Services', 
                OCI: 'Object Storage'
            }
        }    
        const service_name = this.createInput('select', 'Service', `${this.id}_service_name`, '', (d, i, n) => this.resource.service_name = n[i].value, service_name_data)
        this.service_name = service_name.input
        this.append(this.core_tbody, service_name.row)
        // Route Table
        const route_table_id = this.createInput('select', 'Route Table', `${this.id}_route_table_id`, '', (d, i, n) => this.resource.route_table_id = n[i].value)
        this.route_table_id = route_table_id.input
        this.append(this.core_tbody, route_table_id.row)
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        // Load Reference Selects
        this.loadSelect(this.vcn_id, 'virtual_cloud_network', false)
        this.loadSelect(this.route_table_id, 'route_table', true)
        // Assign Values
        this.vcn_id.property('value', this.resource.vcn_id)
        this.route_table_id.property('value', this.resource.route_table_id)
    }
}
