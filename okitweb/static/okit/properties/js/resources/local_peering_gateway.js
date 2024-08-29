/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded LocalPeeringGateway Properties Javascript');

/*
** Define LocalPeeringGateway Properties Class
*/
class LocalPeeringGatewayProperties extends OkitResourceProperties {
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
        // Peered Gateway
        const peer_id = this.createInput('select', 'Peered Gateway', `${this.id}_peer_id`, '', (d, i, n) => {this.resource.peer_id = n[i].value;this.updatePeeredGateway()})
        this.peer_id = peer_id.input
        this.append(this.core_tbody, peer_id.row)
        // Advanced
        const advanced = this.createDetailsSection('Advanced', `${this.id}_advanced_details`)
        this.append(this.properties_contents, advanced.details)
        this.advanced_div = advanced.div
        const advanced_table = this.createTable('', `${this.id}_advanced`)
        this.advanced_tbody = advanced_table.tbody
        this.append(this.advanced_div, advanced_table.table)
        // Route Table
        const route_table_id = this.createInput('select', 'Route Table', `${this.id}_route_table_id`, '', (d, i, n) => {this.resource.route_table_id = n[i].value; this.redraw()})
        this.route_table_id = route_table_id.input
        this.append(this.advanced_tbody, route_table_id.row)
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        // Load Reference Selects
        this.loadSelect(this.vcn_id, 'virtual_cloud_network', false)
        this.loadSelect(this.peer_id, 'local_peering_gateway', true, (r) => !this.vcn_filter(r))
        this.loadSelect(this.route_table_id, 'route_table', true, this.vcn_filter)
        // Assign Values
        this.vcn_id.property('value', this.resource.vcn_id)
        this.peer_id.property('value', this.resource.peer_id)
        this.route_table_id.property('value', this.resource.route_table_id)
    }

    updatePeeredGateway() {
        if (this.resource.peer_id !== '') {
            this.resource.getOkitJson().getLocalPeeringGateway(this.resource.peer_id).peer_id = this.resource.id
        } else {
            this.resource.getOkitJson().getLocalPeeringGateways().filter(l => l.peer_id === this.resource.id).forEach(l => l.peer_id = '')
        }
    }
}
