/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Data Integration Workspace Properties Javascript');

/*
** Define Data Integration Workspace Properties Class
*/
class DataIntegrationWorkspaceProperties extends OkitResourceProperties {
    constructor (resource) {
        const resource_tabs = []
        super(resource, resource_tabs)
    }

    // Build Additional Resource Specific Properties
    buildResource() {
        // Description
        const description = this.createInput('text', 'Description', `${this.id}_description`, '', (d, i, n) => this.resource.description = n[i].value)
        this.description = description.input
        this.append(this.core_tbody, description.row)
        // Private
        const is_private_network_enabled = this.createInput('checkbox', 'Private Network', `${this.id}_is_private_network_enabled`, '', (d, i, n) => {this.resource.is_private_network_enabled = n[i].checked; this.showHideNetworkRows(); this.redraw()})
        this.is_private_network_enabled = is_private_network_enabled.input
        this.append(this.core_tbody, is_private_network_enabled.row)
        // VCN
        const vcn_id = this.createInput('select', 'Virtual Cloud Network', `${this.id}_vcn_id`, '', (d, i, n) => {this.resource.vcn_id = n[i].value; this.resource.subnet_id = this.loadSelect(this.subnet_id, 'subnet', false, this.vcn_filter); this.redraw()})
        this.vcn_id = vcn_id.input
        this.vcn_id_row = vcn_id.row
        this.append(this.core_tbody, vcn_id.row)
        // Subnet
        const subnet_id = this.createInput('select', 'Subnet', `${this.id}_subnet_id`, '', (d, i, n) => {this.resource.subnet_id = n[i].value; this.redraw()})
        this.subnet_id = subnet_id.input
        this.subnet_id_row = subnet_id.row
        this.append(this.core_tbody, subnet_id.row)
        // DNS Server IP
        const dns_server_ip = this.createInput('ipv4', 'DNS Server IP', `${this.id}_dns_server_ip`, '', (d, i, n) => {n[i].reportValidity(); this.resource.dns_server_ip = n[i].value})
        this.dns_server_ip = dns_server_ip.input
        this.dns_server_ip_row = dns_server_ip.row
        this.append(this.core_tbody, dns_server_ip.row)
        // DNS Server Zone
        const dns_server_zone = this.createInput('text', 'Description', `${this.id}_dns_server_zone`, '', (d, i, n) => this.resource.dns_server_zone = n[i].value)
        this.dns_server_zone = dns_server_zone.input
        this.dns_server_zone_row = dns_server_zone.row
        this.append(this.core_tbody, dns_server_zone.row)
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        // Load Selects
        this.loadSelect(this.vcn_id, 'virtual_cloud_network', true)
        this.loadSelect(this.subnet_id, 'subnet', true, this.vcn_filter)
        // Assign Values
        this.is_private_network_enabled.property('checked', this.resource.is_private_network_enabled)
        this.description.property('value', this.resource.description)
        this.vcn_id.property('value', this.resource.vcn_id)
        this.subnet_id.property('value', this.resource.subnet_id)
        this.dns_server_ip.property('value', this.resource.dns_server_ip)
        this.dns_server_zone.property('value', this.resource.dns_server_zone)
        // Show / Hide Rows
        this.showHideNetworkRows()
    }

    showHideNetworkRows() {
        this.vcn_id_row.classed('collapsed', !this.resource.is_private_network_enabled)
        this.subnet_id_row.classed('collapsed', !this.resource.is_private_network_enabled)
        this.dns_server_ip_row.classed('collapsed', !this.resource.is_private_network_enabled)
        this.dns_server_zone_row.classed('collapsed', !this.resource.is_private_network_enabled)
        if (!this.resource.is_private_network_enabled) {
            this.resource.vcn_id = ''
            this.resource.subnet_id = ''
            this.resource.dns_server_ip = ''
            this.resource.dns_server_zone = ''
        }
        this.vcn_id.property('value', this.resource.vcn_id)
        this.subnet_id.property('value', this.resource.subnet_id)
        this.dns_server_ip.property('value', this.resource.dns_server_ip)
        this.dns_server_zone.property('value', this.resource.dns_server_zone)
    }

}
