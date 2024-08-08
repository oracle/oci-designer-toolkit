/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Vault Secret Properties Javascript');

/*
** Define Vault Secret Properties Class
*/
class VaultSecretProperties extends OkitResourceProperties {
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
        // Vault
        const vault_id = this.createInput('select', 'Vault', `${this.id}_vault_id`, '', (d, i, n) => {this.resource.vault_id = n[i].value; this.redraw()})
        this.vault_id = vault_id.input
        this.append(this.core_tbody, vault_id.row)
        // Key
        const key_id = this.createInput('select', 'Encryption Key', `${this.id}_key_id`, '', (d, i, n) => {this.resource.key_id = n[i].value; this.redraw()})
        this.key_id = key_id.input
        this.append(this.core_tbody, key_id.row)
        // Contenet Type
        const content_type_data = {options: {BASE64: 'Base 64'}}
        const content_type = this.createInput('select', 'Content type', `${this.id}_content_type`, '', (d, i, n) => this.resource.secret_content.content_type = n[i].value, content_type_data)
        this.content_type = content_type.input
        this.append(this.core_tbody, content_type.row)
        // Content
        const content_data = this.variable_only_data
        const content = this.createInput('text', 'Content', `${this.id}_content`, '', (d, i, n) => this.resource.secret_content.content = n[i].value, content_data)
        this.content = content.input
        this.append(this.core_tbody, content.row)
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        // Load Selects
        this.loadSelect(this.vault_id, 'vault', true)
        this.loadSelect(this.key_id, 'key', false, this.vault_filter)
        // Assign Values
        this.description.property('value', this.resource.description)
        this.vault_id.property('value', this.resource.vault_id)
        this.key_id.property('value', this.resource.key_id)
        this.content_type.property('value', this.resource.secret_content.content_type)
        this.content.property('value', this.resource.secret_content.content)
    }

}
