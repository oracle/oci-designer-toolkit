/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded BlockStorageVolume Properties Javascript');

/*
** Define BlockStorageVolume Properties Class
*/
class BlockStorageVolumeProperties extends OkitResourceProperties {
    constructor (resource) {
        const resource_tabs = []
        super(resource, resource_tabs)
    }

    // Build Additional Resource Specific Properties
    buildResource() {
        const self = this
        // Availability Domain
        const ad_data = this.ad_data
        const ad = this.createInput('select', 'Availability Domain', `${self.id}_availability_domain`, '', (d, i, n) => self.resource.availability_domain = n[i].value, ad_data)
        this.availability_domain = ad.input
        this.append(this.core_tbody, ad.row)
        // KMS Key
        const kms_key_id = this.createInput('select', 'KMS Encryption Key', `${this.id}_kms_key_id`, '', (d, i, n) => this.resource.kms_key_id = n[i].value)
        this.kms_key_id = kms_key_id.input
        this.append(this.core_tbody, kms_key_id.row)
        // Size & Performance
        const size = this.createDetailsSection('Size and Performance', `${self.id}_size_details`)
        this.append(this.properties_contents, size.details)
        this.size_div = size.div
        const size_table = this.createTable('', `${self.id}_size`)
        this.size_tbody = size_table.tbody
        this.append(size.div, size_table.table)
        // Size
        const size_in_gb = this.createInput('number', 'Size (in GB)', `${self.id}_size_in_gbs`, '', (d, i, n) => self.resource.size_in_gbs = n[i].value, {min: 50, max: 32768})
        this.size_in_gbs = size_in_gb.input
        this.append(this.size_tbody, size_in_gb.row)
        // Performance
        const vpus_per_gb_data = this.resource.isOCI() ? {min: 0, max: 120, step: 10} : {min: 10, max: 20, step: 10}
        const vpus_per_gb = this.createInput('number', 'Volume Performance', `${self.id}_vpus_per_gb`, '', (d, i, n) => {self.resource.vpus_per_gb = n[i].value; self.vpus_per_gb_range.property('value', self.resource.vpus_per_gb); this.setPerformanceTitle()}, vpus_per_gb_data)
        this.vpus_per_gb = vpus_per_gb.input
        this.vpus_per_gb_label = vpus_per_gb.title
        this.vpus_per_gb_row = vpus_per_gb.row
        this.append(this.size_tbody, vpus_per_gb.row)
        const vpus_per_gb_range = this.createInput('range', '', `${self.id}_vpus_per_gb_range`, '', (d, i, n) => {self.resource.vpus_per_gb = n[i].value; self.vpus_per_gb.property('value', self.resource.vpus_per_gb); this.setPerformanceTitle()}, vpus_per_gb_data)
        this.vpus_per_gb_range = vpus_per_gb_range.input
        this.vpus_per_gb_range_row = vpus_per_gb_range.row
        this.append(this.size_tbody, vpus_per_gb_range.row)
        // Backup
        const backup = this.createDetailsSection('Backup', `${self.id}_backup_details`)
        this.append(this.properties_contents, backup.details)
        this.backup_div = backup.div
        const backup_table = this.createTable('', `${self.id}_backup`)
        this.backup_tbody = backup_table.tbody
        this.append(this.backup_div, backup_table.table)
        // Backup Policy
        const policy = this.createInput('select', 'Policy', `${self.id}_backup_policy`, '', (d, i, n) => self.resource.backup_policy = n[i].value)
        this.backup_policy = policy.input
        this.append(this.backup_tbody, policy.row)
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        // Load Selects
        this.loadSelect(this.kms_key_id, 'key', true, () => true, 'Oracle-managed keys')
        // Assign Values
        this.availability_domain.property('value', this.resource.availability_domain)
        this.kms_key_id.property('value', this.resource.kms_key_id)
        this.size_in_gbs.property('value', this.resource.size_in_gbs)
        this.vpus_per_gb.property('value', this.resource.vpus_per_gb)
        this.vpus_per_gb_range.property('value', this.resource.vpus_per_gb)
        this.setPerformanceTitle()
        this.loadReferenceSelect(this.backup_policy, 'getVolumeBackupPolicies', true, undefined, {'Oracle-Defined Policies': this.oci_defined_filter, 'User-Defined Policies': this.user_defined_filter}, 'No Backup Policy Selected')
        this.backup_policy.property('value', this.resource.backup_policy)
        // if (this.resource.getOkitJson().metadata.platform === 'pca') {
        //     this.vpus_per_gb_row.classed('collapsed', true)
        //     this.vpus_per_gb_range_row.classed('collapsed', true)
        // }
    }

    // Set Performance Label
    setPerformanceTitle() {
        const vpus_per_gb = parseInt(this.vpus_per_gb.property('value'))
        this.vpus_per_gb_label.text(`Performance (${vpus_per_gb === 0 ? 'Lower Cost' : vpus_per_gb === 10 ? 'Balanced' : vpus_per_gb === 20 ? 'Higher Performance' : 'Ultra High Performance'})`)
    }
}
