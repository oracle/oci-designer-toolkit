/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Instance Configuration Properties Javascript');

/*
** Define Instance Configuration Properties Class
*/
class InstanceConfigurationProperties extends OkitResourceProperties {
    constructor (resource) {
        const resource_tabs = ['Volumes', 'Secondary Networks', 'Cloud Init', 'Agent']
        super(resource, resource_tabs)
    }

    // Build Additional Resource Specific Properties
    buildResource() {
        // Availability Domain
        const ad_data = this.ad_data
        const ad = this.createInput('select', 'Availability Domain', `${this.id}_availability_domain`, '', (d, i, n) => this.resource.instance_details.launch_details.availability_domain = n[i].value, ad_data)
        this.availability_domain = ad.input
        this.append(this.core_tbody, ad.row)
        // Fault Domain
        const fd_data = this.fd_data
        const fd = this.createInput('select', 'Fault Domain', `${this.id}_fault_domain`, '', (d, i, n) => this.resource.instance_details.launch_details.fault_domain = n[i].value, fd_data)
        this.fault_domain = fd.input
        this.append(this.core_tbody, fd.row)
        // Instance Compartment
        const instance_compartment_id = this.createInput('select', 'Compartment For Instances', `${this.id}_instance_compartment_id`, '', (d, i, n) => this.resource.instance_details.launch_details.compartment_id = n[i].value)
        this.instance_compartment_id = instance_compartment_id.input
        this.append(this.core_tbody, instance_compartment_id.row)
        // Image & Shape
        const image_and_shape = this.createDetailsSection('Image and Shape', `${this.id}_image_and_shape_details`)
        this.append(this.properties_contents, image_and_shape.details)
        this.image_and_shape_div = image_and_shape.div
        // Image
        const image = this.createDetailsSection('Image', `${this.id}_image_details`)
        this.append(this.image_and_shape_div, image.details)
        this.image_div = image.div
        const image_table = this.createTable('', `${this.id}_image`)
        this.image_tbody = image_table.tbody
        this.append(this.image_div, image_table.table)
        // Image Source
        const is_data = {options: {platform: 'Platform Images', custom: 'Custom Images'}}
        const image_source = this.createInput('select', 'Image source', `${this.id}_image_source`, '', (d, i, n) => {this.resource.instance_details.launch_details.source_details.image_source = n[i].value; this.handleImageSourceChange(n[i].value)}, is_data)
        this.image_source = image_source.input
        this.append(this.image_tbody, image_source.row)
        // Image OS
        const image_os = this.createInput('select', 'Image OS', `${this.id}_image_os`, '', (d, i, n) => {this.resource.instance_details.launch_details.source_details.os = n[i].value; this.handleImageOSChange(n[i].value)})
        this.image_os = image_os.input
        this.append(this.image_tbody, image_os.row)
        // Image Version
        const image_version = this.createInput('select', 'Image Version', `${this.id}_image_version`, '', (d, i, n) => {this.resource.instance_details.launch_details.source_details.version = n[i].value; this.handleImageOSVersionChange()})
        this.image_version = image_version.input
        this.append(this.image_tbody, image_version.row)
        // Image Id (Custom Image)
        const image_id = this.createInput('select', 'Custom Image', `${this.id}_image_id`, '', (d, i, n) => {this.resource.instance_details.launch_details.source_details.image_id = n[i].value; this.resource.instance_details.launch_details.source_details.image_name = n[i].selectedOptions[0].label})
        this.image_id = image_id.input
        this.image_id_row = image_id.row
        this.append(this.image_tbody, image_id.row)
        // Shape
        const shape_details = this.createDetailsSection('Shape', `${this.id}_shape_details`)
        this.append(this.image_and_shape_div, shape_details.details)
        this.shape_div = shape_details.div
        const shape_table = this.createTable('', `${this.id}_shape`)
        this.shape_tbody = shape_table.tbody
        this.append(this.shape_div, shape_table.table)
        // Instance Type
        const it_data = {options: {vm: 'Virtual Machine', bm: 'Bare Metal'}}
        const instance_type = this.createInput('select', 'Instance Type', `${this.id}_instance_type`, '', (d, i, n) => {this.resource.instance_type = n[i].value; this.handleInstanceTypeChange(n[i].value)}, it_data)
        this.instance_type = instance_type.input
        this.append(this.shape_tbody, instance_type.row)
        // Shape Series
        const ss_data = {options: {amd: 'AMD', intel: 'Intel', arm: 'Ampere'}}
        const shape_series = this.createInput('select', 'Shape Series', `${this.id}_shape_series`, '', (d, i, n) => {this.resource.shape_series = n[i].value; this.handleShapeSeriesChange(n[i].value)}, ss_data)
        this.shape_series = shape_series.input
        this.shape_series_row = shape_series.row
        this.append(this.shape_tbody, shape_series.row)
        // Shape
        const shape = this.createInput('select', 'Shape', `${this.id}_shape`, '', (d, i, n) => {this.resource.instance_details.launch_details.shape = n[i].value; this.handleShapeChange(n[i].value)})
        this.shape = shape.input
        this.append(this.shape_tbody, shape.row)
        // OCPUS
        const ocpus_data = {min: 1, max: 64}
        const ocpus = this.createInput('number', 'OCPUs', `${this.id}_ocpus`, '', (d, i, n) => {this.resource.instance_details.launch_details.shape_config.ocpus = n[i].value; this.handleOcpusChanged(n[i].value)}, ocpus_data)
        this.ocpus = ocpus.input
        this.ocpus_row = ocpus.row
        this.append(this.shape_tbody, ocpus.row)
        // Memory
        const memory_data = {min: 1, max: 16}
        const memory_in_gbs = this.createInput('number', 'Memory (in GB)', `${this.id}_memory_in_gbs`, '', (d, i, n) => this.resource.instance_details.launch_details.shape_config.memory_in_gbs = n[i].value, memory_data)
        this.memory_in_gbs = memory_in_gbs.input
        this.memory_in_gbs_row = memory_in_gbs.row
        this.append(this.shape_tbody, memory_in_gbs.row)
        // Networking
        const primary_network = this.addNetworkHtml(this.properties_contents, this.resource.primary_vnic)
        this.primary_network_display_name = primary_network.display_name
        this.subnet_id = primary_network.subnet_id
        this.hostname_label = primary_network.hostname_label
        this.assign_public_ip = primary_network.assign_public_ip
        this.skip_source_dest_check = primary_network.skip_source_dest_check
        this.nsg_ids = primary_network.nsg_ids
        // Advanced
        const advanced_details = this.createDetailsSection('Advanced', `${this.id}_advanced_details`)
        this.append(this.properties_contents, advanced_details.details)
        const advanced_table = this.createTable('', `${this.id}_advanced_properties`)
        this.advanced_tbody = advanced_table.tbody
        this.append(advanced_details.div, advanced_table.table)
        // Boot Volume Size
        const bv_data = {min: 50, max: 32768}
        const boot_volume_size_in_gbs = this.createInput('number', 'Boot Disk Size (in GB)', `${this.id}_boot_volume_size_in_gbs`, '', (d, i, n) => this.resource.instance_details.launch_details.source_details.boot_volume_size_in_gbs = n[i].value, bv_data)
        this.boot_volume_size_in_gbs = boot_volume_size_in_gbs.input
        this.append(this.advanced_tbody, boot_volume_size_in_gbs.row)
        // Preserve Boot Volume
        const preserve_boot_volume = this.createInput('checkbox', 'Preserve Boot Volume', `${this.id}_preserve_boot_volume`, '', (d, i, n) => this.resource.instance_details.preserve_boot_volume = n[i].checked)
        this.preserve_boot_volume = preserve_boot_volume.input
        this.append(this.advanced_tbody, preserve_boot_volume.row)
        // In Transit Encryption
        const is_pv_encryption_in_transit_enabled = this.createInput('checkbox', 'Use In-Transit Encryption', `${this.id}_is_pv_encryption_in_transit_enabled`, '', (d, i, n) => this.resource.instance_details.is_pv_encryption_in_transit_enabled = n[i].checked)
        this.is_pv_encryption_in_transit_enabled = is_pv_encryption_in_transit_enabled.input
        this.append(this.advanced_tbody, is_pv_encryption_in_transit_enabled.row)
        // SSH Keys
        const ssh_key_details = this.createDetailsSection('SSH Keys', `${this.id}_ssh_key_details`)
        this.append(this.properties_contents, ssh_key_details.details)
        const ssh_key_table = this.createTable('', `${this.id}_ssh_key_properties`)
        this.ssh_key_tbody = ssh_key_table.tbody
        this.append(ssh_key_details.div, ssh_key_table.table)
        // Authorised Keys
        const add_click = () => {
            /*
            ** Add Load File Handling
            */
            $('#files').off('change').on('change', (e) => {
                const files = e.target.files
                let reader = new FileReader()
                reader.onload = (evt) => {
                    this.resource.instance_details.launch_details.metadata.ssh_authorized_keys = evt.target.result
                    this.ssh_authorized_keys.property('value', this.resource.instance_details.launch_details.metadata.ssh_authorized_keys)
                }
                reader.onerror = (evt) => {console.info('Error: ' + evt.target.error.name)}
                reader.readAsText(files[0])
            });
            $('#files').attr('accept', '.pub')
            // Click Files Element
            let fileinput = document.getElementById("files")
            fileinput.click()
        }
        const ssh_authorized_keys_data = {}
        const ssh_authorized_keys = this.createInput('text', 'Authorised Keys', `${this.id}_ssh_authorized_keys`, '', (d, i, n) => this.resource.instance_details.launch_details.metadata.ssh_authorized_keys = n[i].value, ssh_authorized_keys_data, 'add-property', add_click)
        this.ssh_authorized_keys = ssh_authorized_keys.input
        this.append(this.ssh_key_tbody, ssh_authorized_keys.row)
        // Cloud Init Tab
        const ci_data = {placeholder: 'Enter Standard Cloud Init YAML'}
        const cloud_init = this.createTextArea(`${this.id}_cloud_init`, '', (d, i, n) => this.resource.instance_details.launch_details.metadata.user_data = n[i].value, ci_data)
        this.cloud_init = cloud_init.input
        this.append(this.cloud_init_contents, this.cloud_init)
        // Secondary Networks Tab
        const secondary_networks = this.createDetailsSection('Secondary Networks', `${this.id}_secondary_network_details`)
        this.append(this.secondary_networks_contents, secondary_networks.details)
        this.secondary_networks_div = secondary_networks.div
        const secondary_vnics = this.createArrayTable('Networks', `${this.id}_secondary_vnics`, '', () => this.addSecondaryNetwork())
        this.secondary_networks_tbody = secondary_vnics.tbody
        this.append(this.secondary_networks_div, secondary_vnics.table)    
        // Volume Attachments Tab
        const volumes = this.createDetailsSection('Volume Attachments', `${this.id}_volume_details`)
        this.append(this.volumes_contents, volumes.details)
        this.volumes_div = volumes.div
        const vol_attachments = this.createArrayTable('Attachments', `${this.id}_vol_attachments`, '', () => this.addVolumeAttachment())
        this.volumes_tbody = vol_attachments.tbody
        this.append(this.volumes_div, vol_attachments.table)    
        // Agent Tab
        const agent_details = this.createDetailsSection('Oracle Cloud Agent', `${this.id}_agent_details`)
        this.append(this.agent_contents, agent_details.details)
        this.agent_div = agent_details.div
        const agent_props = this.createTable('', `${this.id}_agent_props`, '')
        this.agent_tbody = agent_props.tbody
        this.append(this.agent_div, agent_props.table)    
        // Management Disabled
        const is_management_disabled = this.createInput('checkbox', 'Management Disabled', `${this.id}_is_management_disabled`, '', (d, i, n) => this.resource.instance_details.launch_details.agent_config.is_management_disabled = n[i].checked)
        this.is_management_disabled = is_management_disabled.input
        this.append(this.agent_tbody, is_management_disabled.row)
        // Monitoring Disabled
        const is_monitoring_disabled = this.createInput('checkbox', 'Monitoring Disabled', `${this.id}_is_monitoring_disabled`, '', (d, i, n) => this.resource.instance_details.launch_details.agent_config.is_monitoring_disabled = n[i].checked)
        this.is_monitoring_disabled = is_monitoring_disabled.input
        this.append(this.agent_tbody, is_monitoring_disabled.row)
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        // Load Select Inputs
        this.loadSelect(this.subnet_id, 'subnet', true)
        this.loadSelect(this.instance_compartment_id, 'compartment', true)
        this.loadMultiSelect(this.nsg_ids, 'network_security_group', (r) => r.vcn_id === this.getOkitJson().getSubnet(this.resource.instance_details.subnet_id) ? this.getOkitJson().getSubnet(this.resource.instance_details.subnet_id).vcn_id : '')
        // Assign Values
        this.availability_domain.property('value', this.resource.instance_details.availability_domain)
        this.fault_domain.property('value', this.resource.instance_details.fault_domain)
        this.instance_compartment_id.property('value', this.resource.instance_details.launch_details.compartment_id)
        // Image
        this.image_source.property('value', this.resource.instance_details.launch_details.source_details.image_source)
        this.loadImageOSs(this.resource.instance_details.launch_details.source_details.image_source)
        this.image_os.property('value', this.resource.instance_details.launch_details.source_details.os)
        this.loadImageOSVersions(this.resource.instance_details.launch_details.source_details.os)
        this.image_version.property('value', this.resource.instance_details.launch_details.source_details.version)
        this.loadImageShapes()
        this.loadCustomImages()
        this.image_id.property('value', this.resource.instance_details.launch_details.source_details.image_id)
        // Shape
        this.instance_type.property('value', this.resource.instance_type)
        this.shape_series.property('value', this.resource.chipset)
        this.loadImageShapes()
        this.shape.property('value', this.resource.instance_details.launch_details.shape)
        this.memory_in_gbs.property('value', this.resource.instance_details.launch_details.shape_config.memory_in_gbs)
        this.ocpus.property('value', this.resource.instance_details.launch_details.shape_config.ocpus)
        // Primary Network
        this.primary_network_display_name.property('value', this.resource.primary_vnic.display_name)
        this.subnet_id.property('value', this.resource.primary_vnic.subnet_id)
        this.hostname_label.property('value', this.resource.primary_vnic.hostname_label)
        this.assign_public_ip.property('checked', this.resource.primary_vnic.assign_public_ip)
        this.skip_source_dest_check.property('value', this.resource.primary_vnic.skip_source_dest_check)
        // const cbs = [...document.querySelectorAll(`#${this.nsg_ids.attr('id')} input[type="checkbox"]`)]
        // cbs.forEach((c) => c.checked = this.resource.primary_vnic.nsg_ids.includes(c.value) )
        this.setMultiSelect(this.nsg_ids, this.resource.primary_vnic.nsg_ids)
        // Advanced
        this.boot_volume_size_in_gbs.property('value', this.resource.instance_details.launch_details.source_details.boot_volume_size_in_gbs)
        this.preserve_boot_volume.property('checked', this.resource.instance_details.preserve_boot_volume)
        this.is_pv_encryption_in_transit_enabled.property('checked', this.resource.instance_details.is_pv_encryption_in_transit_enabled)
        // Meta Data
        this.ssh_authorized_keys.property('value', this.resource.instance_details.launch_details.metadata.ssh_authorized_keys)
        this.cloud_init.property('value', this.resource.instance_details.launch_details.metadata.user_data)
        // Agent
        this.is_management_disabled.property('checked', this.resource.instance_details.launch_details.agent_config.is_management_disabled)
        this.is_monitoring_disabled.property('checked', this.resource.instance_details.launch_details.agent_config.is_monitoring_disabled)
        // Secondary Networks
        this.loadSecondaryNetworks()
        // Volume Attachments
        this.loadVolumeAttachments()
        // Collapse where appropriate
        this.image_id_row.classed('collapsed', this.resource.instance_details.launch_details.source_details.image_source !== 'custom')
        this.shape_series_row.classed('collapsed', this.resource.instance_type === 'bm')
        this.memory_in_gbs_row.classed('collapsed', !this.resource.flex_shape)
        this.ocpus_row.classed('collapsed', !this.resource.flex_shape)
    }


