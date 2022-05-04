/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded ObjectStorageBucket Properties Javascript');

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
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        // Load Selects
        this.loadStorageTierSelect(this.storage_tier)
        this.loadPublicAccessTypeSelect(this.public_access_type)
        this.loadAutoTieringSelect(this.auto_tiering)
        this.loadVersioningSelect(this.versioning)
        // Assign Values
        this.storage_tier.property('value', this.resource.storage_tier)
        this.public_access_type.property('value', this.resource.public_access_type)
        this.auto_tiering.property('value', this.resource.auto_tiering)
        this.versioning.property('value', this.resource.versioning)
        this.object_events_enabled.property('checked', this.resource.object_events_enabled)

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
