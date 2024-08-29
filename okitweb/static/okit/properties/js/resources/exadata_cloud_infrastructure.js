/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Cloud Exadata Infrastructure Properties Javascript');

/*
** Define ExadataCloudInfrastructure Properties Class
*/
class ExadataCloudInfrastructureProperties extends OkitResourceProperties {
    constructor (resource) {
        const resource_tabs = ['Cluster']
        super(resource, resource_tabs)
    }

    // Build Additional Resource Specific Properties
    buildResource() {
        // Availability Domain
        const ad_data = this.ad_data
        const ad = this.createInput('select', 'Availability Domain', `${this.id}_availability_domain`, '', (d, i, n) => this.resource.availability_domain = n[i].value, ad_data)
        this.availability_domain = ad.input
        this.append(this.core_tbody, ad.row)
        // Shape
        const shape_data = {}
        const shape = this.createInput('select', 'Shape', `${this.id}_shape`, '', (d, i, n) => {if (n[i].reportValidity()) this.resource.shape = n[i].value; this.handleShapeChanged(n[i].value)}, shape_data)
        this.append(this.core_tbody, shape.row)
        this.shape = shape.input
        this.shape_row = shape.row
        // CPU Count
        const compute_count_data = {min: 2, max: 32}
        const compute_count = this.createInput('number', 'Database Servers', `${this.id}_compute_count`, '', (d, i, n) => {n[i].reportValidity(); this.resource.compute_count = n[i].value}, compute_count_data)
        this.append(this.core_tbody, compute_count.row)
        this.compute_count = compute_count.input
        this.compute_count_row = compute_count.row
        // Storage Count
        const storage_count_data = {min: 3, max: 64}
        const storage_count = this.createInput('number', 'Storage Servers', `${this.id}_storage_count`, '', (d, i, n) => {n[i].reportValidity(); this.resource.storage_count = n[i].value}, storage_count_data)
        this.append(this.core_tbody, storage_count.row)
        this.storage_count = storage_count.input
        this.storage_count_row = storage_count.row
        // Customer Emails

        // Cluster 
        const cluster_details = this.createDetailsSection('Cluster', `${this.id}_cluster_details`)
        this.append(this.cluster_contents, cluster_details.details)
        this.cluster_div = cluster_details.div
        const cluster_table = this.createTable('', `${this.id}_cluster_table`)
        this.cluster_tbody = cluster_table.tbody
        this.append(this.cluster_div, cluster_table.table)
        // Create VM Cluster
        const create_cluster = this.createInput('checkbox', 'Create VM Cluster', `${this.id}_create_cluster`, '', (d, i, n) => this.resource.create_cluster = n[i].checked)
        this.create_cluster = create_cluster.input
        this.append(this.cluster_tbody, create_cluster.row)
        // Cluster Display Name
        const cluster_display_name_data = {}
        const cluster_display_name = this.createInput('text', 'Name', `${this.id}_cluster_display_name`, '', (d, i, n) => {n[i].reportValidity(); this.resource.cluster.display_name = n[i].value}, cluster_display_name_data)
        this.append(this.cluster_tbody, cluster_display_name.row)
        this.cluster_display_name = cluster_display_name.input
        this.cluster_display_name_row = cluster_display_name.row
        // Cluster Name
        const cluster_name_data = {pattern: '^[a-zA-Z][a-zA-Z0-9]{1,10}$', title: 'Only letters and numbers, starting with a letter. 10 characters max.'}
        const cluster_name = this.createInput('text', 'Cluster Name', `${this.id}_cluster_name`, '', (d, i, n) => {n[i].reportValidity(); this.resource.cluster.cluster_name = n[i].value}, cluster_name_data)
        this.append(this.cluster_tbody, cluster_name.row)
        this.cluster_name = cluster_name.input
        this.cluster_name_row = cluster_name.row
        // License Model
        const license_model_data = this.license_model_data
        const license_model = this.createInput('select', 'License Model', `${this.id}_license_model`, '', (d, i, n) => this.resource.cluster.license_model = n[i].value, license_model_data)
        this.license_model = license_model.input
        this.append(this.cluster_tbody, license_model.row)
        // Authorised Keys
        const add_click = () => {
            /*
            ** Add Load File Handling
            */
            $('#files').off('change').on('change', (e) => {
                const files = e.target.files
                let reader = new FileReader()
                reader.onload = (evt) => {
                    this.resource.cluster.ssh_public_keys = evt.target.result
                    this.ssh_public_keys.property('value', this.resource.cluster.ssh_public_keys)
                }
                reader.onerror = (evt) => {console.info('Error: ' + evt.target.error.name)}
                reader.readAsText(files[0])
            });
            $('#files').attr('accept', '.pub')
            // Click Files Element
            let fileinput = document.getElementById("files")
            fileinput.click()
        }
        const ssh_public_keys_data = {}
        const ssh_public_keys = this.createInput('text', 'Public Keys', `${self.id}_ssh_public_keys`, '', (d, i, n) => self.resource.cluster.ssh_public_keys = n[i].value, ssh_public_keys_data, 'add-property', add_click)
        this.ssh_public_keys = ssh_public_keys.input
        this.append(this.cluster_tbody, ssh_public_keys.row)
        // CPU Core Count
        const cpu_core_count_data = {min: 2, max: 32}
        const cpu_core_count = this.createInput('number', 'Compute Count', `${this.id}_cpu_core_count`, '', (d, i, n) => {n[i].reportValidity(); this.resource.cluster.cpu_core_count = n[i].value}, cpu_core_count_data)
        this.append(this.cluster_tbody, cpu_core_count.row)
        this.cpu_core_count = cpu_core_count.input
        this.cpu_core_count_row = cpu_core_count.row
        // GI Version
        const gi_version = this.createInput('select', 'Grid Infrastructure Version', `${this.id}_gi_version`, '', (d, i, n) => this.resource.cluster.gi_version = n[i].value)
        this.append(this.cluster_tbody, gi_version.row)
        this.gi_version = gi_version.input
        // Subnet
        const subnet_id = this.createInput('select', 'Subnet', `${this.id}_subnet_id`, '', (d, i, n) => this.resource.cluster.subnet_id = n[i].value)
        this.append(this.cluster_tbody, subnet_id.row)
        this.subnet_id = subnet_id.input
        // Hostname
        const hostname_data = this.hostname_data
        const hostname = this.createInput('text', 'Hostname', `${this.id}_hostname`, '', (d, i, n) => {if (n[i].reportValidity()) this.resource.cluster.hostname = n[i].value}, hostname_data)
        this.append(this.cluster_tbody, hostname.row)
        this.hostname = hostname.input
        // Domain
        const domain_data = this.domain_data
        const domain = this.createInput('text', 'Domain', `${this.id}_domain`, '', (d, i, n) => {if (n[i].reportValidity()) this.resource.cluster.domain = n[i].value}, domain_data)
        this.append(this.cluster_tbody, domain.row)
        this.domain = domain.input
        // NSG Lists
        const nsg_ids = this.createInput('multiselect', 'Network Security Groups', `${this.id}_nsg_ids`, '', (d, i, n) => this.resource.cluster.nsg_ids = Array.from(n[i].querySelectorAll('input[type="checkbox"]:checked')).map((n) => n.value))
        this.nsg_ids = nsg_ids.input
        this.append(this.cluster_tbody, nsg_ids.row)
        // Backup Subnet
        const backup_subnet_id = this.createInput('select', 'Backup Subnet', `${this.id}_backup_subnet_id`, '', (d, i, n) => this.resource.cluster.backup_subnet_id = n[i].value)
        this.append(this.cluster_tbody, backup_subnet_id.row)
        this.backup_subnet_id = backup_subnet_id.input
        // Backup NSG Lists
        const backup_network_nsg_ids = this.createInput('multiselect', 'Backup Network Security Groups', `${this.id}_backup_network_nsg_ids`, '', (d, i, n) => this.resource.cluster.backup_network_nsg_ids = Array.from(n[i].querySelectorAll('input[type="checkbox"]:checked')).map((n) => n.value))
        this.backup_network_nsg_ids = backup_network_nsg_ids.input
        this.append(this.cluster_tbody, backup_network_nsg_ids.row)
        // OCPU Count
        const ocpu_count_data = {}
        const ocpu_count = this.createInput('number', 'OCPU Count', `${this.id}_ocpu_count`, '', (d, i, n) => {n[i].reportValidity(); this.resource.cluster.ocpu_count = n[i].value}, ocpu_count_data)
        this.append(this.cluster_tbody, ocpu_count.row)
        this.ocpu_count = ocpu_count.input
        this.ocpu_count_row = ocpu_count.row
        // Storage Percentage
        const data_storage_percentage_data = {min: 0, max: 100}
        const data_storage_percentage = this.createInput('number', 'Storage Percentage', `${this.id}_data_storage_percentage`, '', (d, i, n) => {n[i].reportValidity(); this.resource.cluster.data_storage_percentage = n[i].value}, data_storage_percentage_data)
        this.append(this.cluster_tbody, data_storage_percentage.row)
        this.data_storage_percentage = data_storage_percentage.input
        this.data_storage_percentage_row = data_storage_percentage.row
        // Scan Listener Port
        const scan_listener_port_tcp_data = {}
        const scan_listener_port_tcp = this.createInput('number', 'Scan Listener Port', `${this.id}_scan_listener_port_tcp`, '', (d, i, n) => {n[i].reportValidity(); this.resource.cluster.scan_listener_port_tcp = n[i].value}, scan_listener_port_tcp_data)
        this.append(this.cluster_tbody, scan_listener_port_tcp.row)
        this.scan_listener_port_tcp = scan_listener_port_tcp.input
        this.scan_listener_port_tcp_row = scan_listener_port_tcp.row
        // Scan Listener Port SSL
        const scan_listener_port_tcp_ssl_data = {}
        const scan_listener_port_tcp_ssl = this.createInput('number', 'Scan Listener Port SSL', `${this.id}_scan_listener_port_tcp_ssl`, '', (d, i, n) => {n[i].reportValidity(); this.resource.cluster.scan_listener_port_tcp_ssl = n[i].value}, scan_listener_port_tcp_ssl_data)
        this.append(this.cluster_tbody, scan_listener_port_tcp_ssl.row)
        this.scan_listener_port_tcp_ssl = scan_listener_port_tcp_ssl.input
        this.scan_listener_port_tcp_ssl_row = scan_listener_port_tcp_ssl.row
        // Local Backup
        const is_local_backup_enabled = this.createInput('checkbox', 'Local Backup', `${this.id}_is_local_backup_enabled`, '', (d, i, n) => this.resource.cluster.is_local_backup_enabled = n[i].checked)
        this.is_local_backup_enabled = is_local_backup_enabled.input
        this.append(this.cluster_tbody, is_local_backup_enabled.row)
        // Sparse Disk Groups
        const is_sparse_diskgroup_enabled = this.createInput('checkbox', 'Sparse Disk Groups', `${this.id}_is_sparse_diskgroup_enabled`, '', (d, i, n) => this.resource.cluster.is_sparse_diskgroup_enabled = n[i].checked)
        this.is_sparse_diskgroup_enabled = is_sparse_diskgroup_enabled.input
        this.append(this.cluster_tbody, is_sparse_diskgroup_enabled.row)
        // Diagnostic Events
        const is_diagnostics_events_enabled = this.createInput('checkbox', 'Diagnostic Events', `${this.id}_is_diagnostics_events_enabled`, '', (d, i, n) => this.resource.cluster.data_collection_options.is_diagnostics_events_enabled = n[i].checked)
        this.is_diagnostics_events_enabled = is_diagnostics_events_enabled.input
        this.append(this.cluster_tbody, is_diagnostics_events_enabled.row)
        // Health Monitoring
        const is_health_monitoring_enabled = this.createInput('checkbox', 'Incident Logs', `${this.id}_is_health_monitoring_enabled`, '', (d, i, n) => this.resource.cluster.data_collection_options.is_health_monitoring_enabled = n[i].checked)
        this.is_health_monitoring_enabled = is_health_monitoring_enabled.input
        this.append(this.cluster_tbody, is_health_monitoring_enabled.row)
        // Health Monitoring
        const is_incident_logs_enabled = this.createInput('checkbox', 'Health Monitoring', `${this.id}_is_incident_logs_enabled`, '', (d, i, n) => this.resource.cluster.data_collection_options.is_incident_logs_enabled = n[i].checked)
        this.is_incident_logs_enabled = is_incident_logs_enabled.input
        this.append(this.cluster_tbody, is_incident_logs_enabled.row)

    }

