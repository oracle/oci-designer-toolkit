/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Instance Properties Javascript');

/*
** Define Instance Properties Class
*/
class InstanceProperties extends OkitResourceProperties {
    constructor (resource) {
        const resource_tabs = ['Volumes', 'Secondary Networks', 'Cloud Init']
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
        // Fault Domain
        const fd_data = this.fd_data
        const fd = this.createInput('select', 'Fault Domain', `${self.id}_availability_domain`, '', (d, i, n) => self.resource.fault_domain = n[i].value, fd_data)
        this.fault_domain = fd.input
        this.append(this.core_tbody, fd.row)
        // Image & Shape
        const image_and_shape = this.createDetailsSection('Image and Shape', `${self.id}_image_and_shape_details`)
        this.append(this.properties_contents, image_and_shape.details)
        this.image_and_shape_div = image_and_shape.div
        // Image
        const image = this.createDetailsSection('Image', `${self.id}_image_details`)
        this.append(this.image_and_shape_div, image.details)
        this.image_div = image.div
        const image_table = this.createTable('', `${self.id}_image`)
        this.image_tbody = image_table.tbody
        this.append(this.image_div, image_table.table)
        // Image Source
        const image_source = this.createInput('select', 'Image source', `${self.id}_image_source`, '', (d, i, n) => {self.resource.source_details.image_source = n[i].value = n[i].value}, {options: {platform: 'Platform Images', custom: 'Custom Images'}})
        this.image_source = image_source.input
        this.append(this.image_tbody, image_source.row)
        // Image OS
        const image_os = this.createInput('select', 'Image OS', `${self.id}_image_os`, '', (d, i, n) => {self.resource.source_details.os = n[i].value = n[i].value})
        this.image_os = image_os.input
        this.append(this.image_tbody, image_os.row)
        // Image Version
        const image_version = this.createInput('select', 'Image Version', `${self.id}_image_version`, '', (d, i, n) => {self.resource.source_details.version = n[i].value = n[i].value})
        this.image_version = image_version.input
        this.append(this.image_tbody, image_version.row)
        // Shape
        const shape_details = this.createDetailsSection('Shape', `${self.id}_shape_details`)
        this.append(this.image_and_shape_div, shape_details.details)
        this.shape_div = shape_details.div
        const shape_table = this.createTable('', `${self.id}_shape`)
        this.shape_tbody = shape_table.tbody
        this.append(this.shape_div, shape_table.table)
        // Instance Type
        const instance_type = this.createInput('select', 'Instance Type', `${self.id}_instance_type`, '', (d, i, n) => {self.resource.source_details.instance_type = n[i].value = n[i].value}, {options: {vm: 'Virtual Machine', bm: 'Bare Metal'}})
        this.instance_type = instance_type.input
        this.append(this.shape_tbody, instance_type.row)
        // Shape Series
        const shape_series = this.createInput('select', 'Shape Series', `${self.id}_shape_series`, '', (d, i, n) => {self.resource.source_details.shape_series = n[i].value = n[i].value}, {options: {amd: 'AMD', intel: 'Intel', arm: 'Ampere'}})
        this.shape_series = shape_series.input
        this.append(this.shape_tbody, shape_series.row)
        // Shape
        const shape = this.createInput('select', 'Shape Series', `${self.id}_shape`, '', (d, i, n) => {self.resource.source_details.shape = n[i].value = n[i].value})
        this.shape = shape.input
        this.append(this.shape_tbody, shape.row)
        // Memory
        const memory_in_gbs = this.createInput('number', 'Memory (in GB)', `${self.id}_memory_in_gbs`, '', (d, i, n) => self.resource.shape_config.memory_in_gbs = n[i].value, {min: 1, max: 16})
        this.memory_in_gbs = memory_in_gbs.input
        this.append(this.shape_tbody, memory_in_gbs.row)
        // OCPUS
        const ocpus = this.createInput('number', 'Memory (in GB)', `${self.id}_ocpus`, '', (d, i, n) => self.resource.shape_config.ocpus = n[i].value, {min: 1, max: 64})
        this.ocpus = ocpus.input
        this.append(this.shape_tbody, ocpus.row)
        // Networking
        const networking = this.createDetailsSection('Networking', `${self.id}_networking_details`)
        this.append(this.properties_contents, networking.details)
        this.networking_div = networking.div
        const networking_table = this.createTable('', `${self.id}_networking`)
        this.networking_tbody = networking_table.tbody
        this.append(this.networking_div, networking_table.table)
        // Subnet
        const subnet = this.createInput('select', 'Subnet', `${self.id}_subnet_id`, '', (d, i, n) => self.resource.primary_vnic.subnet_id = n[i].value)
        this.subnet_id = subnet.input
        this.append(this.networking_tbody, subnet.row)
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        this.availability_domain.property('value', this.resource.availability_domain)
        this.fault_domain.property('value', this.resource.fault_domain)
    }
}
