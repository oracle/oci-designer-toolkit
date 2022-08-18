/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
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
        const configuration_id = this.createInput('select', 'Configuration', `${this.id}_configuration_id`, '', (d, i, n) => {this.resource.configuration_id = n[i].value})
        this.configuration_id = configuration_id.input
        this.append(this.shape_and_config_tbody, configuration_id.row)
        // Version
        const mysql_version = this.createInput('select', 'Version', `${this.id}_mysql_version`, '', (d, i, n) => {this.resource.mysql_version = n[i].value})
        this.mysql_version = mysql_version.input
        this.append(this.shape_and_config_tbody, mysql_version.row)
        // Size
        const data_storage_size_in_gb = this.createInput('number', 'Size (in GB)', `${this.id}_data_storage_size_in_gb`, '', (d, i, n) => this.resource.data_storage_size_in_gb = n[i].value)
        this.data_storage_size_in_gb = data_storage_size_in_gb.input
        this.append(this.shape_and_config_tbody, data_storage_size_in_gb.row)
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
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        // Load Select Inputs
        this.loadSelect(this.subnet_id, 'subnet', true)
        // this.loadReferenceSelect(this.shape_name, 'getMySQLShapes', false, undefined, undefined, '', 'name', 'name')
        // this.loadReferenceSelect(this.mysql_version, 'getMySQLVersions', true, undefined, undefined, 'System Default', 'version', 'description')
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
    }

    handleShapeChange(shape_name=undefined) {
        shape_name = shape_name ? shape_name : this.resource.shape_name
        this.loadMySQLConfigurations(shape_name)
    }

    loadMySQLShapes() {
        this.loadReferenceSelect(this.shape_name, 'getMySQLShapes', false, undefined, undefined, '', 'name', 'name')
        const options = Array.from(this.shape_name.node().options).map((opt) => opt.value)
        this.resource.shape_name = options.includes(this.resource.shape_name) ? this.resource.shape_name : options.length > 0 ? options[0] : ''
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