    // Load Additional Resource Specific Properties
    loadResource() {
        // Load Selects
        this.loadSelect(this.subnet_id, 'subnet', true)
        this.loadMultiSelect(this.nsg_ids, 'network_security_group', false, this.nsg_filter)
        this.loadSelect(this.backup_subnet_id, 'subnet', true)
        this.loadMultiSelect(this.backup_network_nsg_ids, 'network_security_group', false, this.nsg_filter)
        this.loadShapes()
        this.loadGIVersions()
        // Assign Values
        this.availability_domain.property('value', this.resource.availability_domain)
        this.shape.property('value', this.resource.shape)
        this.compute_count.property('value', this.resource.compute_count)
        this.storage_count.property('value', this.resource.storage_count)
        this.showCollapseShapeRows()
        // Cluster
        this.create_cluster.property('checked', this.resource.create_cluster)
        this.cluster_display_name.property('value', this.resource.cluster.display_name)
        this.cluster_name.property('value', this.resource.cluster.cluster_name)
        this.license_model.property('value', this.resource.cluster.license_model)
        this.ssh_public_keys.property('value', this.resource.cluster.ssh_public_keys)
        this.cpu_core_count.property('value', this.resource.cluster.cpu_core_count)
        this.gi_version.property('value', this.resource.cluster.gi_version)
        // Primary Networking
        this.subnet_id.property('value', this.resource.cluster.subnet_id)
        this.hostname.property('value', this.resource.cluster.hostname)
        this.domain.property('value', this.resource.cluster.domain)
        this.setMultiSelect(this.nsg_ids, this.resource.cluster.nsg_ids)
        // Backup
        this.backup_subnet_id.property('value', this.resource.cluster.backup_subnet_id)
        this.setMultiSelect(this.backup_network_nsg_ids, this.resource.cluster.backup_network_nsg_ids)
        // Configuration
        this.ocpu_count.property('value', this.resource.cluster.ocpu_count)
        this.data_storage_percentage.property('value', this.resource.cluster.data_storage_percentage)
        this.scan_listener_port_tcp.property('value', this.resource.cluster.scan_listener_port_tcp)
        this.scan_listener_port_tcp_ssl.property('value', this.resource.cluster.scan_listener_port_tcp_ssl)
        this.is_local_backup_enabled.property('checked', this.resource.cluster.is_local_backup_enabled)
        this.is_sparse_diskgroup_enabled.property('checked', this.resource.cluster.is_sparse_diskgroup_enabled)
        this.is_diagnostics_events_enabled.property('checked', this.resource.cluster.data_collection_options.is_diagnostics_events_enabled)
        this.is_health_monitoring_enabled.property('checked', this.resource.cluster.data_collection_options.is_health_monitoring_enabled)
        this.is_incident_logs_enabled.property('checked', this.resource.cluster.data_collection_options.is_incident_logs_enabled)
    }

