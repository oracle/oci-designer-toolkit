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
        const is_data = {options: {platform: 'Platform Images', custom: 'Custom Images'}}
        const image_source = this.createInput('select', 'Image source', `${self.id}_image_source`, '', (d, i, n) => {self.resource.source_details.image_source = n[i].value = n[i].value; this.loadImageOSs(n[i].value)}, is_data)
        this.image_source = image_source.input
        this.append(this.image_tbody, image_source.row)
        // Image OS
        const image_os = this.createInput('select', 'Image OS', `${self.id}_image_os`, '', (d, i, n) => {self.resource.source_details.os = n[i].value = n[i].value})
        this.image_os = image_os.input
        this.append(this.image_tbody, image_os.row)
        // Image Version
        const image_version = this.createInput('select', 'Image Version', `${self.id}_image_version`, '', (d, i, n) => {self.resource.source_details.version = n[i].value = n[i].value; this.loadImageOSVersions(n[i].value)})
        this.image_version = image_version.input
        this.append(this.image_tbody, image_version.row)
        // Image Id (Custom Image)
        const image_id = this.createInput('select', 'Custom Image', `${self.id}_image_id`, '', (d, i, n) => {self.resource.source_details.image_id = n[i].value = n[i].value})
        this.image_id = image_id.input
        this.image_id_row = image_id.row
        this.append(this.image_tbody, image_id.row)
        // Shape
        const shape_details = this.createDetailsSection('Shape', `${self.id}_shape_details`)
        this.append(this.image_and_shape_div, shape_details.details)
        this.shape_div = shape_details.div
        const shape_table = this.createTable('', `${self.id}_shape`)
        this.shape_tbody = shape_table.tbody
        this.append(this.shape_div, shape_table.table)
        // Instance Type
        const it_data = {options: {vm: 'Virtual Machine', bm: 'Bare Metal'}}
        const instance_type = this.createInput('select', 'Instance Type', `${self.id}_instance_type`, '', (d, i, n) => {self.resource.source_details.instance_type = n[i].value = n[i].value; this.handleInstanceTypeChange()}, it_data)
        this.instance_type = instance_type.input
        this.append(this.shape_tbody, instance_type.row)
        // Shape Series
        const ss_data = {options: {amd: 'AMD', intel: 'Intel', arm: 'Ampere'}}
        const shape_series = this.createInput('select', 'Shape Series', `${self.id}_shape_series`, '', (d, i, n) => {self.resource.source_details.shape_series = n[i].value = n[i].value; this.handleShapeSeriesChange()}, ss_data)
        this.shape_series = shape_series.input
        this.append(this.shape_tbody, shape_series.row)
        // Shape
        const shape = this.createInput('select', 'Shape', `${self.id}_shape`, '', (d, i, n) => {self.resource.source_details.shape = n[i].value = n[i].value; this.loadOCPUs(n[i].value)})
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
        const primary_network = this.addNetworkHtml(this.properties_contents, self.resource.primary_vnic)
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
        // SSH Keys
        const ssh_key_details = this.createDetailsSection('SSH Keys', `${self.id}_ssh_key_details`)
        this.append(this.properties_contents, ssh_key_details.details)
        const ssh_key_table = this.createTable('', `${self.id}_ssh_key_properties`)
        this.ssh_key_tbody = ssh_key_table.tbody
        this.append(ssh_key_details.div, ssh_key_table.table)
        // Authorised Keys
        const ssh_authorized_keys = this.createInput('text', 'Authorised Keys', `${self.id}_ssh_authorized_keys`, '', (d, i, n) => self.resource.metadata.ssh_authorized_keys = n[i].value)
        this.ssh_authorized_keys = ssh_authorized_keys.input
        this.append(this.ssh_key_tbody, ssh_authorized_keys.row)
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
        const is_management_disabled = this.createInput('checkbox', 'Management Disabled', `${self.id}_is_management_disabled`, '', (d, i, n) => self.resource.agent_config.is_management_disabled = n[i].checked)
        this.is_management_disabled = is_management_disabled.input
        this.append(this.agent_tbody, is_management_disabled.row)
        // Monitoring Disabled
        const is_monitoring_disabled = this.createInput('checkbox', 'Monitoring Disabled', `${self.id}_is_monitoring_disabled`, '', (d, i, n) => self.resource.agent_config.is_monitoring_disabled = n[i].checked)
        this.is_monitoring_disabled = is_monitoring_disabled.input
        this.append(this.agent_tbody, is_monitoring_disabled.row)
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        // Load Select Inputs
        this.loadSelect(this.subnet_id, 'subnet', true)
        this.loadMultiSelect(this.nsg_ids, 'network_security_group', (r) => r.vcn_id === this.getOkitJson().getSubnet(this.resource.subnet_id) ? this.getOkitJson().getSubnet(this.resource.subnet_id).vcn_id : '')
        // Assign Values
        this.availability_domain.property('value', this.resource.availability_domain)
        this.fault_domain.property('value', this.resource.fault_domain)
        // Image
        this.image_source.property('value', this.resource.source_details.image_source)
        this.loadImageOSs(this.resource.source_details.image_source)
        this.image_os.property('value', this.resource.source_details.os)
        this.loadImageOSVersions(this.resource.source_details.os)
        this.image_version.property('value', this.resource.source_details.version)
        this.loadImageShapes()
        this.loadCustomImages()
        this.image_id.property('value', this.resource.source_details.image_id)
        // Shape
        this.instance_type.property('value', this.resource.instance_type)
        this.handleInstanceTypeChange()
        this.shape_series.property('value', this.resource.chipset)
        this.handleShapeSeriesChange()
        this.shape.property('value', this.resource.shape)
        this.memory_in_gbs.property('value', this.resource.shape_config.memory_in_gbs)
        this.ocpus.property('value', this.resource.shape_config.ocpus)
        // Primary Network
        this.subnet_id.property('value', this.resource.primary_vnic.subnet_id)
        this.hostname_label.property('value', this.resource.primary_vnic.hostname_label)
        this.assign_public_ip.property('checked', this.resource.primary_vnic.assign_public_ip)
        this.skip_source_dest_check.property('value', this.resource.primary_vnic.skip_source_dest_check)
        // const cbs = [...document.querySelectorAll(`#${this.nsg_ids.attr('id')} input[type="checkbox"]`)]
        // cbs.forEach((c) => c.checked = this.resource.primary_vnic.nsg_ids.includes(c.value) )
        this.setMultiSelect(this.nsg_ids, this.resource.primary_vnic.nsg_ids)
        // Advanced
        this.boot_volume_size_in_gbs.property('value', this.resource.source_details.boot_volume_size_in_gbs)
        this.preserve_boot_volume.property('checked', this.resource.preserve_boot_volume)
        this.is_pv_encryption_in_transit_enabled.property('checked', this.resource.is_pv_encryption_in_transit_enabled)
        // Meta Data
        this.ssh_authorized_keys.property('value', this.resource.metadata.ssh_authorized_keys)
        this.cloud_init.property('value', this.resource.metadata.user_data)
        // Agent
        this.is_management_disabled.property('checked', this.resource.agent_config.is_management_disabled)
        this.is_monitoring_disabled.property('checked', this.resource.agent_config.is_monitoring_disabled)
    }

    // Add Network HTML
    addNetworkHtml(parent, vnic, idx='') {
        const elements = {}
        // Networking
        const networking = this.createDetailsSection('Networking', `${self.id}_networking_details`, idx)
        this.append(parent, networking.details)
        elements.networking_div = networking.div
        const networking_table = this.createTable('', `${self.id}_networking$`, idx)
        elements.networking_tbody = networking_table.tbody
        this.append(elements.networking_div, networking_table.table)
        // Subnet
        const subnet = this.createInput('select', 'Subnet', `${self.id}_subnet_id`, idx, (d, i, n) => vnic.subnet_id = n[i].value)
        elements.subnet_id = subnet.input
        this.append(elements.networking_tbody, subnet.row)
        // Hostname Label
        const hostname_data = this.hostname_data
        const hostname = this.createInput('text', 'Hostname', `${self.id}_hostname_label`, idx, (d, i, n) => {n[i].reportValidity(); vnic.hostname_label = n[i].value}, hostname_data)
        elements.hostname_label = hostname.input
        this.append(elements.networking_tbody, hostname.row)
        // Public IP
        const assign_public_ip = this.createInput('checkbox', 'Assign Public IP', `${self.id}_assign_public_ip`, idx, (d, i, n) => vnic.assign_public_ip = n[i].checked)
        elements.assign_public_ip = assign_public_ip.input
        this.append(elements.networking_tbody, assign_public_ip.row)
        // Skip Source / Destination Check
        const skip_source_dest_check = this.createInput('checkbox', 'Skip Source / Destination Check', `${self.id}_skip_source_dest_check`, idx, (d, i, n) => vnic.skip_source_dest_check = n[i].checked)
        elements.skip_source_dest_check = skip_source_dest_check.input
        this.append(elements.networking_tbody, skip_source_dest_check.row)
        // NSG Lists
        const nsg = this.createInput('multiselect', 'Network Security Groups', `${self.id}_nsg_ids`, idx, (d, i, n) => vnic.nsg_ids = Array.from(n[i].querySelectorAll('input[type="checkbox"]:checked')).map((n) => n.value))
        elements.nsg_ids = nsg.input
        this.append(elements.networking_tbody, nsg.row)
        return elements
    }

    // Load Selects
    loadImageOSs(source=undefined) {
        source = source ? source : this.resource.source_details.image_source
        console.info(`Loading Images For ${source}`)
        this.loadReferenceSelect(this.image_os, source === 'custom' ? 'getCustomImageOSs' : 'getPlatformImageOSs')
        const options = Array.from(this.image_os.node().options).map((opt) => opt.value)
        this.resource.source_details.os = options.includes(this.resource.source_details.os) ? this.resource.source_details.os : options.length > 0 ? options[0] : ''
        this.image_os.property('value', this.resource.source_details.os)
        this.loadImageOSVersions(this.resource.source_details.os, source)
    }

    loadImageOSVersions(os=undefined, source=undefined) {
        os = os ? os : this.resource.source_details.os
        source = source ? source : this.resource.source_details.image_source
        console.info(`Loading Image Versions For ${source} - ${os}`)
        this.loadReferenceSelect(this.image_version, source === 'custom' ? 'getCustomImageOSVersions' : 'getPlatformImageOSVersions', false, (i) => i.operating_system === os)
        const options = Array.from(this.image_version.node().options).map((opt) => opt.value)
        this.resource.source_details.version = options.includes(this.resource.source_details.version) ? this.resource.source_details.version : options.length > 0 ? options[0] : ''
        this.image_version.property('value', this.resource.source_details.version)
    }

    loadImageShapes(instance_type=undefined, chipset=undefined) {
        instance_type = instance_type ? instance_type : this.resource.instance_type
        chipset = chipset ? chipset : this.resource.chipset
        this.loadReferenceSelect(this.shape, instance_type === 'bm' ? 'getBareMetalInstanceShapes' : chipset === 'amd' ? 'getAMDInstanceShapes' : chipset === 'arm' ? 'getARMInstanceShapes' : 'getIntelInstanceShapes')
        const options = Array.from(this.shape.node().options).map((opt) => opt.value)
        this.resource.shape = options.includes(this.resource.shape) ? this.resource.shape : options.length ? options[0] > 0 : ''
        this.shape.property('value', this.resource.shape)
    }

    loadCustomImages() {}

    loadOCPUs(shape=undefined) {}

    handleInstanceTypeChange(instance_type=undefined) {}

    handleShapeSeriesChange(shape_series=undefined) {}
}