    // Add Network HTML
    addNetworkHtml(parent, vnic, id=this.id, idx='') {
        const elements = {}
        // Networking
        const networking = this.createDetailsSection('Networking', `${id}_networking_details`, idx)
        this.append(parent, networking.details)
        elements.networking_div = networking.div
        const networking_table = this.createTable('', `${id}_networking$`, idx)
        elements.networking_tbody = networking_table.tbody
        this.append(elements.networking_div, networking_table.table)
        // Name
        const display_name = this.createInput('text', 'Name', `${this.id}_display_name`, '', (d, i, n) => vnic.display_name = n[i].value)
        elements.display_name = display_name.input
        this.append(elements.networking_tbody, display_name.row)
        // Subnet
        const subnet = this.createInput('select', 'Subnet', `${id}_subnet_id`, idx, (d, i, n) => vnic.subnet_id = n[i].value)
        elements.subnet_id = subnet.input
        this.append(elements.networking_tbody, subnet.row)
        // Hostname Label
        const hostname_data = this.hostname_data
        const hostname = this.createInput('text', 'Hostname', `${id}_hostname_label`, idx, (d, i, n) => {n[i].reportValidity(); vnic.hostname_label = n[i].value}, hostname_data)
        elements.hostname_label = hostname.input
        this.append(elements.networking_tbody, hostname.row)
        // Public IP
        const assign_public_ip = this.createInput('checkbox', 'Assign Public IP', `${id}_assign_public_ip`, idx, (d, i, n) => vnic.assign_public_ip = n[i].checked)
        elements.assign_public_ip = assign_public_ip.input
        this.append(elements.networking_tbody, assign_public_ip.row)
        // Skip Source / Destination Check
        const skip_source_dest_check = this.createInput('checkbox', 'Skip Source / Destination Check', `${id}_skip_source_dest_check`, idx, (d, i, n) => vnic.skip_source_dest_check = n[i].checked)
        elements.skip_source_dest_check = skip_source_dest_check.input
        this.append(elements.networking_tbody, skip_source_dest_check.row)
        // NSG Lists
        const nsg = this.createInput('multiselect', 'Network Security Groups', `${id}_nsg_ids`, idx, (d, i, n) => vnic.nsg_ids = Array.from(n[i].querySelectorAll('input[type="checkbox"]:checked')).map((n) => n.value))
        elements.nsg_ids = nsg.input
        this.append(elements.networking_tbody, nsg.row)
        return elements
    }

