/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded DatabaseSystem Properties Javascript');

/*
** Define DatabaseSystem Properties Class
*/
class DatabaseSystemProperties extends OkitResourceProperties {
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
        // Fault Domains
        const fd_data = this.fd_data
        delete fd_data.options['']
        const fault_domains = this.createInput('multiselect', 'Fault Domains', `${this.id}_fault_domains`, '', (d, i, n) => this.resource.fault_domains = Array.from(n[i].querySelectorAll('input[type="checkbox"]:checked')).map((n) => n.value), fd_data)
        this.fault_domains = fault_domains.input
        this.append(this.core_tbody, fault_domains.row)
        // Shape
        const shape_data = {}
        const shape = this.createInput('select', 'Shape', `${this.id}_shape`, '', (d, i, n) => {n[i].reportValidity(); this.resource.shape = n[i].value; this.handleShapeChanged(n[i].value)}, shape_data)
        this.append(this.core_tbody, shape.row)
        this.shape = shape.input
        this.shape_row = shape.row
        // Node Count
        const node_count_data = {options: {1: 1, 2: 2}}
        const node_count = this.createInput('select', 'Node Count', `${this.id}_node_count`, '', (d, i, n) => {this.resource.node_count = n[i].value; this.handleNodeCountChanged()}, node_count_data)
        this.node_count = node_count.input
        this.node_count_row = node_count.row
        this.append(this.core_tbody, node_count.row)
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
        // Hostname
        const hostname_data = this.hostname_data
        const hostname = this.createInput('text', 'Hostname', `${this.id}_hostname`, '', (d, i, n) => {n[i].reportValidity(); this.resource.hostname = n[i].value}, hostname_data)
        this.append(this.networking_tbody, hostname.row)
        this.hostname = hostname.input
        // NSG Lists
        const nsg_ids = this.createInput('multiselect', 'Network Security Groups', `${this.id}_nsg_ids`, '', (d, i, n) => this.resource.nsg_ids = Array.from(n[i].querySelectorAll('input[type="checkbox"]:checked')).map((n) => n.value))
        this.nsg_ids = nsg_ids.input
        this.append(this.networking_tbody, nsg_ids.row)
        // Database
        const database = this.createDetailsSection('Database', `${this.id}_database_details`)
        this.append(this.properties_contents, database.details)
        this.database_div = database.div
        const database_table = this.createTable('', `${this.id}_database`)
        this.database_tbody = database_table.tbody
        this.append(this.database_div, database_table.table)
        // DB Name
        const db_name = this.createInput('text', 'Database Name', `${this.id}_db_name`, '', (d, i, n) => {n[i].reportValidity(); this.resource.db_home.database.db_name = n[i].value})
        this.append(this.database_tbody, db_name.row)
        this.db_name = db_name.input
        // Admin Password
        const admin_password = this.createInput('password', 'Admin Password', `${this.id}_admin_password`, '', (d, i, n) => {n[i].reportValidity(); this.resource.db_home.database.admin_password = n[i].value})
        this.append(this.database_tbody, admin_password.row)
        this.admin_password = admin_password.input
        // Edition
        const database_edition_data = {
            options: {
                STANDARD_EDITION: 'Standard', 
                ENTERPRISE_EDITION: 'Enterprise', 
                ENTERPRISE_EDITION_HIGH_PERFORMANCE: 'High Performance', 
                ENTERPRISE_EDITION_EXTREME_PERFORMANCE: 'Extreme Performance'
            }
        }
        const database_edition = this.createInput('select', 'Database Edition', `${this.id}_database_edition`, '', (d, i, n) => this.resource.database_edition = n[i].value, database_edition_data)
        this.database_edition = database_edition.input
        this.append(this.database_tbody, database_edition.row)
        // Version
        const db_version_data = {}
        const db_version = this.createInput('select', 'Version', `${this.id}_db_version`, '', (d, i, n) => {n[i].reportValidity(); this.resource.db_home.db_version = n[i].value}, db_version_data)
        this.append(this.database_tbody, db_version.row)
        this.db_version = db_version.input
        this.db_version_row = db_version.row
        // Workload
        const db_workload_data = this.db_workload_data
        const db_workload = this.createInput('select', 'Workload', `${this.id}_db_workload`, '', (d, i, n) => this.resource.db_home.database.db_workload = n[i].value, db_workload_data)
        this.db_workload = db_workload.input
        this.append(this.database_tbody, db_workload.row)
        // License Model
        const license_model_data = this.license_model_data
        const license_model = this.createInput('select', 'License Model', `${this.id}_license_model`, '', (d, i, n) => this.resource.license_model = n[i].value, license_model_data)
        this.license_model = license_model.input
        this.append(this.database_tbody, license_model.row)
        // Storage Management
        const storage_management_data = {
            options: {
                ASM: 'Automatic Storage Management', 
                LVM: 'Logical Volume Management'
            }
        }
        const storage_management = this.createInput('select', 'Storage Management', `${this.id}_storage_management`, '', (d, i, n) => this.resource.db_system_options.storage_management = n[i].value, storage_management_data)
        this.storage_management = storage_management.input
        this.append(this.database_tbody, storage_management.row)
        // Storage Percentage
        const data_storage_percentage_data = {min: 0, max: 100}
        const data_storage_percentage = this.createInput('number', 'Storage Percentage', `${this.id}_data_storage_percentage`, '', (d, i, n) => {n[i].reportValidity(); this.resource.data_storage_percentage = n[i].value}, data_storage_percentage_data)
        this.append(this.database_tbody, data_storage_percentage.row)
        this.data_storage_percentage = data_storage_percentage.input
        this.data_storage_percentage_row = data_storage_percentage.row
        // Storage Size
        const data_storage_size_in_gb_data = {}
        const data_storage_size_in_gb = this.createInput('number', 'Size (in GB)', `${this.id}_data_storage_size_in_gb`, '', (d, i, n) => {n[i].reportValidity(); this.resource.data_storage_size_in_gb = n[i].value}, data_storage_size_in_gb_data)
        this.append(this.database_tbody, data_storage_size_in_gb.row)
        this.data_storage_size_in_gb = data_storage_size_in_gb.input
        this.data_storage_size_in_gb_row = data_storage_size_in_gb.row
        // CPU Count
        const cpu_core_count_data = {}
        const cpu_core_count = this.createInput('select', 'CPU Core Count', `${this.id}_cpu_core_count`, '', (d, i, n) => {n[i].reportValidity(); this.resource.cpu_core_count = n[i].value}, cpu_core_count_data)
        this.append(this.database_tbody, cpu_core_count.row)
        this.cpu_core_count = cpu_core_count.input
        this.cpu_core_count_row = cpu_core_count.row
        // Cluster Name
        const cluster_name_data = {}
        const cluster_name = this.createInput('text', 'Cluster Name', `${this.id}_cluster_name`, '', (d, i, n) => {n[i].reportValidity(); this.resource.cluster_name = n[i].value}, cluster_name_data)
        this.append(this.database_tbody, cluster_name.row)
        this.cluster_name = cluster_name.input
        this.cluster_name_row = cluster_name.row
        // SSH Keys
        const ssh_key_details = this.createDetailsSection('SSH Keys', `${this.id}_ssh_key_details`)
        this.append(this.properties_contents, ssh_key_details.details)
        const ssh_key_table = this.createTable('', `${this.id}_ssh_key_properties`)
        this.ssh_key_tbody = ssh_key_table.tbody
        this.append(ssh_key_details.div, ssh_key_table.table)
        // Authorised Keys
        const ssh_public_keys = this.createInput('text', 'Public Keys', `${this.id}_ssh_public_keys`, '', (d, i, n) => this.resource.ssh_public_keys = n[i].value)
        this.ssh_public_keys = ssh_public_keys.input
        this.append(this.ssh_key_tbody, ssh_public_keys.row)
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        // Load Select Inputs
        this.loadSelect(this.subnet_id, 'subnet', true)
        this.loadMultiSelect(this.nsg_ids, 'network_security_group', false, this.nsg_filter)
        this.loadShapes()
        this.loadVersions()
        this.loadCPUCoreCount()
        this.showCollapseShapeRows()
        // Assign Values
        this.availability_domain.property('value', this.resource.availability_domain)
        this.node_count.property('value', this.resource.node_count)
        this.setMultiSelect(this.fault_domains, this.resource.fault_domains)
        this.shape.property('value', this.resource.shape)
        // Networking
        this.setMultiSelect(this.nsg_ids, this.resource.nsg_ids)
        this.subnet_id.property('value', this.resource.subnet_id)
        this.hostname.property('value', this.resource.hostname)
        // Database
        this.db_name.property('value', this.resource.db_home.database.db_name)
        this.admin_password.property('value', this.resource.db_home.database.admin_password)
        this.database_edition.property('value', this.resource.database_edition)
        this.db_version.property('value', this.resource.db_home.db_version)
        this.db_workload.property('value', this.resource.db_home.database.db_workload)
        this.license_model.property('value', this.resource.license_model)
        this.storage_management.property('value', this.resource.db_system_options.storage_management)
        this.data_storage_percentage.property('value', this.resource.data_storage_percentage)
        this.data_storage_size_in_gb.property('value', this.resource.data_storage_size_in_gb)
        this.cpu_core_count.property('value', this.resource.cpu_core_count)
        this.cluster_name.property('value', this.resource.cluster_name)
        // ssh keys
        this.ssh_public_keys.property('value', this.resource.ssh_public_keys)
    }

    handleShapeChanged(shape) {
        shape = shape ? shape : this.resource.shape
        const shape_data = okitOciData.getDBSystemShape(shape)
        this.loadCPUCoreCount(shape)
        // Show / Hide Rows
        this.showCollapseShapeRows(shape)
    }

    handleNodeCountChanged() {
        this.showCollapseShapeRows()
        if (this.resource.node_count === 1) this.resource.cluster_name = ''
    }

    showCollapseShapeRows(shape) {
        shape = shape ? shape : this.resource.shape
        const shape_data = okitOciData.getDBSystemShape(shape)
        const is_vm = shape_data.shape_family === 'VIRTUALMACHINE'
        const is_exadata = shape_data.shape_family === 'EXADATA'
        console.info('Collapse/Show Is VM', is_vm, 'is Exadata', is_exadata, shape_data)
        this.data_storage_percentage_row.classed('collapsed', is_vm)
        this.cpu_core_count_row.classed('collapsed', is_vm)
        this.node_count_row.classed('collapsed', !is_vm || (is_vm && shape_data.maximum_node_count <= 1))
        this.cluster_name_row.classed('collapsed', !is_vm || (is_vm && (shape_data.maximum_node_count <= 1 || this.resource.node_count === 1)))
        if (is_vm && shape_data.maximum_node_count <= 1) {
            this.resource.node_count = 1
            this.resource.cluster_name = null
        } else if (is_exadata) {
            this.cluster_name_row.classed('collapsed', false)
        }
        this.node_count.property('value', this.resource.node_count)
    }

    loadShapes() {
        const shape_groups = {
            'Virtual Machine': (ds) => ds.shape_family === 'VIRTUALMACHINE',
            'Bare Metal': (ds) => ds.shape_family === 'SINGLENODE',
            // 'ExaData': (ds) => ds.shape_family === 'EXADATA',
            // 'ExaCC': (ds) => ds.shape_family === 'EXACC'
        }
        const shape = this.loadReferenceSelect(this.shape, 'getDBSystemShapes', false, undefined, shape_groups)
        if (!this.resource.shape || this.resource.shape === '') this.resource.shape = shape
    }

    loadVersions() {
        const db_version = this.loadReferenceSelect(this.db_version, 'getDBVersions', false, undefined, undefined, '', 'version', 'version')
        if (!this.resource.db_home.db_version || this.resource.db_home.db_version === '') this.resource.db_home.db_version = db_version
    }

    loadCPUCoreCount(shape) {
        shape = shape ? shape : this.resource.shape
        const shape_data = okitOciData.getDBSystemShape(shape)
        let values = [{id: 0, display_name: 'System Default'}]
        for (let i = shape_data.minimum_core_count; i < shape_data.available_core_count; i += shape_data.core_count_increment) values.push({id: i, display_name: i})
        this.loadSelectFromList(this.cpu_core_count, values)
    }
}
