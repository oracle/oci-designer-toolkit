/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded ObjectStorageBucket Properties Javascript');

/*
** Define ObjectStorageBucket Properties Class
*/
class ObjectStorageBucketProperties extends OkitResourceProperties {
    constructor (resource) {
        const resource_tabs = []
        super(resource, resource_tabs)
    }

    // Build Additional Resource Specific Properties
    buildResource() {
        const self = this
        // Storage Tier
        const storage_tier = this.createInput('select', 'Storage Tier', `${self.id}_storage_tier`, '', (d, i, n) => self.resource.storage_tier = n[i].value)
        this.storage_tier = storage_tier.input
        this.append(this.core_tbody, storage_tier.row)
        // Public Access
        const public_access_type = this.createInput('select', 'Public Access', `${self.id}_public_access_type`, '', (d, i, n) => self.resource.public_access_type = n[i].value)
        this.public_access_type = public_access_type.input
        this.append(this.core_tbody, public_access_type.row)
        // Auto Tiering
        const auto_tiering = this.createInput('select', 'Auto Tiering', `${self.id}_auto_tiering`, '', (d, i, n) => self.resource.auto_tiering = n[i].value)
        this.auto_tiering = auto_tiering.input
        this.append(this.core_tbody, auto_tiering.row)
        // Versioning
        const versioning = this.createInput('select', 'Versioning', `${self.id}_versioning`, '', (d, i, n) => self.resource.versioning = n[i].value)
        this.versioning = versioning.input
        this.append(this.core_tbody, versioning.row)
        // Object Events
        const object_events_enabled = this.createInput('checkbox', 'Object Events Enabled', `${self.id}_object_events_enabled`, '', (d, i, n) => self.resource.object_events_enabled = n[i].checked)
        this.object_events_enabled = object_events_enabled.input
        this.append(this.core_tbody, object_events_enabled.row)
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
        // Estimated Monthly Capacity
        const estimated_monthly_capacity_gbs_data = {min: 0}
        const estimated_monthly_capacity_gbs = this.createInput('number', 'Estimated Monthly Storage (in GB)', `${this.id}_estimated_monthly_capacity_gbs`, '', (d, i, n) => {n[i].reportValidity(); this.resource.estimated_monthly_capacity_gbs = n[i].value}, estimated_monthly_capacity_gbs_data)
        this.append(this.pricing_estimates_tbody, estimated_monthly_capacity_gbs.row)
        this.estimated_monthly_capacity_gbs = estimated_monthly_capacity_gbs.input
        this.estimated_monthly_capacity_gbs_row = estimated_monthly_capacity_gbs.row
        // Estimated Monthly Requests
        const estimated_monthly_requests_data = {min: 0}
        const estimated_monthly_requests = this.createInput('number', 'Estimated Monthly Requests (in 10,000)', `${this.id}_estimated_monthly_requests`, '', (d, i, n) => {n[i].reportValidity(); this.resource.estimated_monthly_requests = n[i].value}, estimated_monthly_requests_data)
        this.append(this.pricing_estimates_tbody, estimated_monthly_requests.row)
        this.estimated_monthly_requests = estimated_monthly_requests.input
        this.estimated_monthly_requests_row = estimated_monthly_requests.row
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        // Load Selects
        this.loadStorageTierSelect(this.storage_tier)
        this.loadPublicAccessTypeSelect(this.public_access_type)
        this.loadAutoTieringSelect(this.auto_tiering)
        this.loadVersioningSelect(this.versioning)
        this.loadSelect(this.kms_key_id, 'key', true, () => true, 'Oracle-managed keys')
        // Assign Values
        this.storage_tier.property('value', this.resource.storage_tier)
        this.public_access_type.property('value', this.resource.public_access_type)
        this.auto_tiering.property('value', this.resource.auto_tiering)
        this.versioning.property('value', this.resource.versioning)
        this.object_events_enabled.property('checked', this.resource.object_events_enabled)
        this.kms_key_id.property('value', this.resource.kms_key_id)
        // Pricing Estimates
        this.estimated_monthly_capacity_gbs.property('value', this.resource.estimated_monthly_capacity_gbs)
        this.estimated_monthly_requests.property('value', this.resource.estimated_monthly_requests)
    }

    loadStorageTierSelect(select) {
        const types_map = new Map([ // Map to Terraform Local Variable Names
            ['Standard', 'Standard'],
            ['Archive', 'Archive'],
        ]);    
        this.loadSelectFromMap(select, types_map)
    }
    loadAutoTieringSelect(select) {
        const types_map = new Map([ // Map to Terraform Local Variable Names
            ['Disabled', 'Disabled'],
            ['Infrequent Access', 'InfrequentAccess'],
        ]);    
        this.loadSelectFromMap(select, types_map)
    }
    loadVersioningSelect(select) {
        const types_map = new Map([ // Map to Terraform Local Variable Names
            ['Disabled', 'Disabled'],
            ['Enabled', 'Enabled'],
        ]);    
        this.loadSelectFromMap(select, types_map)
    }
    loadPublicAccessTypeSelect(select) {
        const types_map = new Map([ // Map to Terraform Local Variable Names
            ['No Public Access', 'NoPublicAccess'],
            ['Read & List', 'ObjectRead'],
            ['Read Only', 'ObjectReadWithoutList'],
        ]);    
        this.loadSelectFromMap(select, types_map)
    }
}
