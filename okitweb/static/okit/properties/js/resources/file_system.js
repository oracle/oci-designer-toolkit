/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded FileSystem Properties Javascript');

/*
** Define FileSystem Properties Class
*/
class FileSystemProperties extends OkitResourceProperties {
    constructor (resource) {
        const resource_tabs = []
        super(resource, resource_tabs)
    }

    // Build Additional Resource Specific Properties
    buildResource() {
        // Availability Domain
        const ad_data = this.ad_data
        const ad = this.createInput('select', 'Availability Domain', `${this.id}_availability_domain`, '', (d, i, n) => this.resource.availability_domain = n[i].value, ad_data)
        this.availability_domain = ad.input
        this.append(this.core_tbody, ad.row)
        // KMS Key
        const kms_key_id = this.createInput('select', 'KMS Encryption Key', `${this.id}_kms_key_id`, '', (d, i, n) => this.resource.kms_key_id = n[i].value)
        this.kms_key_id = kms_key_id.input
        this.append(this.core_tbody, kms_key_id.row)
        // Pricing Estimates
        const pricing_estimates_details = this.createDetailsSection('Pricing Estimates', `${this.id}_pricing_estimates_details`)
        this.append(this.properties_contents, pricing_estimates_details.details)
        const pricing_estimates_table = this.createTable('', `${this.id}_pricing_estimates_properties`)
        this.pricing_estimates_tbody = pricing_estimates_table.tbody
        this.append(pricing_estimates_details.div, pricing_estimates_table.table)
        // Storage Size
        const estimated_capacity_per_month_gbs_data = {min: 0}
        const estimated_capacity_per_month_gbs = this.createInput('number', 'Estimated Monthly Storage (in GB)', `${this.id}_estimated_capacity_per_month_gbs`, '', (d, i, n) => {n[i].reportValidity(); this.resource.estimated_capacity_per_month_gbs = n[i].value}, estimated_capacity_per_month_gbs_data)
        this.append(this.pricing_estimates_tbody, estimated_capacity_per_month_gbs.row)
        this.estimated_capacity_per_month_gbs = estimated_capacity_per_month_gbs.input
        this.estimated_capacity_per_month_gbs_row = estimated_capacity_per_month_gbs.row
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        // Load Selects
        this.loadSelect(this.kms_key_id, 'key', true, () => true, 'Oracle-managed keys')
        // Assign Values
        this.availability_domain.property('value', this.resource.availability_domain)
        this.kms_key_id.property('value', this.resource.kms_key_id)
        this.estimated_capacity_per_month_gbs.property('value', this.resource.estimated_capacity_per_month_gbs)
    }

}
