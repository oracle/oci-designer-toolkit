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
        const resource_tabs = ['Volumes', 'Secondary Networks', 'Cloud Init', 'Agent']
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
        const shape = this.createInput('select', 'Shape', `${self.id}_shape`, '', (d, i, n) => {self.resource.source_details.shape = n[i].value = n[i].value})
        this.shape = shape.input
        this.append(this.shape_tbody, shape.row)
        // Memory
        const memory_in_gbs = this.createInput('number', 'Memory (in GB)', `${self.id}_memory_in_gbs`, '', (d, i, n) => self.resource.shape_config.memory_in_gbs = n[i].value, {min: 1, max: 16})
        this.memory_in_gbs = memory_in_gbs.input
        this.append(this.shape_tbody, memory_in_gbs.row)
        // OCPUS
        const ocpus = this.createInput('number', 'OCPUs', `${self.id}_ocpus`, '', (d, i, n) => self.resource.shape_config.ocpus = n[i].value, {min: 1, max: 64})
        this.ocpus = ocpus.input
        this.append(this.shape_tbody, ocpus.row)
        // Networking
        // const networking = this.createDetailsSection('Networking', `${self.id}_networking_details`)
        // this.append(this.properties_contents, networking.details)
        // this.networking_div = networking.div
        // const networking_table = this.createTable('', `${self.id}_networking`)
        // this.networking_tbody = networking_table.tbody
        // this.append(this.networking_div, networking_table.table)
        // // Subnet
        // const subnet = this.createInput('select', 'Subnet', `${self.id}_subnet_id`, '', (d, i, n) => self.resource.primary_vnic.subnet_id = n[i].value)
        // this.subnet_id = subnet.input
        // this.append(this.networking_tbody, subnet.row)
        // // Hostname Label
        // const hostname_data = this.hostname_data
        // const hostname = this.createInput('text', 'Hostname', `${self.id}_hostname_label`, '', (d, i, n) => {n[i].reportValidity(); self.resource.primary_vnic.hostname_label = n[i].value}, hostname_data)
        // this.hostname_label = hostname.input
        // this.append(this.networking_tbody, hostname.row)
        // // Public IP
        // const assign_public_ip = this.createInput('checkbox', 'Assign Public IP', `${self.id}_assign_public_ip`, '', (d, i, n) => self.resource.assign_public_ip = n[i].checked)
        // this.assign_public_ip = assign_public_ip.input
        // this.append(this.networking_tbody, assign_public_ip.row)
        // // Skip Source / Destination Check
        // const skip_source_dest_check = this.createInput('checkbox', 'Skip Source / Destination Check', `${self.id}_skip_source_dest_check`, '', (d, i, n) => self.resource.skip_source_dest_check = n[i].checked)
        // this.skip_source_dest_check = skip_source_dest_check.input
        // this.append(this.networking_tbody, skip_source_dest_check.row)
        // // NSG Lists
        // const nsg = this.createInput('multiselect', 'Network Security Groups', `${self.id}_nsg_ids`, '', (d, i, n) => self.resource.nsg_ids = Array.from(n[i].querySelectorAll('input[type="checkbox"]:checked')).map((n) => n.value))
        // this.nsg_ids = nsg.input
        // this.append(this.networking_tbody, nsg.row)
        const primary_network = this.addNetworkHtml(this.properties_contents)
        this.subnet_id = primary_network.subnet_id
        this.hostname_label = primary_network.hostname_label
        this.assign_public_ip = primary_network.assign_public_ip
        this.skip_source_dest_check = primary_network.skip_source_dest_check
        this.nsg_ids = primary_network.nsg_ids
        // Advanced
        const advanced_details = this.createDetailsSection('Advanced', `${self.id}_advanced_details`)
        this.append(this.properties_contents, advanced_details.details)
        const advanced_table = this.createTable('', `${self.id}_advanced_properties`)
        this.advanced_tbody = advanced_table.tbody
        this.append(advanced_details.div, advanced_table.table)
        // Boot Volume Size
        const bv_data = {min: 50, max: 32768}
        const boot_volume_size_in_gbs = this.createInput('number', 'Boot Disk Size (in GB)', `${self.id}_boot_volume_size_in_gbs`, '', (d, i, n) => self.resource.source_details.boot_volume_size_in_gbs = n[i].value, bv_data)
        this.boot_volume_size_in_gbs = boot_volume_size_in_gbs.input
        this.append(this.advanced_tbody, boot_volume_size_in_gbs.row)
        // Preserve Boot Volume
        const preserve_boot_volume = this.createInput('checkbox', 'Preserve Boot Volume', `${self.id}_preserve_boot_volume`, '', (d, i, n) => self.resource.preserve_boot_volume = n[i].checked)
        this.preserve_boot_volume = preserve_boot_volume.input
        this.append(this.advanced_tbody, preserve_boot_volume.row)
        // In Transit Encryption
        const is_pv_encryption_in_transit_enabled = this.createInput('checkbox', 'Use In-Transit Encryption', `${self.id}_is_pv_encryption_in_transit_enabled`, '', (d, i, n) => self.resource.is_pv_encryption_in_transit_enabled = n[i].checked)
        this.is_pv_encryption_in_transit_enabled = is_pv_encryption_in_transit_enabled.input
        this.append(this.advanced_tbody, is_pv_encryption_in_transit_enabled.row)
        // Cloud Init Tab
        const ci_data = {placeholder: 'Enter Standard Cloud Init YAML'}
        const cloud_init = this.createTextArea(`${self.id}_cloud_init`, '', (d, i, n) => self.resource.metadata.user_data = n[i].value, ci_data)
        this.cloud_init = cloud_init.input
        this.append(this.cloud_init_contents, this.cloud_init)
        // Secondary Networks Tab
        const secondary_networks = this.createDetailsSection('Secondary Networks', `${self.id}_secondary_network_details`)
        this.append(this.secondary_networks_contents, secondary_networks.details)
        this.secondary_networks_div = secondary_networks.div
        const secondary_vnics = this.createArrayTable('Network', `${self.id}_secondary_vnics`, '', () => self.addSecondaryNetwork())
        this.secondary_networks_tbody = secondary_vnics.tbody
        this.append(this.secondary_networks_div, secondary_vnics.table)    
        // Volume Attachments Tab
        const volumes = this.createDetailsSection('Volume Attachments', `${self.id}_volume_details`)
        this.append(this.volumes_contents, volumes.details)
        this.volumes_div = volumes.div
        const vol_attachments = this.createArrayTable('Volume', `${self.id}_vol_attachments`, '', () => self.addVolumeAttachment())
        this.volumes_tbody = vol_attachments.tbody
        this.append(this.volumes_div, vol_attachments.table)    
        // Agent Tab
        const agent_details = this.createDetailsSection('Oracle Cloud Agent', `${self.id}_agent_details`)
        this.append(this.agent_contents, agent_details.details)
        this.agent_div = agent_details.div
        const agent_props = this.createTable('', `${self.id}_agent_props`, '')
        this.agent_tbody = agent_props.tbody
        this.append(this.agent_div, agent_props.table)    
        // Management Disabled
        const is_management_disabled = this.createInput('checkbox', 'Management Agent', `${self.id}_is_management_disabled`, '', (d, i, n) => self.resource.agent_config.is_management_disabled = !n[i].checked)
        this.is_management_disabled = is_management_disabled.input
        this.append(this.agent_tbody, is_management_disabled.row)
        // Monitoring Disabled
        const is_monitoring_disabled = this.createInput('checkbox', 'Compute Instance Monitoring', `${self.id}_is_monitoring_disabled`, '', (d, i, n) => self.resource.agent_config.is_monitoring_disabled = !n[i].checked)
        this.is_monitoring_disabled = is_monitoring_disabled.input
        this.append(this.agent_tbody, is_monitoring_disabled.row)
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        // Load Select Inputs
        this.loadSelect(this.subnet_id, 'subnet', true)
        // Assign Values
        this.availability_domain.property('value', this.resource.availability_domain)
        this.fault_domain.property('value', this.resource.fault_domain)
    }

    // Add Network HTML
    addNetworkHtml(parent, idx='') {
        const elements = {}
        // Networking
        const networking = this.createDetailsSection('Networking', `${self.id}_networking_details`, idx)
        this.append(parent, networking.details)
        elements.networking_div = networking.div
        const networking_table = this.createTable('', `${self.id}_networking$`, idx)
        elements.networking_tbody = networking_table.tbody
        this.append(elements.networking_div, networking_table.table)
        // Subnet
        const subnet = this.createInput('select', 'Subnet', `${self.id}_subnet_id`, idx, (d, i, n) => self.resource.primary_vnic.subnet_id = n[i].value)
        elements.subnet_id = subnet.input
        this.append(elements.networking_tbody, subnet.row)
        // Hostname Label
        const hostname_data = this.hostname_data
        const hostname = this.createInput('text', 'Hostname', `${self.id}_hostname_label`, idx, (d, i, n) => {n[i].reportValidity(); self.resource.primary_vnic.hostname_label = n[i].value}, hostname_data)
        elements.hostname_label = hostname.input
        this.append(elements.networking_tbody, hostname.row)
        // Public IP
        const assign_public_ip = this.createInput('checkbox', 'Assign Public IP', `${self.id}_assign_public_ip`, idx, (d, i, n) => self.resource.assign_public_ip = n[i].checked)
        elements.assign_public_ip = assign_public_ip.input
        this.append(elements.networking_tbody, assign_public_ip.row)
        // Skip Source / Destination Check
        const skip_source_dest_check = this.createInput('checkbox', 'Skip Source / Destination Check', `${self.id}_skip_source_dest_check`, idx, (d, i, n) => self.resource.skip_source_dest_check = n[i].checked)
        elements.skip_source_dest_check = skip_source_dest_check.input
        this.append(elements.networking_tbody, skip_source_dest_check.row)
        // NSG Lists
        const nsg = this.createInput('multiselect', 'Network Security Groups', `${self.id}_nsg_ids`, idx, (d, i, n) => self.resource.nsg_ids = Array.from(n[i].querySelectorAll('input[type="checkbox"]:checked')).map((n) => n.value))
        elements.nsg_ids = nsg.input
        this.append(elements.networking_tbody, nsg.row)
        return elements
    }
}
