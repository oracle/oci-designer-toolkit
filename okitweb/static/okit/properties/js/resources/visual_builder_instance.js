/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Visual Builder Instance Properties Javascript');

/*
** Define Visual Builder Instance Properties Class
*/
class VisualBuilderInstanceProperties extends OkitResourceProperties {
    constructor (resource) {
        const resource_tabs = []
        super(resource, resource_tabs)
    }

    // Build Additional Resource Specific Properties
    buildResource() {
        // Node Count
        const node_count_data = {min: 1}
        const node_count = this.createInput('number', 'Node Count', `${this.id}_node_count`, '', (d, i, n) => this.resource.node_count = n[i].value, node_count_data)
        this.node_count = node_count.input
        this.append(this.core_tbody, node_count.row)
        // Consumption Model
        const consumption_model = this.createInput('select', 'Consumption Model', `${this.id}_consumption_model`, '', (d, i, n) => this.resource.consumption_model = n[i].value)
        this.consumption_model = consumption_model.input
        this.append(this.core_tbody, consumption_model.row)
        // Enabled
        const is_visual_builder_enabled = this.createInput('checkbox', 'Enabled', `${this.id}_is_visual_builder_enabled`, '', (d, i, n) => {this.resource.is_visual_builder_enabled = n[i].checked})
        this.is_visual_builder_enabled = is_visual_builder_enabled.input
        this.append(this.core_tbody, is_visual_builder_enabled.row)
        // Custom Endpoint
        const custom_endpoint_details = this.createDetailsSection('Custom Endpoint', `${self.id}_custom_endpoint_details`, '', undefined, {}, true)
        this.append(this.properties_contents, custom_endpoint_details.details)
        const custom_endpoint_table = this.createTable('', `${self.id}_custom_endpoint_properties`)
        this.custom_endpoint_tbody = custom_endpoint_table.tbody
        this.append(custom_endpoint_details.div, custom_endpoint_table.table)
        // Custom Endpoint Hostname
        const custom_endpoint_hostname = this.createInput('text', 'Hostname', `${this.id}_custom_endpoint_hostname`, '', (d, i, n) => this.resource.custom_endpoint.hostname = n[i].value)
        this.custom_endpoint_hostname = custom_endpoint_hostname.input
        this.append(this.custom_endpoint_tbody, custom_endpoint_hostname.row)
        // Advanced Properties
        const advanced_detail = this.createDetailsSection('Advanced', `${self.id}_advanced_details`, '', undefined, {}, true)
        this.append(this.properties_contents, advanced_detail.details)
        const advanced_table = this.createTable('', `${self.id}_advanced_properties`)
        this.advanced_tbody = advanced_table.tbody
        this.append(advanced_detail.div, advanced_table.table)
        // IDCS Open Id
        const idcs_open_id = this.createInput('text', 'IDCS Open Id', `${this.id}_idcs_open_id`, '', (d, i, n) => this.resource.idcs_open_id = n[i].value)
        this.idcs_open_id = idcs_open_id.input
        this.append(this.advanced_tbody, idcs_open_id.row)

        // this.idcs_open_id = ''
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
        this.loadConsumptionModelSelect(this.consumption_model)
        // Assign Values
        this.node_count.property('value', this.resource.node_count)
        this.consumption_model.property('value', this.resource.consumption_model)
        this.is_visual_builder_enabled.property('checked', this.resource.is_visual_builder_enabled)
        this.custom_endpoint_hostname.property('value', this.resource.custom_endpoint.hostname)
        this.idcs_open_id.property('value', this.resource.idcs_open_id)
        this.estimated_ocpu_per_hour.property('value', this.resource.pricing_estimates.estimated_ocpu_per_hour)
    }

    loadConsumptionModelSelect(select) {
        const options_map = new Map([
            ['', ''],
            ['GOV', 'GOV'],
            ['UCM', 'UCM'],
            ['VB4SAAS', 'VB4SAAS'],
        ]);
        this.loadSelectFromMap(select, options_map)
    }
}