    loadShapes() {
        const shape_groups = {
            // 'Virtual Machine': (ds) => ds.shape_family === 'VIRTUALMACHINE',
            // 'Bare Metal': (ds) => ds.shape_family === 'SINGLENODE',
            'ExaData': (ds) => ds.shape_family === 'EXADATA',
            // 'ExaCC': (ds) => ds.shape_family === 'EXACC'
        }
        const shape = this.loadReferenceSelect(this.shape, 'getDBSystemShapes', false, undefined, shape_groups)
        if (!this.resource.shape || this.resource.shape === '') this.resource.shape = shape
    }

    loadGIVersions(shape) {
        shape = shape ? shape : this.resource.shape
        const gi_versions = okitOciData.getGIVersions(shape)
        console.info('GI versions', gi_versions)
        const version = this.loadReferenceSelect(this.gi_version, 'getGIVersions', false, shape)
        if (!this.resource.cluster.gi_version || this.resource.cluster.gi_version === '') this.resource.cluster.gi_version = version
    }

    handleShapeChanged(shape) {
        shape = shape ? shape : this.resource.shape
        const shape_data = okitOciData.getDBSystemShape(shape)
        // Show / Hide Rows
        this.showCollapseShapeRows(shape)
        this.loadGIVersions(shape)
    }

