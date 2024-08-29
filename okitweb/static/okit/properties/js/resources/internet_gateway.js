/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded InternetGateway Properties Javascript');

/*
** Define InternetGateway Properties Class
*/
class InternetGatewayProperties extends OkitResourceProperties {
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
        // Enabled
        const enabled = this.createInput('checkbox', 'Enabled', `${this.id}_enabled`, '', (d, i, n) => {this.resource.enabled = n[i].checked})
        this.enabled = enabled.input
        this.append(this.core_tbody, enabled.row)
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        // Load Reference Selects
        this.loadSelect(this.vcn_id, 'virtual_cloud_network', false)
        // Assign Values
        this.vcn_id.property('value', this.resource.vcn_id)
        this.enabled.property('checked', this.resource.enabled)
    }
}