    // Handlers
    handleImageSourceChange(source=undefined) {
        source = source ? source : this.resource.instance_details.launch_details.source_details.image_source
        this.image_id_row.classed('collapsed', source !== 'custom')
        this.loadImageOSs(source)
        this.handleImageOSChange(undefined, source)
    }

    handleImageOSChange(os=undefined, source=undefined) {
        os = os ? os : this.resource.instance_details.launch_details.source_details.os
        source = source ? source : this.resource.instance_details.launch_details.source_details.image_source
        this.loadImageOSVersions(os, source)
        this.handleImageOSVersionChange()
    }

    handleImageOSVersionChange() {
        this.loadImageShapes()
        this.loadCustomImages()
    }

    handleInstanceTypeChange(instance_type=undefined) {
        instance_type = instance_type ? instance_type : this.resource.instance_type
        this.shape_series_row.classed('collapsed', instance_type === 'bm')
        this.loadImageShapes(instance_type)
    }

    handleShapeSeriesChange(shape_series=undefined) {
        shape_series = shape_series ? shape_series : this.resource.shape_series
        this.loadImageShapes(undefined, shape_series)
    }

    handleShapeChange(shape=undefined) {
        shape = shape ? shape : this.resource.instance_details.launch_details.shape
        this.memory_in_gbs_row.classed('collapsed', !this.resource.flex_shape)
        this.ocpus_row.classed('collapsed', !this.resource.flex_shape)
        this.loadOCPUs(shape)
        this.loadMemoryInGbp(shape)
    }

