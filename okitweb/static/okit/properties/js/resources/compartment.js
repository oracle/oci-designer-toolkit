/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Compartment Properties Javascript');

/*
** Define Compartment Properties Class
*/
class CompartmentProperties extends OkitResourceProperties {
    constructor (resource) {
        const resource_tabs = []
        super(resource, resource_tabs)
    }

    // Build Additional Resource Specific Properties
    buildResource() {
        const self = this
        // Description
        const description = this.createInput('text', 'Description', `${self.id}_description`, '', (d, i, n) => self.resource.description = n[i].value)
        this.description = description.input
        this.append(this.core_tbody, description.row)
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        this.description.property('value', this.resource.description)
    }
}
