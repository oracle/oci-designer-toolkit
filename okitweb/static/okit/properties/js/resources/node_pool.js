/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Node Pool Properties Javascript');

/*
** Define Node Pool Properties Class
*/
class NodePoolProperties extends OkitResourceProperties {
    constructor (resource) {
        const resource_tabs = []
        super(resource, resource_tabs)
    }

    // Build Additional Resource Specific Properties
    buildResource() {
        // Kubernetes Version
        const kubernetes_version = this.createInput('select', 'Kubernetes Version', `${this.id}_kubernetes_version`, '', (d, i, n) => this.resource.kubernetes_version = n[i].value)
        this.kubernetes_version = kubernetes_version.input
        this.append(this.core_tbody, kubernetes_version.row)
        // Image & Shape
        const shape_and_image = this.createDetailsSection('Shape and Image', `${this.id}_shape_and_image_details`)
        this.append(this.properties_contents, shape_and_image.details)
        this.shape_and_image_div = shape_and_image.div
        const shape_and_image_table = this.createTable('', `${this.id}_shape_and_image_table`)
        this.shape_and_image_tbody = shape_and_image_table.tbody
        this.append(this.shape_and_image_div, shape_and_image_table.table)
        // Shape
        const node_shape = this.createInput('select', 'Shape', `${this.id}_node_shape`, '', (d, i, n) => {this.resource.node_shape = n[i].value; this.handleShapeChange(n[i].value)})
        this.node_shape = node_shape.input
        this.append(this.shape_and_image_tbody, node_shape.row)
        // OCPUS
        const ocpus_data = {min: 1, max: 64}
        const ocpus = this.createInput('number', 'OCPUs', `${this.id}_ocpus`, '', (d, i, n) => {this.resource.node_shape_config.ocpus = n[i].value; this.handleOcpusChanged(n[i].value)}, ocpus_data)
        this.ocpus = ocpus.input
        this.ocpus_row = ocpus.row
        this.append(this.shape_and_image_tbody, ocpus.row)
        // Memory
        const memory_data = {min: 1, max: 16}
        const memory_in_gbs = this.createInput('number', 'Memory (in GB)', `${this.id}_memory_in_gbs`, '', (d, i, n) => this.resource.node_shape_config.memory_in_gbs = n[i].value, memory_data)
        this.memory_in_gbs = memory_in_gbs.input
        this.memory_in_gbs_row = memory_in_gbs.row
        this.append(this.shape_and_image_tbody, memory_in_gbs.row)
        // Image Id (Custom Image)
        const image_id = this.createInput('select', 'Image', `${this.id}_image_id`, '', (d, i, n) => {this.resource.node_source_details.image_id = n[i].value; this.resource.node_source_details.image = n[i].selectedOptions[0].text;})
        this.image_id = image_id.input
        this.image_id_row = image_id.row
        this.append(this.shape_and_image_tbody, image_id.row)
        // Node Config
        const node_config = this.createDetailsSection('Advanced', `${this.id}_node_config_details`)
        this.append(this.properties_contents, node_config.details)
        this.node_config_div = node_config.div
        const node_config_table = this.createTable('', `${this.id}_node_config_table`)
        this.node_config_tbody = node_config_table.tbody
        this.append(this.node_config_div, node_config_table.table)
        // Size
        const size_data = {min: 3}
        const size = this.createInput('number', 'Size', `${this.id}_size`, '', (d, i, n) => this.resource.node_config_details.size = n[i].value, size_data)
        this.size = size.input
        this.size_row = size.row
        this.append(this.node_config_tbody, size.row)
        // NSG Lists
        const nsg_ids = this.createInput('multiselect', 'Network Security Groups', `${this.id}_nsg_ids`, '', (d, i, n) => this.resource.node_config_details.nsg_ids = Array.from(n[i].querySelectorAll('input[type="checkbox"]:checked')).map((n) => n.value))
        this.nsg_ids = nsg_ids.input
        this.append(this.node_config_tbody, nsg_ids.row)
        // Placement
        const placement_configs_details = this.createDetailsSection('Placement Configs', `${self.id}_placement_configs_details`)
        this.append(this.properties_contents, placement_configs_details.details)
        this.placement_configs_div = placement_configs_details.div
        const placement_configs_table = this.createArrayTable('Rules', `${self.id}_placement_configs_table`, '', () => self.addPlacementConfig())
        this.placement_configs_tbody = placement_configs_table.tbody
        this.append(placement_configs_details.div, placement_configs_table.table)
    }

