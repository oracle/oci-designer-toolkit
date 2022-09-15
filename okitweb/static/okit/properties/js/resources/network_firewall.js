/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Network Firewall Properties Javascript');

/*
** Define Network Firewall Properties Class
*/
class NetworkFirewallProperties extends OkitResourceProperties {
    constructor (resource) {
        const resource_tabs = ['Policy']
        super(resource, resource_tabs)
    }

    // Build Additional Resource Specific Properties
    buildResource() {
        // Availability Domain
        const ad_data = this.ad_data
        const ad = this.createInput('select', 'Availability Domain', `${this.id}_availability_domain`, '', (d, i, n) => this.resource.availability_domain = n[i].value, ad_data)
        this.availability_domain = ad.input
        this.append(this.core_tbody, ad.row)
        // Networking
        const networking = this.createDetailsSection('Networking', `${this.id}_networking_details`)
        this.append(this.properties_contents, networking.details)
        this.networking_div = networking.div
        const networking_table = this.createTable('', `${this.id}_networking`)
        this.networking_tbody = networking_table.tbody
        this.append(this.networking_div, networking_table.table)
        // Subnet
        const subnet = this.createInput('select', 'Subnet', `${this.id}_subnet_id`, '', (d, i, n) => this.resource.subnet_id = n[i].value)
        this.append(this.networking_tbody, subnet.row)
        this.subnet_id = subnet.input
        // NSG Lists
        const network_security_group_ids = this.createInput('multiselect', 'Network Security Groups', `${this.id}_network_security_group_ids`, '', (d, i, n) => this.resource.network_security_group_ids = Array.from(n[i].querySelectorAll('input[type="checkbox"]:checked')).map((n) => n.value))
        this.network_security_group_ids = network_security_group_ids.input
        this.append(this.networking_tbody, network_security_group_ids.row)
        // Pricing Estimates
        const pricing_estimates_details = this.createDetailsSection('Pricing Estimates', `${this.id}_pricing_estimates_details`)
        this. pricing_estimates_details =  pricing_estimates_details.details
        this.append(this.properties_contents, pricing_estimates_details.details)
        const pricing_estimates_table = this.createTable('', `${this.id}_pricing_estimates_properties`)
        this.pricing_estimates_tbody = pricing_estimates_table.tbody
        this.append(pricing_estimates_details.div, pricing_estimates_table.table)
        // Data Processed
        const estimated_gb_data_processed_data = {min: 0}
        const estimated_gb_data_processed = this.createInput('number', 'Network Firewall Data Processing (GB)', `${this.id}_estimated_gb_data_processed`, '', (d, i, n) => {n[i].reportValidity(); this.resource.pricing_estimates.estimated_gb_data_processed = n[i].value}, estimated_gb_data_processed_data)
        this.append(this.pricing_estimates_tbody, estimated_gb_data_processed.row)
        this.estimated_gb_data_processed = estimated_gb_data_processed.input
        this.estimated_gb_data_processed_row = estimated_gb_data_processed.row
        // Policy
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        // Load Selects
        this.loadSelect(this.subnet_id, 'subnet', true)
        this.loadMultiSelect(this.network_security_group_ids, 'network_security_group', false, this.nsg_filter)
        // Assign Values
        this.availability_domain.property('value', this.resource.availability_domain)
        // Networking
        this.setMultiSelect(this.network_security_group_ids, this.resource.network_security_group_ids)
        this.subnet_id.property('value', this.resource.subnet_id)
        // Pricing
        this.estimated_gb_data_processed.property('value', this.resource.pricing_estimates.estimated_gb_data_processed)
    }

}
