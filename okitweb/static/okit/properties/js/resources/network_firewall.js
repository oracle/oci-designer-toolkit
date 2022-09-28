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
        const policy_details = this.createDetailsSection('Policy', `${this.id}_policy_details`)
        this.append(this.policy_contents, policy_details.details)
        this.policy_div = policy_details.div
        const policy_props = this.createTable('', `${this.id}_policy_props`, '')
        this.policy_tbody = policy_props.tbody
        this.append(this.policy_div, policy_props.table)    
        // Display Name
        const policy_display_name = this.createInput('text', 'Name', `${this.id}_policy_display_name`, '', (d, i, n) => {n[i].reportValidity(); this.resource.network_firewall_policy.display_name = n[i].value})
        this.policy_display_name = policy_display_name.input
        this.append(this.policy_tbody, policy_display_name.row)
        // IP Addresses
        const ip_address_lists = this.createDetailsSection('IP Address Lists', `${this.id}_ip_address_lists_details`)
        this.append(this.policy_div, ip_address_lists.details)
        this.ip_address_lists_div = ip_address_lists.div
        const ip_address_lists_table = this.createMapTable('IP Addresses', `${this.id}_ip_address_lists`, '', () => this.addIPAddressList())
        this.ip_address_lists_tbody = ip_address_lists_table.tbody
        this.append(ip_address_lists.div, ip_address_lists_table.table)
        // URLs
        const url_lists = this.createDetailsSection('URL Lists', `${this.id}_url_lists_details`)
        this.append(this.policy_div, url_lists.details)
        this.url_lists_div = url_lists.div
        const url_lists_table = this.createMapTable('URLs', `${this.id}_url_lists`, '', () => this.addURLList())
        this.url_lists_tbody = url_lists_table.tbody
        this.append(url_lists.div, url_lists_table.table)
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

        // Policy
        // Display Name
        this.policy_display_name.property('value', this.resource.network_firewall_policy.display_name)
        // IP Lists
        this.loadIPAddressLists()
        // URL Lists
        this.loadURLLists()
    }
    // IP Address Lists
    loadIPAddressLists() {
        this.ip_address_lists_tbody.selectAll('*').remove()
        Object.entries(this.resource.network_firewall_policy.ip_address_lists).forEach(([k, v], i) => this.addIPAddressListHtml(k, v, i+1))
        this.ip_address_lists_idx = Object.keys(this.resource.network_firewall_policy.ip_address_lists).length;
    }
    addIPAddressListHtml(key, value, idx) {
        const id = `${this.id}_ip_list`
        const key_changed = (d, i, n) => {
            const ip_address_lists = this.resource.network_firewall_policy.ip_address_lists
            this.resource.network_firewall_policy.ip_address_lists = Object.fromEntries(Object.entries(ip_address_lists).map(([o_key, o_val]) => (o_key === key) ? [n[i].value, o_val] : [o_key, o_val]));
            this.loadIPAddressLists()
        }
        const value_changed = (d, i, n) => {
            const ip_address_lists = this.resource.network_firewall_policy.ip_address_lists
            ip_address_lists[key] = n[i].value.split(',')
        }
        const delete_row = this.createMapDeleteRow('ipv4_cidr_list', id, idx, key_changed, value_changed, () => this.deleteIPAddressList(id, idx, key))
        this.append(this.ip_address_lists_tbody, delete_row.row)
        delete_row.key_input.property('value', key)
        delete_row.val_input.property('value', value.join(','))
    }
    addIPAddressList() {
        this.ip_address_lists_idx += 1
        const key = `IPList${this.ip_address_lists_idx}`
        const value = []
        this.resource.network_firewall_policy.ip_address_lists[key] = value
        this.addIPAddressListHtml(key, value, this.ip_address_lists_idx)
    }
    deleteIPAddressList(id, idx, key) {
        delete this.resource.network_firewall_policy.ip_address_lists[key]
        this.loadIPAddressLists()
    }
    // URL Lists
    loadURLLists() {
        this.url_lists_tbody.selectAll('*').remove()
        Object.entries(this.resource.network_firewall_policy.url_lists).forEach(([k, v], i) => this.addURLListHtml(k, v, i+1))
        this.url_lists_idx = Object.keys(this.resource.network_firewall_policy.url_lists).length;
    }
    addURLListHtml(key, value, idx) {
        const id = `${this.id}_url_list`
        const key_changed = (d, i, n) => {
            const url_lists = this.resource.network_firewall_policy.url_lists
            this.resource.network_firewall_policy.url_lists = Object.fromEntries(Object.entries(url_lists).map(([o_key, o_val]) => (o_key === key) ? [n[i].value, o_val] : [o_key, o_val]));
            this.loadURLLists()
        }
        const value_changed = (d, i, n) => {
            const url_lists = this.resource.network_firewall_policy.url_lists
            url_lists[key] = n[i].value.split('\n').map(v => {return {pattern: v, type: 'SIMPLE'}})
        }
        const delete_row_data = {rows: 10}
        const delete_row = this.createMapDeleteRow('textarea', id, idx, key_changed, value_changed, () => this.deleteURLList(id, idx, key), delete_row_data)
        this.append(this.url_lists_tbody, delete_row.row)
        delete_row.key_input.property('value', key)
        delete_row.val_input.property('value', value.map(v => v.pattern).join('\n'))
    }
    addURLList() {
        this.url_lists_idx += 1
        const key = `URLList${this.url_lists_idx}`
        const value = []
        this.resource.network_firewall_policy.url_lists[key] = value
        this.addURLListHtml(key, value, this.url_lists_idx)
    }
    deleteURLList(id, idx, key) {
        delete this.resource.network_firewall_policy.url_lists[key]
        this.loadURLLists()
    }
}
