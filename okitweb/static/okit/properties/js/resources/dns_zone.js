/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Dns Zone Properties Javascript');

/*
** Define Dns Zone Properties Class
*/
class DnsZoneProperties extends OkitResourceProperties {
    constructor (resource) {
        const resource_tabs = ['Record Sets']
        super(resource, resource_tabs)
    }

    // Build Additional Resource Specific Properties
    buildResource() {
        // Description
        const description = this.createInput('text', 'Description', `${this.id}_description`, '', (d, i, n) => this.resource.description = n[i].value)
        this.description = description.input
        this.append(this.core_tbody, description.row)
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        // Load Selects
        // Assign Values
        this.description.property('value', this.resource.description)
    }

}