    showCollapseShapeRows(shape) {
        shape = shape ? shape : this.resource.shape
        const shape_data = okitOciData.getDBSystemShape(shape)
        const is_flex = shape_data.available_core_count === null
        console.info('Collapse/Show Is Flex', is_flex, shape_data)
        this.compute_count_row.classed('collapsed', !is_flex)
        this.storage_count_row.classed('collapsed', !is_flex)
        if (is_flex) {
            this.resource.compute_count = this.resource.compute_count < 2 ? 2 : this.resource.compute_count
            this.resource.storage_count = this.resource.storage_count < 3 ? 3 : this.resource.storage_count
            this.compute_count.property('value', this.resource.compute_count)
            this.storage_count.property('value', this.resource.storage_count)
        } else {
            // this.resource.compute_count = shape_data.minimum_node_count * shape_data.core_count_increment
            this.resource.compute_count = null
            this.resource.storage_count = null
        }
        const core_count = shape_data.available_core_count ? shape_data.available_core_count : shape_data.available_core_count_per_node
        this.cpu_core_count.property('min', shape_data.minimum_core_count)
        this.cpu_core_count.property('max', shape_data.core_count)
        this.cpu_core_count.property('step', shape_data.core_count_increment)
        if (this.resource.cluster.cpu_core_count < shape_data.minimum_core_count) this.resource.cluster.cpu_core_count = shape_data.minimum_core_count
        if (this.resource.cluster.cpu_core_count > shape_data.core_count) this.resource.cluster.cpu_core_count = shape_data.minimum_core_count
        this.cpu_core_count.property('value', this.resource.cluster.cpu_core_count)
    }

}
