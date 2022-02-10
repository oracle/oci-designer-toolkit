/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded VirtualCloudNetwork Properties Javascript');

/*
** Define VirtualCloudNetwork View Class
*/
class VirtualCloudNetworkProperties extends OkitResourceProperties {
    constructor (resource) {
        const resource_tabs = []
        super(resource, resource_tabs)
    }

    // Build Additional Resource Specific Properties
    buildResource() {
        const self = this
        // IPv4 CIDR Blocks
        const [ip_row, ip_input] = this.createInput('ipv4_cidr_list', 'IPv4 CIDR(s)', `${self.id}_cidr_blocks`, '', (d, i, n) => {n[i].reportValidity(); self.resource.cidr_blocks = n[i].value})
        this.cidr_blocks = ip_input
        this.append(this.core_tbody, ip_row)
        // DNS Label
        const dns_data = {
            maxlength: '15',
            pattern: '^[a-zA-Z][a-zA-Z0-9]{0,15}$',
            title: 'Only letters and numbers, starting with a letter. 15 characters max.'
        }
        const [dns_row, dns_input] = this.createInput('text', 'DNS Label', `${self.id}_dns_label`, '', (d, i, n) => {n[i].reportValidity(); self.resource.dns_label = n[i].value}, dns_data)
        this.dns_label = dns_input
        this.append(this.core_tbody, dns_row)

        // Optional Properties
        const [details, summary, div] = this.createDetailsSection('Optional Networking', `${self.id}_optional_network_details`, '', undefined, {}, false)
        this.append(this.properties_contents, details)
        const [table, thead, tbody] = this.createTable('', `${self.id}_option_network_properties`)
        this.optional_network_tbody = tbody
        this.append(div, table)
        // IPv6 CIDR Allowed
        const [ipv6flag_row, ipv6flag_input] = this.createInput('checkbox', 'IPv6 Allowed', `${self.id}_is_ipv6enabled`, '', (d, i, n) => {n[i].reportValidity(); self.resource.is_ipv6enabled = n[i].checked; self.ipv6EnabledChange()})
        this.is_ipv6enabled = ipv6flag_input
        this.append(this.optional_network_tbody, ipv6flag_row)
        // IPv6 CIDR Blocks
        const [ipv6_row, ipv6_input] = this.createInput('ipv6_cidr_list', 'IPv6 CIDR(s)', `${self.id}_ipv6cidr_blocks`, '', (d, i, n) => {n[i].reportValidity(); self.resource.ipv6cidr_blocks = n[i].value})
        this.ipv6cidr_blocks = ipv6_input
        this.append(this.optional_network_tbody, ipv6_row)
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        this.cidr_blocks.property('value', this.resource.cidr_blocks)
        this.dns_label.property('value', this.resource.dns_label)
        this.is_ipv6enabled.property('checked', this.resource.is_ipv6enabled)
        this.ipv6cidr_blocks.property('value', this.resource.ipv6cidr_blocks)
        this.ipv6EnabledChange()
    }

    ipv6EnabledChange() {
        this.ipv6cidr_blocks.attr('readonly', !this.resource.is_ipv6enabled ? 'readonly' : undefined)
        this.ipv6cidr_blocks.property('value', this.resource.is_ipv6enabled ? this.resource.ipv6cidr_blocks : '')
        this.resource.ipv6cidr_blocks = this.resource.is_ipv6enabled ? this.resource.ipv6cidr_blocks : ''
    }
}
