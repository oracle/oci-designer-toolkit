/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Mount Target Properties Javascript');

/*
** Define Mount Target View Class
*/
class MountTargetProperties extends OkitResourceProperties {
    constructor (resource) {
        const resource_tabs = ['Exports']
        super(resource, resource_tabs)
    }

    // nsg_filter0 = (r) => {const subnets = this.resource.okit_json.subnet ? this.resource.okit_json.subnet : this.resource.okit_json.subnets ? this.resource.okit_json.subnets : [];const subnet = subnets.filter((s) => s.id === this.resource.subnet_id);return r.vcn_id === subnet[0].vcn_id}
    nsg_filter = (r) => r.vcn_id === [...(this.resource.okit_json.subnet ? this.resource.okit_json.subnet : this.resource.okit_json.subnets ? this.resource.okit_json.subnets : [])].filter((s) => s.id === this.resource.subnet_id)[0].vcn_id
    // nsg_filter1 = (r) => {
    //     const self = this
    //     const subnets = (this.resource.okit_json.subnet ? this.resource.okit_json.subnet : this.resource.okit_json.subnets ? this.resource.okit_json.subnets : [])
    //     console.info('Subnets:', typeof subnets, Array.isArray(subnets), subnets)
    //     const subnet = subnets.filter((s) => s.id === this.resource.subnet_id)
    //     console.info('Subnet:', typeof subnet, subnet)
    //     return r.vcn_id === subnet[0].vcn_id
    // }
    // Build Additional Resource Specific Properties
    buildResource() {
        const self = this
        // Availability Domain
        const [ad_row, ad_input] = this.createInput('select', 'Availability Domain', `${self.id}_availability_domain`, '', (d, i, n) => self.resource.availability_domain = n[i].value, {options: {1: 'Availability Domain 1', 2: 'Availability Domain 2', 3: 'Availability Domain 3'}})
        this.availability_domain = ad_input
        this.append(this.core_tbody, ad_row)
        // Subnet
        const [s_row, s_input] = this.createInput('select', 'Subnet', `${self.id}_subnet_id`, '', (d, i, n) => {self.resource.subnet_id = n[i].value;this.loadMultiSelect(this.nsg_ids, 'network_security_group', false, this.nsg_filter)})
        this.subnet_id = s_input
        this.append(this.core_tbody, s_row)

        // Option Properties
        const [details, summary, div] = this.createDetailsSection('Optional Networking', `${self.id}_optional_network_details`)
        this.append(this.properties_contents, details)
        const [table, thead, tbody] = this.createTable('', `${self.id}_option_network_properties`)
        this.optional_network_tbody = tbody
        this.append(div, table)
        // Hostname
        const [hn_row, hn_input] = this.createInput('text', 'Hostname', `${self.id}_hostname_label`, '', (d, i, n) => self.resource.hostname_label = n[i].value)
        this.hostname_label = hn_input
        this.append(this.optional_network_tbody, hn_row)
        // IP Address
        const [ip_row, ip_input] = this.createInput('ipv4', 'IP Address', `${self.id}_ip_address`, '', (d, i, n) => {n[i].reportValidity(); self.resource.ip_address = n[i].value})
        this.ip_address = ip_input
        this.append(this.optional_network_tbody, ip_row)
        // Network Security Groups
        const [nsg_row, nsg_input] = this.createInput('multiselect', 'Network Security Groups', `${self.id}_nsg_ids`, '', (d, i, n) => self.resource.nsg_ids = Array.from(n[i].querySelectorAll('input[type="checkbox"]:checked')).map((n) => n.value))
        this.nsg_ids = nsg_input
        this.append(this.optional_network_tbody, nsg_row)
        // Exports
        const [es_details, es_summary, es_div] = this.createDetailsSection('Export Set', `${self.id}_export_set_details`)
        this.append(this.exports_contents, es_details)
        this.export_set_div = es_div
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        // Load Select Inputs
        this.loadSelect(this.subnet_id, 'subnet', true)
        this.loadMultiSelect(this.nsg_ids, 'network_security_group', false, this.nsg_filter)
        // Assign Values
        this.availability_domain.property('value', this.resource.availability_domain)
        this.subnet_id.property('value', this.resource.subnet_id)
        this.hostname_label.property('value', this.resource.hostname_label)
        this.ip_address.property('value', this.resource.ip_address)
        Array.from(this.nsg_ids.node().querySelectorAll('input[type="checkbox"]')).filter((n) => this.resource.nsg_ids.includes(n.value)).forEach((n) => n.checked = true)
        // Array.from(this.nsg_ids.node().querySelectorAll('input[type="checkbox"]')).forEach((n) => console.info('All', n.value))
        // Array.from(this.nsg_ids.node().querySelectorAll('input[type="checkbox"]')).filter((n) => this.resource.nsg_ids.includes(n.value)).forEach((n) => console.info('Filtered', n.value))
    }

}