    handleOcpusChanged(ocpus=undefined) {
        this.loadMemoryInGbp()
    }

    // Load Selects
    loadImageOSs(source=undefined) {
        source = source ? source : this.resource.instance_details.launch_details.source_details.image_source
        this.loadReferenceSelect(this.image_os, source === 'custom' ? 'getCustomImageOSs' : 'getPlatformImageOSs')
        const options = Array.from(this.image_os.node().options).map((opt) => opt.value)
        this.resource.instance_details.launch_details.source_details.os = options.includes(this.resource.instance_details.launch_details.source_details.os) ? this.resource.instance_details.launch_details.source_details.os : options.length > 0 ? options[0] : ''
        this.image_os.property('value', this.resource.instance_details.launch_details.source_details.os)
        // this.loadImageOSVersions(this.resource.instance_details.launch_details.source_details.os, source)
    }

    loadImageOSVersions(os=undefined, source=undefined) {
        os = os ? os : this.resource.instance_details.launch_details.source_details.os
        source = source ? source : this.resource.instance_details.launch_details.source_details.image_source
        this.loadReferenceSelect(this.image_version, source === 'custom' ? 'getCustomImageOSVersions' : 'getPlatformImageOSVersions', false, (i) => i.operating_system === os)
        const options = Array.from(this.image_version.node().options).map((opt) => opt.value)
        this.resource.instance_details.launch_details.source_details.version = options.includes(this.resource.instance_details.launch_details.source_details.version) ? this.resource.instance_details.launch_details.source_details.version : options.length > 0 ? options[0] : ''
        this.image_version.property('value', this.resource.instance_details.launch_details.source_details.version)
    }

