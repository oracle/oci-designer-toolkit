/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded OracleDigitalAssistant Properties Javascript');

/*
** Define OracleDigitalAssistant Properties Class
*/
class OracleDigitalAssistantProperties extends OkitResourceProperties {
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
        // Shape Name
        const shape_name = this.createInput('select', 'Shape', `${this.id}_shape_name`, '', (d, i, n) => this.resource.shape_name = n[i].value)
        this.shape_name = shape_name.input
        this.append(this.core_tbody, shape_name.row)
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        // Load Selects
        this.loadShapeNameSelect(this.shape_name)
        // Assign Values
        this.description.property('value', this.resource.description)
        this.shape_name.property('value', this.resource.shape_name)
    }

    loadShapeNameSelect(select) {
        const options_map = new Map([
            ['Development', 'DEVELOPMENT'],
            ['Production', 'PRODUCTION'],
        ]);
        this.loadSelectFromMap(select, options_map)
    }
}
