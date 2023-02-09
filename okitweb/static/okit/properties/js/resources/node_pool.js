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
        const shape_and_image = this.createDetailsSection('Shape and Image', `${self.id}_shape_and_image_details`)
        this.append(this.properties_contents, shape_and_image.details)
        this.shape_and_image_div = shape_and_image.div
        const shape_and_image_table = this.createTable('', `${self.id}_image`)
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
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        // Load Selects
        this.loadReferenceSelect(this.node_shape, 'getAllInstanceShapes', true)
        this.loadReferenceSelect(this.kubernetes_version, 'getKubernetesVersions', true)
        // Assign Values
        this.kubernetes_version.property('value', this.resource.kubernetes_version)
        // Shape
        this.node_shape.property('value', this.resource.node_shape)
        this.memory_in_gbs.property('value', this.resource.node_shape_config.memory_in_gbs)
        this.ocpus.property('value', this.resource.node_shape_config.ocpus)
        // Collapse where appropriate
        this.memory_in_gbs_row.classed('collapsed', !this.resource.flex_shape)
        this.ocpus_row.classed('collapsed', !this.resource.flex_shape)
    }

    handleShapeChange(shape=undefined) {
        shape = shape ? shape : this.resource.node_shape
        this.memory_in_gbs_row.classed('collapsed', !this.resource.flex_shape)
        this.ocpus_row.classed('collapsed', !this.resource.flex_shape)
        this.loadOCPUs(shape)
        this.loadMemoryInGbp(shape)
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