    loadImageShapes(instance_type=undefined, chipset=undefined) {
        instance_type = instance_type ? instance_type : this.resource.instance_type
        chipset = chipset ? chipset : this.resource.chipset
        this.loadReferenceSelect(this.shape, instance_type === 'bm' ? 'getBareMetalInstanceShapes' : chipset === 'amd' ? 'getAMDInstanceShapes' : chipset === 'arm' ? 'getARMInstanceShapes' : 'getIntelInstanceShapes')
        const options = Array.from(this.shape.node().options).map((opt) => opt.value)
        this.resource.instance_details.launch_details.shape = options.includes(this.resource.instance_details.launch_details.shape) ? this.resource.instance_details.launch_details.shape : options.length > 0 ? options[0] : ''
        this.shape.property('value', this.resource.instance_details.launch_details.shape)
    }

    loadCustomImages(os=undefined, version=undefined) {
        os = os ? os : this.resource.instance_details.launch_details.source_details.os
        version = version ? version : this.resource.instance_details.launch_details.source_details.version
        this.loadReferenceSelect(this.image_id, 'getCustomImages', false, (i) => i.operating_system === os && i.operating_system_version === version)
        const options = Array.from(this.image_id.node().options).map((opt) => opt.value)
        this.resource.instance_details.launch_details.source_details.image_id =  options.includes(this.resource.instance_details.launch_details.source_details.image_id) ? this.resource.instance_details.launch_details.source_details.image_id : options.length > 0 ? options[0] : ''
        this.image_id.property('value', this.resource.instance_details.launch_details.source_details.image_id)
        if (this.resource.instance_details.launch_details.source_details.image_source === 'custom') this.resource.instance_details.launch_details.source_details.image_name =  this.image_id.node().selectedOptions[0].label
        else delete this.resource.instance_details.launch_details.source_details.image_name
    }

