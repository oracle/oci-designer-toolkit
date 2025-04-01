/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded MysqlDatabaseSystem Properties Javascript');

/*
** Define MysqlDatabaseSystem Properties Class
*/
class MysqlDatabaseSystemProperties extends OkitResourceProperties {
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
        // Availability Domain
        const ad_data = this.ad_data
        const ad = this.createInput('select', 'Availability Domain', `${this.id}_availability_domain`, '', (d, i, n) => this.resource.availability_domain = n[i].value, ad_data)
        this.availability_domain = ad.input
        this.append(this.core_tbody, ad.row)
        // Fault Domain
        const fd_data = this.fd_data
        const fd = this.createInput('select', 'Fault Domain', `${this.id}_fault_domain`, '', (d, i, n) => this.resource.fault_domain = n[i].value, fd_data)
        this.fault_domain = fd.input
        this.append(this.core_tbody, fd.row)
        // Shape & Configuration
        const shape_and_config = this.createDetailsSection('Shape & Configuration', `${this.id}_shape_and_config_details`)
        this.append(this.properties_contents, shape_and_config.details)
        this.shape_and_config_div = shape_and_config.div
        const shape_and_config_table = this.createTable('', `${this.id}_shape_and_config`)
        this.shape_and_config_tbody = shape_and_config_table.tbody
        this.append(this.shape_and_config_div, shape_and_config_table.table)
        // Shape
        const shape_name = this.createInput('select', 'Shape', `${this.id}_shape_name`, '', (d, i, n) => {this.resource.shape_name = n[i].value; this.handleShapeChange(n[i].value)})
        this.shape_name = shape_name.input
        this.append(this.shape_and_config_tbody, shape_name.row)
        // Configuration
        const configuration_id = this.createInput('select', 'Configuration', `${this.id}_configuration_id`, '', (d, i, n) => {this.resource.configuration_id = n[i].value; this.resource.configuration_name = n[i].options[n[i].options.selectedIndex].label; this.showShapeConfigData()})
        this.configuration_id = configuration_id.input
        this.append(this.shape_and_config_tbody, configuration_id.row)
        // Version
        const mysql_version = this.createInput('select', 'Version', `${this.id}_mysql_version`, '', (d, i, n) => {this.resource.mysql_version = n[i].value})
        this.mysql_version = mysql_version.input
        this.append(this.shape_and_config_tbody, mysql_version.row)
        // Size
        const data_storage_size_in_gb_data = {min: 50, step: 50}
        const data_storage_size_in_gb = this.createInput('number', 'Size (in GB)', `${this.id}_data_storage_size_in_gb`, '', (d, i, n) => this.resource.data_storage_size_in_gb = n[i].value, data_storage_size_in_gb_data)
        this.data_storage_size_in_gb = data_storage_size_in_gb.input
        this.append(this.shape_and_config_tbody, data_storage_size_in_gb.row)
        // CPU Count
        const cpu_core_count_data = {disabled: 'disabled'}
        const cpu_core_count = this.createInput('number', 'CPU Cores', `${this.id}_cpu_core_count`, '', (d, i, n) => this.resource.cpu_core_count = n[i].value, cpu_core_count_data)
        this.cpu_core_count = cpu_core_count.input
        this.append(this.shape_and_config_tbody, cpu_core_count.row)
        // Memory in GBs
        const memory_size_in_gbs_data = {disabled: 'disabled'}
        const memory_size_in_gbs = this.createInput('number', 'Memory in GBs', `${this.id}_memory_size_in_gbs`, '', (d, i, n) => this.resource.memory_size_in_gbs = n[i].value, memory_size_in_gbs_data)
        this.memory_size_in_gbs = memory_size_in_gbs.input
        this.append(this.shape_and_config_tbody, memory_size_in_gbs.row)
        // HA
        const is_highly_available_data = {disabled: 'disabled'}
        const is_highly_available = this.createInput('checkbox', 'High Availability', `${this.id}_is_highly_available`, '', (d, i, n) => this.resource.is_highly_available = n[i].checked, is_highly_available_data)
        this.is_highly_available = is_highly_available.input
        this.append(this.shape_and_config_tbody, is_highly_available.row)
        // Admin Username
        const admin_username = this.createInput('text', 'Admin Username', `${this.id}_admin_username`, '', (d, i, n) => this.resource.admin_username = n[i].value)
        this.admin_username = admin_username.input
        this.append(this.shape_and_config_tbody, admin_username.row)
        // Admin Password
        const admin_password = this.createInput('password', 'Admin Password', `${this.id}_admin_password`, '', (d, i, n) => this.resource.admin_password = n[i].value)
        this.admin_password = admin_password.input
        this.append(this.shape_and_config_tbody, admin_password.row)
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
        // Hostname Label
        const hostname_data = this.hostname_data
        const hostname = this.createInput('text', 'Hostname', `${this.id}_hostname_label`, '', (d, i, n) => {n[i].reportValidity(); this.resource.hostname_label = n[i].value}, hostname_data)
        this.append(this.networking_tbody, hostname.row)
        this.hostname_label = hostname.input
        // Port
        const port = this.createInput('number', 'Port', `${this.id}_port`, '', (d, i, n) => this.resource.port = n[i].value)
        this.port = port.input
        this.append(this.networking_tbody, port.row)
        // Port X
        const port_x = this.createInput('number', 'Port X', `${this.id}_port_x`, '', (d, i, n) => this.resource.port_x = n[i].value)
        this.port_x = port_x.input
        this.append(this.networking_tbody, port_x.row)
        // Heatwave
        const heatwave_cluster = this.createDetailsSection('Heatwave Cluster', `${this.id}_heatwave_cluster_details`)
        this.append(this.properties_contents, heatwave_cluster.details)
        this.heatwave_cluster_details = heatwave_cluster.details
        this.heatwave_cluster_div = heatwave_cluster.div
        const heatwave_cluster_table = this.createTable('', `${this.id}_heatwave_cluster_table`)
        this.heatwave_cluster_tbody = heatwave_cluster_table.tbody
        this.append(this.heatwave_cluster_div, heatwave_cluster_table.table)
        // Cluster Size
        const cluster_size_data = {min: 1}
        const cluster_size = this.createInput('number', 'Cluster Size', `${this.id}_cluster_size`, '', (d, i, n) => this.resource.heatwave_cluster.cluster_size = n[i].value, cluster_size_data)
        this.cluster_size = cluster_size.input
        this.append(this.heatwave_cluster_tbody, cluster_size.row)
        // Shape
        const node_shape_name = this.createInput('select', 'Node Shape', `${this.id}_node_shape_name`, '', (d, i, n) => {this.resource.heatwave_cluster.shape_name = n[i].value})
        this.node_shape_name = node_shape_name.input
        this.append(this.heatwave_cluster_tbody, node_shape_name.row)
        // Delete Policy
        const deletion_policy = this.createDetailsSection('Deletion Policy', `${this.id}_deletion_policy_details`)
        this.append(this.properties_contents, deletion_policy.details)
        this.deletion_policy_details = deletion_policy.details
        this.deletion_policy_div = deletion_policy.div
        const deletion_policy_table = this.createTable('', `${this.id}_deletion_policy_table`)
        this.deletion_policy_tbody = deletion_policy_table.tbody
        this.append(this.deletion_policy_div, deletion_policy_table.table)
        // Delete Protected
        const is_delete_protected = this.createInput('checkbox', 'Delete Protected', `${this.id}_is_delete_protected`, '', (d, i, n) => this.resource.deletion_policy.is_delete_protected = n[i].checked)
        this.is_delete_protected = is_delete_protected.input
        this.append(this.deletion_policy_tbody, is_delete_protected.row)
        // Automatic Backup Retention
        const automatic_backup_retention_data = {options: {DELETE: 'Delete', RETAIN: 'Retain'}}
        const automatic_backup_retention = this.createInput('select', 'Automatic Backup Retention', `${this.id}_automatic_backup_retention`, '', (d, i, n) => this.resource.deletion_policy.automatic_backup_retention = n[i].value, automatic_backup_retention_data)
        this.automatic_backup_retention = automatic_backup_retention.input
        this.append(this.deletion_policy_tbody, automatic_backup_retention.row)
        // Final Backup
        const final_backup_data = {options: {REQUIRE_FINAL_BACKUP: 'Require', SKIP_FINAL_BACKUP: 'Skip'}}
        const final_backup = this.createInput('select', 'Final Backup', `${this.id}_final_backup`, '', (d, i, n) => this.resource.deletion_policy.final_backup = n[i].value, final_backup_data)
        this.final_backup = final_backup.input
        this.append(this.deletion_policy_tbody, final_backup.row)
        // Backup Policy
        const backup_policy = this.createDetailsSection('Backup Policy', `${this.id}_backup_policy_details`)
        this.append(this.properties_contents, backup_policy.details)
        this.backup_policy_details = backup_policy.details
        this.backup_policy_div = backup_policy.div
        const backup_policy_table = this.createTable('', `${this.id}_backup_policy_table`)
        this.backup_policy_tbody = backup_policy_table.tbody
        this.append(this.backup_policy_div, backup_policy_table.table)
        // Enabled
        const is_enabled = this.createInput('checkbox', 'Enabled', `${this.id}_is_enabled`, '', (d, i, n) => this.resource.backup_policy.is_enabled = n[i].checked)
        this.is_enabled = is_enabled.input
        this.append(this.backup_policy_tbody, is_enabled.row)
        // PITA
        const pitr_policy_is_enabled = this.createInput('checkbox', 'Point In Time Recovery', `${this.id}_pitr_policy_is_enabled`, '', (d, i, n) => this.resource.backup_policy.pitr_policy.is_enabled = n[i].checked)
        this.pitr_policy_is_enabled = pitr_policy_is_enabled.input
        this.append(this.backup_policy_tbody, pitr_policy_is_enabled.row)
        // Retention in Days
        const retention_in_days_data = {min: 1}
        const retention_in_days = this.createInput('number', 'Retention in Days', `${this.id}_retention_in_days`, '', (d, i, n) => this.resource.backup_policy.retention_in_days = n[i].value, retention_in_days_data)
        this.retention_in_days = retention_in_days.input
        this.append(this.backup_policy_tbody, retention_in_days.row)
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        // Load Select Inputs
        this.loadSelect(this.subnet_id, 'subnet', true)
        this.loadMySQLShapes()
        this.loadMySQLVersions()
        // Assign Values
        this.description.property('value', this.resource.description)
        this.availability_domain.property('value', this.resource.availability_domain)
        this.fault_domain.property('value', this.resource.fault_domain)
        this.shape_name.property('value', this.resource.shape_name)
        this.loadMySQLConfigurations()
        this.configuration_id.property('value', this.resource.configuration_id)
        this.mysql_version.property('value', this.resource.mysql_version)
        this.data_storage_size_in_gb.property('value', this.resource.data_storage_size_in_gb)
        this.admin_username.property('value', this.resource.admin_username)
        this.admin_password.property('value', this.resource.admin_password)
        this.subnet_id.property('value', this.resource.subnet_id)
        this.hostname_label.property('value', this.resource.hostname_label)
        this.port.property('value', this.resource.port)
        this.port_x.property('value', this.resource.port_x)
        // Deletion Policy
        this.automatic_backup_retention.property('value', this.resource.deletion_policy.automatic_backup_retention)
        this.final_backup.property('value', this.resource.deletion_policy.final_backup)
        this.is_delete_protected.property('checked', this.resource.deletion_policy.is_delete_protected)
        // Backup Policy
        this.is_enabled.property('checked', this.resource.backup_policy.is_enabled)
        this.pitr_policy_is_enabled.property('checked', this.resource.backup_policy.pitr_policy.is_enabled)
        this.retention_in_days.property('value', this.resource.backup_policy.retention_in_days)