    nsg_filter = (r) => r.vcn_id === this.resource.vcn_id
    // Load Additional Resource Specific Properties
    loadResource() {
        // Load Selects
        this.loadReferenceSelect(this.kubernetes_version, 'getKubernetesVersions', true)
        this.loadReferenceSelect(this.node_shape, 'getAllInstanceShapes', false)
        this.loadReferenceSelect(this.image_id, 'getPlatformImages', false, (r) => r.operating_system === 'Oracle Linux' && r.shapes.includes(this.resource.node_shape), undefined, '', 'display_name')
        this.loadMultiSelect(this.nsg_ids, 'network_security_group', false, this.nsg_filter)
        // Assign Values
        this.kubernetes_version.property('value', this.resource.kubernetes_version)
        // Shape
        this.node_shape.property('value', this.resource.node_shape)
        this.memory_in_gbs.property('value', this.resource.node_shape_config.memory_in_gbs)
        this.ocpus.property('value', this.resource.node_shape_config.ocpus)
        if (this.resource.node_source_details.image_id === '') {
            this.resource.node_source_details.image_id = okitOciData.getPlatformImages((r) => r.operating_system === 'Oracle Linux' && r.shapes.includes(this.resource.node_shape))[0].display_name 
            this.resource.node_source_details.image = this.resource.node_source_details.image_id
        }
        this.image_id.property('value', this.resource.node_source_details.image_id)
        // Advanced
        this.size.property('value', this.resource.node_config_details.size)
        this.setMultiSelect(this.nsg_ids, this.resource.node_config_details.nsg_ids)
        // Collapse where appropriate
        this.memory_in_gbs_row.classed('collapsed', !this.resource.flex_shape)
        this.ocpus_row.classed('collapsed', !this.resource.flex_shape)
        this.handleShapeChange()
    }

    // Placement Config
    loadPlacementConfigs() {
        this.placement_configs_tbody.selectAll('*').remove()
        this.resource.node_config_details.placement_configs.forEach((e, i) => this.addPlacementConfigHtml(e, i+1))
        this.placement_configs_idx = this.resource.node_config_details.placement_configs.length;
    }
    addPlacementConfig() {
        const placement_config = this.resource.newPlacementConfig();
        this.resource.node_config_details.placement_configs.push(placement_config);
        this.placement_config_idx += 1
        this.addPlacementConfigHtml(placement_config, this.placement_config_idx);
    }
    deletePlacementConfig(id, idx, placement_config) {
        this.resource.node_config_details.placement_configs = this.resource.node_config_details.placement_configs.filter((e) => e !== placement_config)
        $(`#${id}${idx}_row`).remove()
    }
    addPlacementConfigHtml(config, idx) {
        const id = `${this.id}_config`
        const delete_row = this.createDeleteRow(id, idx, () => this.deletePlacementConfig(id, idx, config))
        this.append(this.placement_configs_tbody, delete_row.row)
        const config_details = this.createDetailsSection('Config', `${id}_config_details`, idx)
        this.append(delete_row.div, config_details.details)
        const config_table = this.createTable('', `${id}_config_table`, '')
        this.append(config_details.div, config_table.table)
    }

    handleShapeChange(shape=undefined) {
        shape = shape ? shape : this.resource.node_shape
        this.memory_in_gbs_row.classed('collapsed', !this.resource.flex_shape)
        this.ocpus_row.classed('collapsed', !this.resource.flex_shape)
        this.loadOCPUs(shape)
        this.loadMemoryInGbp(shape)
        this.loadReferenceSelect(this.image_id, 'getPlatformImages', false, (r) => r.operating_system === 'Oracle Linux' && r.shapes.includes(shape), undefined, '', 'display_name')
    }

    handleOcpusChanged(ocpus=undefined) {
        this.loadMemoryInGbp()
    }

    loadOCPUs(shape=undefined) {
        shape = shape ? shape : this.resource.shape
        if (this.resource.flex_shape) {
            const instance_shape = okitOciData.getInstanceShape(shape)
            if (instance_shape && instance_shape.memory_options && instance_shape.ocpu_options) {
                this.ocpus.attr('min', instance_shape.ocpu_options.min)
                this.ocpus.attr('max', instance_shape.ocpu_options.max)
                this.resource.node_shape_config.ocpus = this.resource.node_shape_config.ocpus > instance_shape.ocpu_options.min ? this.resource.node_shape_config.ocpus : instance_shape.ocpus
            } else {
                this.resource.node_shape_config.ocpus = 0
            }
        } else {
            this.resource.node_shape_config.ocpus = ''
        }
        this.ocpus.property('value', this.resource.node_shape_config.ocpus)
    }

    loadMemoryInGbp(shape=undefined) {
        shape = shape ? shape : this.resource.shape
        if (this.resource.flex_shape) {
            const instance_shape = okitOciData.getInstanceShape(shape)
            if (instance_shape && instance_shape.memory_options && instance_shape.ocpu_options) {
                const min = Math.max(instance_shape.memory_options.min_in_g_bs, (instance_shape.memory_options.min_per_ocpu_in_gbs * this.resource.node_shape_config.ocpus));
                const max = Math.min(instance_shape.memory_options.max_in_g_bs, (instance_shape.memory_options.max_per_ocpu_in_gbs * this.resource.node_shape_config.ocpus));
                this.memory_in_gbs.attr('min', min)
                this.memory_in_gbs.attr('max', max)
                this.resource.node_shape_config.memory_in_gbs = this.resource.node_shape_config.memory_in_gbs > min ? this.resource.node_shape_config.memory_in_gbs : min
            } else {
                this.resource.node_shape_config.memory_in_gbs = 0
            }
        } else {
            this.resource.node_shape_config.memory_in_gbs = ''
        }
        this.memory_in_gbs.property('value', this.resource.node_shape_config.memory_in_gbs)
    }

}