    // Load Custom Data

    loadOCPUs(shape=undefined) {
        shape = shape ? shape : this.resource.instance_details.launch_details.shape
        if (this.resource.flex_shape) {
            const instance_shape = okitOciData.getInstanceShape(shape)
            if (instance_shape && instance_shape.memory_options && instance_shape.ocpu_options) {
                this.ocpus.attr('min', instance_shape.ocpu_options.min)
                this.ocpus.attr('max', instance_shape.ocpu_options.max)
                this.resource.instance_details.launch_details.shape_config.ocpus = this.resource.instance_details.launch_details.shape_config.ocpus > instance_shape.ocpu_options.min ? this.resource.instance_details.launch_details.shape_config.ocpus : instance_shape.ocpus
            } else {
                this.resource.instance_details.launch_details.shape_config.ocpus = 0
            }
        } else {
            this.resource.instance_details.launch_details.shape_config.ocpus = ''
        }
        this.ocpus.property('value', this.resource.instance_details.launch_details.shape_config.ocpus)
    }

    loadMemoryInGbp(shape=undefined) {
        shape = shape ? shape : this.resource.instance_details.launch_details.shape
        if (this.resource.flex_shape) {
            const instance_shape = okitOciData.getInstanceShape(shape)
            if (instance_shape && instance_shape.memory_options && instance_shape.ocpu_options) {
                const min = Math.max(instance_shape.memory_options.min_in_g_bs, (instance_shape.memory_options.min_per_ocpu_in_gbs * this.resource.instance_details.launch_details.shape_config.ocpus));
                const max = Math.min(instance_shape.memory_options.max_in_g_bs, (instance_shape.memory_options.max_per_ocpu_in_gbs * this.resource.instance_details.launch_details.shape_config.ocpus));
                this.memory_in_gbs.attr('min', min)
                this.memory_in_gbs.attr('max', max)
                this.resource.instance_details.launch_details.shape_config.memory_in_gbs = this.resource.instance_details.launch_details.shape_config.memory_in_gbs > min ? this.resource.instance_details.launch_details.shape_config.memory_in_gbs : min
            } else {
                this.resource.instance_details.launch_details.shape_config.memory_in_gbs = 0
            }
        } else {
            this.resource.instance_details.launch_details.shape_config.memory_in_gbs = ''
        }
        this.memory_in_gbs.property('value', this.resource.instance_details.launch_details.shape_config.memory_in_gbs)
    }

