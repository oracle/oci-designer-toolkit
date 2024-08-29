/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded VirtualCloudNetwork Properties Javascript');

/*
** Define VirtualCloudNetwork Properties Class
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
        const ipv4 = this.createInput('ipv4_cidr_list', 'IPv4 CIDR(s)', `${self.id}_cidr_blocks`, '', (d, i, n) => {if (n[i].reportValidity()) self.resource.cidr_blocks = n[i].value.replace(' ', '').split(',').filter(c => c != '')})
        this.cidr_blocks = ipv4.input
        this.append(this.core_tbody, ipv4.row)
        // DNS Label
        // const dns_data = {
        //     maxlength: '15',
        //     pattern: '^[a-zA-Z][a-zA-Z0-9]{0,15}$',
        //     title: 'Only letters and numbers, starting with a letter. 15 characters max.'
        // }
        const dns = this.createInput('text', 'DNS Label', `${self.id}_dns_label`, '', (d, i, n) => {if (n[i].reportValidity()) self.resource.dns_label = n[i].value}, this.dns_data)
        this.dns_label = dns.input
        this.append(this.core_tbody, dns.row)
        // Optional Properties
        const ond = this.createDetailsSection('Optional Networking', `${self.id}_optional_network_details`, '', undefined, {}, false)
        this.append(this.properties_contents, ond.details)
        const ont = this.createTable('', `${self.id}_option_network_properties`)
        this.optional_network_tbody = ont.tbody
        this.append(ond.div, ont.table)
        // IPv6 CIDR Allowed
        const ipv6flag = this.createInput('checkbox', 'IPv6 Allowed', `${self.id}_is_ipv6enabled`, '', (d, i, n) => {self.resource.is_ipv6enabled = n[i].checked; self.ipv6EnabledChange()})
        this.is_ipv6enabled = ipv6flag.input
        this.append(this.optional_network_tbody, ipv6flag.row)
        // IPv6 CIDR Blocks
        const ipv6 = this.createInput('ipv6_cidr_list', 'IPv6 CIDR(s)', `${self.id}_ipv6cidr_blocks`, '', (d, i, n) => {if (n[i].reportValidity()) self.resource.ipv6cidr_blocks = n[i].value.replace(' ', '').split(',')})
        this.ipv6cidr_blocks = ipv6.input
        this.append(this.optional_network_tbody, ipv6.row)
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        // this.handleDisplayNameChange()
        this.cidr_blocks.property('value', this.resource.cidr_blocks.join(','))
        this.dns_label.property('value', this.resource.dns_label)
        this.is_ipv6enabled.property('checked', this.resource.is_ipv6enabled)
        this.ipv6cidr_blocks.property('value', Array.isArray(this.resource.ipv6cidr_blocks) ? this.resource.ipv6cidr_blocks.join(',') : '')
        this.ipv6EnabledChange()
    }

    ipv6EnabledChange() {
        this.ipv6cidr_blocks.attr('readonly', !this.resource.is_ipv6enabled ? 'readonly' : undefined)
        this.ipv6cidr_blocks.property('value', this.resource.is_ipv6enabled ? this.resource.ipv6cidr_blocks.join(',') : '')
        this.resource.ipv6cidr_blocks = this.resource.is_ipv6enabled ? this.resource.ipv6cidr_blocks : []
    }

    handleDisplayNameChange = () => {
        const dns_label = this.resource.generateDnsLabel()
        this.dns_label.attr('placeholder', dns_label)
        this.dns_label.property('placeholder', dns_label)
        this.resource.dns_label = dns_label
        this.dns_label.property('value', this.resource.dns_label)
    }
}
