/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded AnalyticsInstance Properties Javascript');

/*
** Define AnalyticsInstance Properties Class
*/
class AnalyticsInstanceProperties extends OkitResourceProperties {
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
        // Capacity Type
        const capacity_type = this.createInput('select', 'Capacity Type', `${this.id}_capacity_type`, '', (d, i, n) => this.resource.capacity.capacity_type = n[i].value)
        this.capacity_type = capacity_type.input
        this.append(this.core_tbody, capacity_type.row)
        // Capacity Value
        const cv_data = {min: 1}
        const capacity_value = this.createInput('number', 'Capacity Value', `${this.id}_capacity_value`, '', (d, i, n) => this.resource.capacity.capacity_value = n[i].value, cv_data)
        this.capacity_value = capacity_value.input
        this.append(this.core_tbody, capacity_value.row)
        // Feature Set
        const feature_set = this.createInput('select', 'Feature Set', `${this.id}_feature_set`, '', (d, i, n) => this.resource.feature_set = n[i].value)
        this.feature_set = feature_set.input
        this.append(this.core_tbody, feature_set.row)
        // License Type
        const license_type = this.createInput('select', 'License Type', `${this.id}_license_type`, '', (d, i, n) => this.resource.license_type = n[i].value)
        this.license_type = license_type.input
        this.append(this.core_tbody, license_type.row)
        // IDCS Access Token
        const idcs_access_token = this.createInput('text', 'IDCS Access Token', `${this.id}_idcs_access_token`, '', (d, i, n) => this.resource.idcs_access_token = n[i].value)
        this.idcs_access_token = idcs_access_token.input
        this.append(this.core_tbody, idcs_access_token.row)
        // Notification Email
        const email_notification = this.createInput('email', 'Notification Email', `${this.id}_email_notification`, '', (d, i, n) => this.resource.email_notification = n[i].value)
        this.email_notification = email_notification.input
        this.append(this.core_tbody, email_notification.row)
        // Optional Properties
        const optional_network_details = this.createDetailsSection('Optional Networking', `${this.id}_optional_network_details`)
        this.append(this.properties_contents, optional_network_details.details)
        this.optional_network_div = optional_network_details.div
        const optional_network_table = this.createTable('', `${this.id}_option_network_properties`)
        this.optional_network_tbody = optional_network_table.tbody
        this.append(optional_network_details.div, optional_network_table.table)
        // Network Endpoint Type
        const network_endpoint_type = this.createInput('select', 'Network Endpoint Type', `${this.id}_network_endpoint_type`, '', (d, i, n) => {this.resource.network_endpoint_details.network_endpoint_type = n[i].value;this.handleNetworkTypeChanged()})
        this.network_endpoint_type = network_endpoint_type.input
        this.append(this.optional_network_tbody, network_endpoint_type.row)
        // VCN
        const vcn = this.createInput('select', 'Virtual Cloud Network', `${this.id}_vcn_id`, '', (d, i, n) => {this.resource.network_endpoint_details.vcn_id = n[i].value})
        this.vcn_id = vcn.input
        this.vcn_id_row = vcn.row
        this.append(this.optional_network_tbody, vcn.row)
        // Subnet
        const subnet_id = this.createInput('select', 'Subnet', `${this.id}_subnet_id`, '', (d, i, n) => {this.resource.network_endpoint_details.subnet_id = n[i].value})
        this.subnet_id = subnet_id.input
        this.subnet_id_row = subnet_id.row
        this.append(this.optional_network_tbody, subnet_id.row)
        // Whitelisted IPs
        const whitelisted_ips = this.createInput('ipv4_list', 'Whitelisted IPs', `${this.id}_whitelisted_ips`, '', (d, i, n) => this.resource.whitelisted_ips = n[i].value.replace(' ', '').split(','))
        this.whitelisted_ips = whitelisted_ips.input
        this.whitelisted_ips_row = whitelisted_ips.row
        this.append(this.optional_network_tbody, whitelisted_ips.row)
        // Whitelsted VCNs
        const whitelisted_vcns_details = this.createDetailsSection('Whitelisted VCNs', `${this.id}_whitelisted_vcns_details`)
        this.append(this.optional_network_div, whitelisted_vcns_details.details)
        this.whitelisted_vcns_div = whitelisted_vcns_details.div
        this.whitelisted_vcns_details = whitelisted_vcns_details.details
        const whitelisted_vcns_table = this.createArrayTable('Rules', `${this.id}_whitelisted_vcns`, '', () => this.addWhitelistedVcn())
        this.whitelisted_vcns_tbody = whitelisted_vcns_table.tbody
        this.append(whitelisted_vcns_details.div, whitelisted_vcns_table.table)
        // Pricing Estimates
        const pricing_estimates_details = this.createDetailsSection('Pricing Estimates', `${this.id}_pricing_estimates_details`)
        this.append(this.properties_contents, pricing_estimates_details.details)
        const pricing_estimates_table = this.createTable('', `${this.id}_pricing_estimates_properties`)
        this.pricing_estimates_tbody = pricing_estimates_table.tbody
        this.append(pricing_estimates_details.div, pricing_estimates_table.table)
        // OCPUs
        const estimated_ocpu_per_hour_data = {min: 1}
        const estimated_ocpu_per_hour = this.createInput('number', 'Estimated OCPUs per Hour', `${this.id}_estimated_ocpu_per_hour`, '', (d, i, n) => {n[i].reportValidity(); this.resource.pricing_estimates.estimated_ocpu_per_hour = n[i].value}, estimated_ocpu_per_hour_data)
        this.append(this.pricing_estimates_tbody, estimated_ocpu_per_hour.row)
        this.estimated_ocpu_per_hour = estimated_ocpu_per_hour.input
        this.estimated_ocpu_per_hour_row = estimated_ocpu_per_hour.row
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        // Load Selects
        this.loadCapacityTypeSelect(this.capacity_type)
        this.loadFeatureSetSelect(this.feature_set)
        this.loadLicenseTypeSelect(this.license_type)
        this.loadNetworkEndpointTypeSelect(this.network_endpoint_type)
        this.loadSelect(this.vcn_id, 'virtual_cloud_network', true)
        this.loadSelect(this.subnet_id, 'subnet', true, this.vcn_filter)
        // Load Values
        this.description.property('value', this.resource.description)
        this.capacity_type.property('value', this.resource.capacity.capacity_type)
        this.capacity_value.property('value', this.resource.capacity.capacity_value)
        this.feature_set.property('value', this.resource.feature_set)
        this.license_type.property('value', this.resource.license_type)
        this.idcs_access_token.property('value', this.resource.idcs_access_token)
        this.email_notification.property('value', this.resource.email_notification)
        this.network_endpoint_type.property('value', this.resource.network_endpoint_details.network_endpoint_type)
        this.vcn_id.property('value', this.resource.network_endpoint_details.vcn_id)
        this.subnet_id.property('value', this.resource.network_endpoint_details.subnet_id)
        this.whitelisted_ips.property('value', this.resource.network_endpoint_details.whitelisted_ips.join(','))
        this.estimated_ocpu_per_hour.property('value', this.resource.pricing_estimates.estimated_ocpu_per_hour)
        this.loadWhitelistedVcns()
        this.collapseExpandNetworkEndPointInputs()
    }

    loadWhitelistedVcns() {
        this.whitelisted_vcns_tbody.selectAll('*').remove()
        this.resource.network_endpoint_details.whitelisted_vcns.forEach((e, i) => this.addWhitelistedVcnHtml(e, i+1))
        this.whitelisted_vcn_idx = this.resource.network_endpoint_details.whitelisted_vcns.length;
    }

    addWhitelistedVcnHtml(vcn, idx) {
        const id = `${this.id}_whitelisted_vcn`
        const delete_row = this.createDeleteRow(id, idx, () => this.deleteWhitelistedVcn(id, idx, vcn))
        this.append(this.whitelisted_vcns_tbody, delete_row.row)
        const whitelisted_vcn_details = this.createDetailsSection('Whitelisted VCN', `${id}_whitelisted_vcn_details`, idx)
        this.append(delete_row.div, whitelisted_vcn_details.details)
        const whitelisted_vcn_table = this.createTable('', `${id}_whitelisted_vcn`, '')
        this.append(whitelisted_vcn_details.div, whitelisted_vcn_table.table)
        // VCN
        const vcn_id = this.createInput('select', 'Virtual Cloud Network', `${id}_vcn_id`, '', (d, i, n) => {vcn.id = n[i].value})
        this.append(whitelisted_vcn_table.tbody, vcn_id.row)
        this.loadSelect(vcn_id.input, 'virtual_cloud_network', true)
        vcn_id.input.property('value', vcn.id)
        // Whitelisted IPs
        const whitelisted_ips = this.createInput('ipv4_list', 'Whitelisted IPs', `${id}_whitelisted_ips`, '', (d, i, n) => vcn.whitelisted_ips = n[i].value.replace(' ', '').split(','))
        this.append(whitelisted_vcn_table.tbody, whitelisted_ips.row)
        whitelisted_ips.input.property('value', vcn.whitelisted_ips.join(','))
    }

    addWhitelistedVcn() {
        const vcn = this.resource.newWhitelistedVcn();
        this.resource.network_endpoint_details.whitelisted_vcns.push(vcn);
        this.whitelisted_vcn_idx += 1
        this.addWhitelistedVcnHtml(vcn, this.whitelisted_vcn_idx);
    }

    deleteWhitelistedVcn(id, idx, vcn) {
        this.resource.network_endpoint_details.whitelisted_vcns = this.resource.network_endpoint_details.whitelisted_vcns.filter((e) => e !== vcn)
        $(`#${id}${idx}_row`).remove()
    }

    handleNetworkTypeChanged() {
        if (this.resource.network_endpoint_details.network_endpoint_type !== 'PRIVATE') {
            this.resource.network_endpoint_details.vcn_id = ''
            this.resource.network_endpoint_details.subnet_id = ''
        } else if (this.resource.network_endpoint_details.network_endpoint_type !== 'PUBLIC') {
            this.resource.network_endpoint_details.whitelisted_ips = []
            this.resource.network_endpoint_details.whitelisted_vcns = []
            this.loadWhitelistedVcns()
        }
        this.collapseExpandNetworkEndPointInputs()
    }

    collapseExpandNetworkEndPointInputs() {
        // console.info('Network Endpoint Type:', this.resource.network_endpoint_details.network_endpoint_type)
        this.vcn_id_row.classed('collapsed', this.resource.network_endpoint_details.network_endpoint_type !== 'PRIVATE')
        this.subnet_id_row.classed('collapsed', this.resource.network_endpoint_details.network_endpoint_type !== 'PRIVATE')
        this.whitelisted_ips_row.classed('collapsed', this.resource.network_endpoint_details.network_endpoint_type !== 'PUBLIC')
        this.whitelisted_vcns_details.classed('hidden', this.resource.network_endpoint_details.network_endpoint_type !== 'PUBLIC')
    }

    loadCapacityTypeSelect(select) {
        const options_map = new Map([
            ['OLPU Count', 'OLPU_COUNT'],
            ['User Count', 'USER_COUNT'],
        ]);
        this.loadSelectFromMap(select, options_map)
    }

    loadFeatureSetSelect(select) {
        const options_map = new Map([
            ['Self Service Analytics', 'SELF_SERVICE_ANALYTICS'],
            ['Enterprise Analytics', 'ENTERPRISE_ANALYTICS'],
        ]);
        this.loadSelectFromMap(select, options_map)
    }

    loadLicenseTypeSelect(select) {
        const options_map = new Map([
            ['License Included', 'LICENSE_INCLUDED'],
            ['Bring Your Own License', 'BRING_YOUR_OWN_LICENSE'],
        ]);
        this.loadSelectFromMap(select, options_map)
    }

    loadNetworkEndpointTypeSelect(select) {
        const options_map = new Map([
            ['', ''],
            ['Public', 'PUBLIC'],
            ['Private', 'PRIVATE'],
        ]);
        this.loadSelectFromMap(select, options_map)
    }
}
