/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Vault Properties Javascript');

/*
** Define Vault Properties Class
*/
class VaultProperties extends OkitResourceProperties {
    constructor (resource) {
        const resource_tabs = []
        super(resource, resource_tabs)
    }

    // Build Additional Resource Specific Properties
    buildResource() {
        // Private
        const vault_type = this.createInput('checkbox', 'Virtual Private Vault', `${this.id}_vault_type`, '', (d, i, n) => {this.resource.vault_type = n[i].checked ? 'VIRTUAL_PRIVATE' : 'DEFAULT'})
        this.vault_type = vault_type.input
        this.append(this.core_tbody, vault_type.row)
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        // Load Selects
        // Assign Values
        this.vault_type.property('checked', this.resource.vault_type === 'VIRTUAL_PRIVATE')
    }

}
