/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Bastion Properties Javascript');

/*
** Define Bastion Properties Class
*/
class BastionProperties extends OkitResourceProperties {
    constructor (resource) {
        const resource_tabs = []
        super(resource, resource_tabs)
    }

    // Build Additional Resource Specific Properties
    buildResource() {
        // Subnet
        const target_subnet_id = this.createInput('select', 'Target Subnet', `${this.id}_target_subnet_id`, '', (d, i, n) => {this.resource.target_subnet_id = n[i].value})
        this.target_subnet_id = target_subnet_id.input
        this.append(this.core_tbody, target_subnet_id.row)
        // IPv4 CIDR Blocks
        const client_cidr_block_allow_list = this.createInput('ipv4_single_cidr_list', 'Allowed IPv4 CIDR(s)', `${this.id}_client_cidr_block_allow_list`, '', (d, i, n) => {n[i].reportValidity(); this.resource.client_cidr_block_allow_list = n[i].value.replace(' ', '').split(',')})
        this.client_cidr_block_allow_list = client_cidr_block_allow_list.input
        this.append(this.core_tbody, client_cidr_block_allow_list.row)
        // TTL
        const max_session_ttl_in_seconds = this.createInput('number', 'Session TTL (Seconds)', `${this.id}_max_session_ttl_in_seconds`, '', (d, i, n) => this.resource.max_session_ttl_in_seconds = n[i].value, {min: 1800, max: 10800})
        this.max_session_ttl_in_seconds = max_session_ttl_in_seconds.input
        this.append(this.core_tbody, max_session_ttl_in_seconds.row)
        // // Advanced
        // const advanced = this.createDetailsSection('Advanced', `${this.id}_advanced_details`)
        // this.append(this.properties_contents, advanced.details)
        // this.advanced_div = advanced.div
        // const advanced_table = this.createTable('', `${this.id}_advanced`)
        // this.advanced_tbody = advanced_table.tbody
        // this.append(this.advanced_div, advanced_table.table)
        // // IPv4 CIDR Blocks
        // const static_jump_host_ip_addresses = this.createInput('ipv4_list', 'Static Jump Host IP(s)', `${this.id}_static_jump_host_ip_addresses`, '', (d, i, n) => {n[i].reportValidity(); this.resource.static_jump_host_ip_addresses = n[i].value.replace(' ', '').split(',')})
        // this.static_jump_host_ip_addresses = static_jump_host_ip_addresses.input
        // this.append(this.advanced_tbody, static_jump_host_ip_addresses.row)
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        // Load Select Inputs
        this.loadSelect(this.target_subnet_id, 'subnet', false)
        // Assign Values
        this.target_subnet_id.property('value', this.resource.target_subnet_id)
        this.client_cidr_block_allow_list.property('value', this.resource.client_cidr_block_allow_list.join(','))
        this.max_session_ttl_in_seconds.property('value', this.resource.max_session_ttl_in_seconds)
        // this.static_jump_host_ip_addresses.property('value', this.resource.static_jump_host_ip_addresses.join(','))
    }
}
