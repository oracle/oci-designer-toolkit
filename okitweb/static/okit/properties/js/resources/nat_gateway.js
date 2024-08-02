/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded NatGateway Properties Javascript');

/*
** Define NatGateway Properties Class
*/
class NatGatewayProperties extends OkitResourceProperties {
    constructor (resource) {
        const resource_tabs = []
        super(resource, resource_tabs)
    }

    // Build Additional Resource Specific Properties
    buildResource() {
        // VCN
        const vcn = this.createInput('select', 'Virtual Cloud Network', `${this.id}_vcn_id`, '', (d, i, n) => this.resource.vcn_id = n[i].value)
        this.vcn_id = vcn.input
        this.append(this.core_tbody, vcn.row)
        // Block Traffic
        const block_traffic = this.createInput('checkbox', 'Block Traffic', `${this.id}_block_traffic`, '', (d, i, n) => {this.resource.block_traffic = n[i].checked})
        this.block_traffic = block_traffic.input
        this.append(this.core_tbody, block_traffic.row)
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        // Load Reference Selects
        this.loadSelect(this.vcn_id, 'virtual_cloud_network', false)
        // Assign Values
        this.vcn_id.property('value', this.resource.vcn_id)
        this.block_traffic.property('checked', this.resource.block_traffic)
    }
}
