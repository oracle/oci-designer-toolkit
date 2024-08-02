/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Subnet Properties Javascript');

/*
** Define Subnet Properties Class
*/
class SubnetProperties extends OkitResourceProperties {
    constructor (resource) {
        const resource_tabs = []
        super(resource, resource_tabs)
    }

    // Build Additional Resource Specific Properties
    buildResource() {
        const self = this
        // VCN
        const vcn = this.createInput('select', 'Virtual Cloud Network', `${self.id}_vcn_id`, '', (d, i, n) => self.resource.vcn_id = n[i].value)
        this.vcn_id = vcn.input
        this.append(this.core_tbody, vcn.row)
        // IPv4 CIDR Blocks
        const ipv4 = this.createInput('ipv4_cidr', 'IPv4 CIDR', `${self.id}_cidr_block`, '', (d, i, n) => {n[i].reportValidity(); self.resource.cidr_block = n[i].value; this.redraw()})
        this.cidr_block = ipv4.input
        this.append(this.core_tbody, ipv4.row)

        // Advanced Properties
        const advd = this.createDetailsSection('Advanced Networking', `${self.id}_advanced_network_details`, '', undefined, {}, true)
        this.append(this.properties_contents, advd.details)
        const advt = this.createTable('', `${self.id}_advanced_network_properties`)
        this.advanced_network_tbody = advt.tbody
        this.append(advd.div, advt.table)
        // Availability Domain
        const ad_data = {options: {0: 'Regional', ...this.ad_data.options}}
        const ad = this.createInput('select', 'Availability Domain', `${self.id}_availability_domain`, '', (d, i, n) => self.resource.availability_domain = n[i].value, ad_data)
        this.availability_domain = ad.input
        this.append(this.advanced_network_tbody, ad.row)
        // DNS Label
        const dns_data = this.dns_data
        const dns = this.createInput('text', 'DNS Label', `${self.id}_dns_label`, '', (d, i, n) => {if (n[i].reportValidity()) self.resource.dns_label = n[i].value}, dns_data)
        this.dns_label = dns.input
        this.append(this.advanced_network_tbody, dns.row)
        // Private
        const private_ip = this.createInput('checkbox', 'Private', `${self.id}_prohibit_public_ip_on_vnic`, '', (d, i, n) => {self.resource.prohibit_public_ip_on_vnic = n[i].checked; this.redraw()})
        this.prohibit_public_ip_on_vnic = private_ip.input
        this.append(this.advanced_network_tbody, private_ip.row)
        // Route Table
        const rt = this.createInput('select', 'Route Table', `${self.id}_route_table_id`, '', (d, i, n) => {self.resource.route_table_id = n[i].value; this.redraw()})
        this.route_table_id = rt.input
        this.append(this.advanced_network_tbody, rt.row)
        // Security Lists
        const sl = this.createInput('multiselect', 'Security Lists', `${self.id}_security_list_ids`, '', (d, i, n) => {self.resource.security_list_ids = Array.from(n[i].querySelectorAll('input[type="checkbox"]:checked')).map((n) => n.value); this.redraw()})
        this.security_list_ids = sl.input
        this.append(this.advanced_network_tbody, sl.row)
        // DHCP Options
        const dhcp = this.createInput('select', 'DHCP Options', `${self.id}_dhcp_options_id`, '', (d, i, n) => {self.resource.dhcp_options_id = n[i].value; this.redraw()})
        this.dhcp_options_id = dhcp.input
        this.append(this.advanced_network_tbody, dhcp.row)

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
        const ipv6 = this.createInput('ipv6_cidr_list', 'IPv6 CIDR(s)', `${self.id}_ipv6cidr_blocks`, '', (d, i, n) => {n[i].reportValidity(); self.resource.ipv6cidr_blocks = n[i].value})
        this.ipv6cidr_blocks = ipv6.input
        this.append(this.optional_network_tbody, ipv6.row)
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        // this.handleDisplayNameChange()
        // Load Reference Selects
        this.loadSelect(this.vcn_id, 'virtual_cloud_network', true)
        this.loadSelect(this.route_table_id, 'route_table', true, this.vcn_filter)
        this.loadSelect(this.dhcp_options_id, 'dhcp_options', true, this.vcn_filter)
        this.loadMultiSelect(this.security_list_ids, 'security_list', false, this.vcn_filter)
        // Assign Values
        this.vcn_id.property('value', this.resource.vcn_id)
        this.cidr_block.property('value', this.resource.cidr_block)
        this.availability_domain.property('value', this.resource.availability_domain)
        this.dns_label.property('value', this.resource.dns_label)
        this.prohibit_public_ip_on_vnic.property('checked', this.resource.prohibit_public_ip_on_vnic)
        this.route_table_id.property('value', this.resource.route_table_id)
        Array.from(this.security_list_ids.node().querySelectorAll('input[type="checkbox"]')).filter((n) => this.resource.security_list_ids.includes(n.value)).forEach((n) => n.checked = true)
        this.dhcp_options_id.property('value', this.resource.dhcp_options_id)
        this.is_ipv6enabled.property('checked', this.resource.is_ipv6enabled)
        this.ipv6cidr_blocks.property('value', this.resource.ipv6cidr_blocks)
        this.ipv6EnabledChange()
    }

    ipv6EnabledChange() {
        this.ipv6cidr_blocks.attr('readonly', !this.resource.is_ipv6enabled ? 'readonly' : undefined)
        this.ipv6cidr_blocks.property('value', this.resource.is_ipv6enabled ? this.resource.ipv6cidr_blocks : '')
        this.resource.ipv6cidr_blocks = this.resource.is_ipv6enabled ? this.resource.ipv6cidr_blocks : ''
    }

    handleDisplayNameChange = () => {
        const dns_label = this.resource.generateDnsLabel()
        this.dns_label.attr('placeholder', dns_label)
        this.dns_label.property('placeholder', dns_label)
        this.resource.dns_label = dns_label
        this.dns_label.property('value', this.resource.dns_label)
    }
}
