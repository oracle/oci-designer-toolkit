/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded AutonomousDatabase Properties Javascript');

/*
** Define AutonomousDatabase Properties Class
*/
class AutonomousDatabaseProperties extends OkitResourceProperties {
    constructor (resource) {
        const resource_tabs = []
        super(resource, resource_tabs)
    }

    // Build Additional Resource Specific Properties
    buildResource() {
        // Free Tier
        const is_free_tier = this.createInput('checkbox', 'Free Tier', `${this.id}_is_free_tier`, '', (d, i, n) => {this.resource.is_free_tier = n[i].checked; this.handleFreeTierChanged(n[i].checked)})
        this.is_free_tier = is_free_tier.input
        this.append(this.core_tbody, is_free_tier.row)
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
        const nsg_ids = this.createInput('multiselect', 'Network Security Groups', `${this.id}_nsg_ids`, '', (d, i, n) => this.resource.nsg_ids = Array.from(n[i].querySelectorAll('input[type="checkbox"]:checked')).map((n) => n.value))
        this.nsg_ids = nsg_ids.input
        this.append(this.networking_tbody, nsg_ids.row)
        // Endpoint Label
        const private_endpoint_label_data = {}
        const private_endpoint_label = this.createInput('text', 'Endpoint Label', `${this.id}_private_endpoint_label`, '', (d, i, n) => {n[i].reportValidity(); this.resource.private_endpoint_label = n[i].value}, private_endpoint_label_data)
        this.append(this.networking_tbody, private_endpoint_label.row)
        this.private_endpoint_label = private_endpoint_label.input
        this.private_endpoint_label_row = private_endpoint_label.row
        // Database
        const database = this.createDetailsSection('Database', `${this.id}_database_details`)
        this.append(this.properties_contents, database.details)
        this.database_div = database.div
        const database_table = this.createTable('', `${this.id}_database`)
        this.database_tbody = database_table.tbody
        this.append(this.database_div, database_table.table)
        // DB Name
        const db_name = this.createInput('text', 'Database Name', `${this.id}_db_name`, '', (d, i, n) => {n[i].reportValidity(); this.resource.db_name = n[i].value})
        this.append(this.database_tbody, db_name.row)
        this.db_name = db_name.input
        // Admin Password
        const admin_password = this.createInput('password', 'Admin Password', `${this.id}_admin_password`, '', (d, i, n) => {n[i].reportValidity(); this.resource.admin_password = n[i].value})
        this.append(this.database_tbody, admin_password.row)
        this.admin_password = admin_password.input
        // Workload
        const db_workload_data = {options: {...this.db_workload_data.options, AJD: 'JSON Database', APEX: 'Oracle APEX Application Development'}}
        const db_workload = this.createInput('select', 'Workload', `${this.id}_db_workload`, '', (d, i, n) => {this.resource.db_workload = n[i].value; this.showCollapseWorkloadRows(this.resource.db_workload)}, db_workload_data)
        this.db_workload = db_workload.input
        this.append(this.database_tbody, db_workload.row)
        // License Model
        const license_model_data = this.license_model_data
        const license_model = this.createInput('select', 'License Model', `${this.id}_license_model`, '', (d, i, n) => this.resource.license_model = n[i].value, license_model_data)
        this.license_model = license_model.input
        this.license_model_row = license_model.row
        this.append(this.database_tbody, license_model.row)
        // Storage Size
        const data_storage_size_in_tbs_data = {}
        const data_storage_size_in_tbs = this.createInput('number', 'Size (in TB)', `${this.id}_data_storage_size_in_tbs`, '', (d, i, n) => {n[i].reportValidity(); this.resource.data_storage_size_in_tbs = n[i].value}, data_storage_size_in_tbs_data)
        this.append(this.database_tbody, data_storage_size_in_tbs.row)
        this.data_storage_size_in_tbs = data_storage_size_in_tbs.input
        this.data_storage_size_in_tbs_row = data_storage_size_in_tbs.row
        // CPU Count
        const cpu_core_count_data = {min: 1}
        const cpu_core_count = this.createInput('number', 'CPU Core Count', `${this.id}_cpu_core_count`, '', (d, i, n) => {n[i].reportValidity(); this.resource.cpu_core_count = n[i].value}, cpu_core_count_data)
        this.append(this.database_tbody, cpu_core_count.row)
        this.cpu_core_count = cpu_core_count.input
        this.cpu_core_count_row = cpu_core_count.row
        // Auto Scaling
        const is_auto_scaling_enabled = this.createInput('checkbox', 'Auto Scaling', `${this.id}_is_auto_scaling_enabled`, '', (d, i, n) => {this.resource.is_auto_scaling_enabled = n[i].checked})
        this.is_auto_scaling_enabled = is_auto_scaling_enabled.input
        this.is_auto_scaling_enabled_row = is_auto_scaling_enabled.row
        this.append(this.database_tbody, is_auto_scaling_enabled.row)
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        // Load Select Inputs
        this.loadSelect(this.subnet_id, 'subnet', true)
        this.loadMultiSelect(this.nsg_ids, 'network_security_group', false, this.nsg_filter)
        // Assign Values
        this.is_free_tier.property('checked', this.resource.is_free_tier)
        // Networking
        this.setMultiSelect(this.nsg_ids, this.resource.nsg_ids)
        this.subnet_id.property('value', this.resource.subnet_id)
        this.private_endpoint_label.property('value', this.resource.private_endpoint_label)
        // Database
        this.db_name.property('value', this.resource.db_name)
        this.admin_password.property('value', this.resource.admin_password)
        this.db_workload.property('value', this.resource.db_workload)
        this.license_model.property('value', this.resource.license_model)
        this.data_storage_size_in_tbs.property('value', this.resource.data_storage_size_in_tbs)
        this.cpu_core_count.property('value', this.resource.cpu_core_count)
        this.is_auto_scaling_enabled.property('checked', this.resource.is_auto_scaling_enabled)
        // Show / Collapse
        this.showCollapseFreeTierRows()
        this.showCollapseWorkloadRows()
    }

    handleFreeTierChanged(is_free_tier) {
        is_free_tier = is_free_tier !== undefined ? is_free_tier : this.resource.is_free_tier
        if (is_free_tier) {
            this.resource.private_endpoint_label = ''
            this.resource.license_model = 'LICENSE_INCLUDED'
            this.resource.is_auto_scaling_enabled = false
            this.private_endpoint_label.property('value', this.resource.private_endpoint_label)
            this.license_model.property('value', this.resource.license_model)
            this.is_auto_scaling_enabled.property('checked', this.resource.is_auto_scaling_enabled)
        }
        this.showCollapseFreeTierRows(is_free_tier)
    }

    showCollapseFreeTierRows(is_free_tier) {
        is_free_tier = is_free_tier !== undefined ? is_free_tier : this.resource.is_free_tier
        this.license_model_row.classed('collapsed', is_free_tier)
        this.is_auto_scaling_enabled_row.classed('collapsed', is_free_tier)
        this.private_endpoint_label_row.classed('collapsed', is_free_tier)
    }

    showCollapseWorkloadRows(db_workload) {
        db_workload = db_workload !== undefined ? db_workload : this.resource.db_workload
        const is_ajd_apex = db_workload === 'AJD' || db_workload === 'APEX'
        if (is_ajd_apex) {
            this.resource.license_model = 'LICENSE_INCLUDED'
        }
        this.license_model_row.classed('collapsed', is_ajd_apex)
    }
}
