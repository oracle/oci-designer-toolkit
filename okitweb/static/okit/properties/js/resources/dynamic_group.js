/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Dynamic Group Properties Javascript');

/*
** Define Dynamic Group Properties Class
*/
class DynamicGroupProperties extends OkitResourceProperties {
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
        // Matching Rule
        const matching_rule = this.createInput('text', 'Matching Rule', `${self.id}_matching_rule`, '', (d, i, n) => self.resource.matching_rule = n[i].value)
        this.matching_rule = matching_rule.input
        this.append(this.core_tbody, matching_rule.row)
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        this.description.property('value', this.resource.description)
        this.matching_rule.property('value', this.resource.matching_rule)
    }
}