    // Secondary Networks

    loadSecondaryNetworks() {
        this.secondary_networks_tbody.selectAll('*').remove()
        this.resource.instance_details.secondary_vnics.forEach((e, i) => {if (i > 0) this.addSecondaryNetworkHtml(e, i+1)})
        this.secondary_vnics_idx = this.resource.instance_details.secondary_vnics.length
    }
    addSecondaryNetwork() {
        if (this.resource.instance_details.secondary_vnics.length === 0) {
            const vnic = this.resource.newSecondayVnicAttachment();
            this.resource.instance_details.secondary_vnics.push(vnic);
            this.secondary_vnics_idx += 1
            this.addSecondaryNetworkHtml(vnic, this.secondary_vnics_idx)
        } else {
            alert('Only a single secondary vnic is allowed.')
        }
    }
    addSecondaryNetworkHtml(vnic, idx) {
        const id = 'vnic';
        const delete_row = this.createDeleteRow(id, idx, () => this.deleteSecondaryNetwork(id, idx, vnic))
        this.append(this.secondary_networks_tbody, delete_row.row)
        const secondary_network = this.addNetworkHtml(delete_row.div, vnic, id, idx)
        // Load Selects
        this.loadSelect(secondary_network.subnet_id, 'subnet', true)
        this.loadMultiSelect(secondary_network.nsg_ids, 'network_security_group', (r) => r.vcn_id === this.getOkitJson().getSubnet(vnic.subnet_id) ? this.getOkitJson().getSubnet(vnic.subnet_id).vcn_id : '')
        // Assign Values
        secondary_network.display_name.property('value', vnic.display_name)
        secondary_network.subnet_id.property('value', vnic.subnet_id)
        secondary_network.hostname_label.property('value', vnic.hostname_label)
        secondary_network.assign_public_ip.property('checked', vnic.assign_public_ip)
        secondary_network.skip_source_dest_check.property('value', vnic.skip_source_dest_check)
        return secondary_network
    }
    deleteSecondaryNetwork(id, idx, vnic) {
        this.resource.instance_details.secondary_vnics = this.resource.instance_details.secondary_vnics.filter((e) => e !== vnic)
        $(`#${this.trId(id, idx)}`).remove()
    }

