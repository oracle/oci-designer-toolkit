/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Instance Pool Properties Javascript');

/*
** Define Instance Pool Properties Class
*/
class InstancePoolProperties extends OkitResourceProperties {
    constructor (resource) {
        const resource_tabs = []
        super(resource, resource_tabs)
    }

    // Build Additional Resource Specific Properties
    buildResource() {
        // Instance Configuration
        const instance_configuration_id = this.createInput('select', 'Instance Configuration', `${this.id}_instance_configuration_id`, '', (d, i, n) => this.resource.instance_configuration_id = n[i].value)
        this.instance_configuration_id = instance_configuration_id.input
        this.append(this.core_tbody, instance_configuration_id.row)
        // Boot Volume Size
        const size_data = {min: 0}
        const size = this.createInput('number', 'Pool Size', `${this.id}_size`, '', (d, i, n) => this.resource.size = n[i].value, size_data)
        this.size = size.input
        this.append(this.core_tbody, size.row)
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        // Load Selects
        this.loadSelect(this.instance_configuration_id, 'instance_configuration', false)
        // Assign Values
        this.instance_configuration_id.property('value', this.resource.instance_configuration_id)
        this.size.property('value', this.resource.size)
    }

}
