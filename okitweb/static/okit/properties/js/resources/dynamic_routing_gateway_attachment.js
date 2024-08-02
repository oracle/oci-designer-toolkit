/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Dynamic Routing Gateway Attachment Properties Javascript');

/*
** Define Dynamic Routing Gateway Attachment Properties Class
*/
class DynamicRoutingGatewayAttachmentProperties extends OkitResourceProperties {
    constructor (resource) {
        const resource_tabs = []
        super(resource, resource_tabs)
    }

    // Build Additional Resource Specific Properties
    buildResource() {
        // VCN
        const vcn_id = this.createInput('select', 'Virtual Cloud Network', `${this.id}_vcn_id`, '', (d, i, n) => {this.resource.vcn_id = n[i].value;})
        this.vcn_id = vcn_id.input
        this.append(this.core_tbody, vcn_id.row)
        // DRG
        const drg_id = this.createInput('select', 'Dynamic Routing Gateway', `${this.id}_drg_id`, '', (d, i, n) => {this.resource.drg_id = n[i].value})
        this.drg_id = drg_id.input
        this.append(this.core_tbody, drg_id.row)
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        // Load Selects
        this.loadSelect(this.vcn_id, 'virtual_cloud_network', false)
        this.loadSelect(this.drg_id, 'dynamic_routing_gateways', true)
        // Assign Values
        this.vcn_id.property('value', this.resource.vcn_id)
        this.drg_id.property('value', this.resource.drg_id)
    }

}