    // Block Storage Volumes

    loadVolumeAttachments() {
        this.volumes_tbody.selectAll('*').remove()
        this.resource.instance_details.block_volumes.forEach((e, i) => {this.addVolumeAttachmentHtml(e, i+1)})
        this.volumes_idx = this.resource.instance_details.block_volumes.length
    }
    addVolumeAttachment() {
        const attachment = this.resource.newVolumeAttachment()
        this.resource.instance_details.block_volumes.push(attachment)
        this.volumes_idx += 1
        this.addVolumeAttachmentHtml(attachment, this.volumes_idx)
    }
    addVolumeAttachmentHtml(attachment, idx) {
        const id = `${this.id}_attachment`
        const delete_row = this.createDeleteRow(id, idx, () => this.deleteVolumeAttachment(id, idx, attachment))
        this.append(this.volumes_tbody, delete_row.row)
        const attachment_details = this.createDetailsSection('Volume', `${id}_details`, idx)
        this.append(delete_row.div, attachment_details.details)
        const attachment_table = this.createTable('', `${id}_table`, '')
        this.append(attachment_details.div, attachment_table.table)
        // Name
        const display_name = this.createInput('text', 'Name', `${this.id}_display_name`, '', (d, i, n) => attachment.attach_details.display_name = n[i].value)
        this.append(attachment_table.tbody, display_name.row)
        display_name.input.property('value', attachment.attach_details.display_name)
        // Volume Id
        const volume = this.createInput('select', 'Volume', `${id}_volume_id`, idx, (d, i, n) => {attachment.volume_id = n[i].value})
        this.append(attachment_table.tbody, volume.row)
        this.loadSelect(volume.input, 'block_storage_volume', true)
        volume.input.property('value', attachment.volume_id)
        // Attachment Type
        const type = this.createInput('select', 'Attachment Type', `${id}_type`, idx, (d, i, n) => {attachment.attach_details.type = n[i].value})
        this.append(attachment_table.tbody, type.row)
        this.loadAttachmentTypeSelect(type.input)
        type.input.property('value', attachment.attach_details.type)
        // Read Only
        const read_only = this.createInput('checkbox', 'Read Only', `${id}_is_read_only`, idx, (d, i, n) => attachment.attach_details.is_read_only = n[i].checked)
        this.append(attachment_table.tbody, read_only.row)
        read_only.input.property('checked', attachment.attach_details.is_read_only)
        // Shareable
        const shareable = this.createInput('checkbox', 'Shareable', `${id}_is_shareable`, idx, (d, i, n) => attachment.attach_details.is_shareable = n[i].checked)
        this.append(attachment_table.tbody, shareable.row)
        shareable.input.property('checked', attachment.attach_details.is_shareable)
    }
    deleteVolumeAttachment(id, idx, attachment) {
        this.resource.instance_details.block_volumes = this.resource.instance_details.block_volumes.filter((e) => e !== attachment)
        $(`#${this.trId(id, idx)}`).remove()
    }
    loadAttachmentTypeSelect(select) {
        const types_map = new Map([ // Map to Terraform Local Variable Names
            ['Paravirtualized', 'paravirtualized'],
            ['ISCSI', 'iscsi'],
        ]);
        this.loadSelectFromMap(select, types_map)
    }
}