        // Show reference data
        this.showShapeConfigData()
        this.checkHeatwave()
    }

    checkHeatwave() {
        this.heatwave_cluster_details.classed('hidden', !this.resource.heatwave)
        if (this.resource.heatwave) {
            this.resource.heatwave_cluster = !this.resource.heatwave_cluster ? this.resource.newHeatwaveCluster() : this.resource.heatwave_cluster 
            this.resource.heatwave_cluster.shape_name = this.resource.heatwave_cluster.shape_name !== '' ? this.resource.heatwave_cluster.shape_name : this.resource.shape_name
            this.loadMySQLHeatwaveShapes()
            this.node_shape_name.property('value', this.resource.heatwave_cluster.shape_name)
            this.cluster_size.property('value', this.resource.heatwave_cluster.cluster_size)
        } else {
            this.resource.heatwave_cluster = undefined
        }
    }

    showShapeConfigData() {
        const shape = okitOciData.getMySQLShape(this.resource.shape_name)
        this.cpu_core_count.property('value', shape.cpu_core_count)
        this.memory_size_in_gbs.property('value', shape.memory_size_in_gbs)
        this.resource.is_highly_available = this.resource.configuration_name ? this.resource.configuration_name.endsWith('.HA') : false
        this.is_highly_available.property('checked', this.resource.is_highly_available)
    }

    handleShapeChange(shape_name=undefined) {
        shape_name = shape_name ? shape_name : this.resource.shape_name
        this.loadMySQLConfigurations(shape_name)
        this.showShapeConfigData()
        this.checkHeatwave()
    }

    loadMySQLShapes() {
        const shape_groups = {
            'Heatwave': (ds) => ds.name.includes('MySQL.HeatWave') && ds.is_supported_for.includes('DBSYSTEM'),
            'Standard - AMD E3': (ds) => ds.name.includes('MySQL.VM.Standard.E3') && ds.is_supported_for.includes('DBSYSTEM'),
            'Standard - AMD E4': (ds) => ds.name.includes('MySQL.VM.Standard.E4') && ds.is_supported_for.includes('DBSYSTEM'),
            'Standard - Intel X7': (ds) => ds.name.includes('MySQL.VM.Standard2') && ds.is_supported_for.includes('DBSYSTEM'),
            'Standard - Intel X9': (ds) => ds.name.includes('MySQL.VM.Standard3') && ds.is_supported_for.includes('DBSYSTEM'),
            'Optimised - Intel X9': (ds) => ds.name.includes('MySQL.VM.Optimized3') && ds.is_supported_for.includes('DBSYSTEM'),
        }
        this.loadReferenceSelect(this.shape_name, 'getMySQLShapes', false, undefined, shape_groups, '', 'name', 'name')
        const options = Array.from(this.shape_name.node().options).map((opt) => opt.value)
        this.resource.shape_name = options.includes(this.resource.shape_name) ? this.resource.shape_name : options.length > 0 ? options[0] : ''
    }

    loadMySQLHeatwaveShapes() {
        const filter = (ds) => ds.name.includes('MySQL.HeatWave.VM') && ds.is_supported_for.includes('HEATWAVECLUSTER')
        this.loadReferenceSelect(this.node_shape_name, 'getMySQLShapes', false, filter, undefined, '', 'name', 'name')
        const options = Array.from(this.node_shape_name.node().options).map((opt) => opt.value)
        this.resource.heatwave_cluster.shape_name = options.includes(this.resource.heatwave_cluster.shape_name) ? this.resource.heatwave_cluster.shape_name : options.length > 0 ? options[0] : ''
        // this.node_shape_name.property('value', this.resource.heatwave_cluster.shape_name)
    }

    loadMySQLVersions() {
        this.loadReferenceSelect(this.mysql_version, 'getMySQLVersions', true, undefined, undefined, 'System Default', 'version', 'description')
        const options = Array.from(this.mysql_version.node().options).map((opt) => opt.value)
        this.resource.mysql_version = options.includes(this.resource.mysql_version) ? this.resource.mysql_version : options.length > 0 ? options[0] : ''
    }

    loadMySQLConfigurations(shape_name=undefined) {
        shape_name = shape_name ? shape_name : this.resource.shape_name
        this.loadReferenceSelect(this.configuration_id, 'getMySQLConfigurations', true, (i) => i.shape_name === shape_name)
        const options = Array.from(this.configuration_id.node().options).map((opt) => opt.value)
        this.resource.configuration_id = options.includes(this.resource.configuration_id) ? this.resource.configuration_id : options.length > 0 ? options[0] : ''
    }
}

