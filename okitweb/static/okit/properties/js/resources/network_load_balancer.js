/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded NetworkLoadBalancer Properties Javascript');

/*
** Define NetworkLoadBalancer Properties Class
*/
class NetworkLoadBalancerProperties extends OkitResourceProperties {
    constructor (resource) {
        const resource_tabs = ['Backends', 'Listeners']
        super(resource, resource_tabs)
    }

    // Build Additional Resource Specific Properties
    buildResource() {
        const self = this
        // Description
        const description = this.createInput('text', 'Description', `${this.id}_description`, '', (d, i, n) => this.resource.description = n[i].value)
        this.description = description.input
        this.append(this.core_tbody, description.row)
        // Subnet
        const subnet_id = this.createInput('select', 'Subnet', `${this.id}_subnet_id`, '', (d, i, n) => {this.resource.subnet_id = n[i].value;this.loadMultiSelect(this.network_security_group_ids, 'network_security_group', false, this.nsg_filter)})
        this.subnet_id = subnet_id.input
        this.append(this.core_tbody, subnet_id.row)
        // Is Private
        const is_private = this.createInput('checkbox', 'Private', `${this.id}_is_private`, '', (d, i, n) => {this.resource.is_private = n[i].checked; this.redraw()})
        this.is_private = is_private.input
        this.append(this.core_tbody, is_private.row)
        // Is Preserve Source / Destination
        const is_preserve_source_destination = this.createInput('checkbox', 'Preserve Source / Destination', `${this.id}_is_preserve_source_destination`, '', (d, i, n) => {this.resource.is_preserve_source_destination = n[i].checked; this.redraw()})
        this.is_preserve_source_destination = is_preserve_source_destination.input
        this.append(this.core_tbody, is_preserve_source_destination.row)
        // NSG Lists
        const network_security_group_ids = this.createInput('multiselect', 'Network Security Groups', `${this.id}_network_security_group_ids`, '', (d, i, n) => this.resource.network_security_group_ids = Array.from(n[i].querySelectorAll('input[type="checkbox"]:checked')).map((n) => n.value))
        this.network_security_group_id = network_security_group_ids.input
        this.append(this.core_tbody, network_security_group_ids.row)
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        this.description.property('value', this.resource.description)
    }
}
