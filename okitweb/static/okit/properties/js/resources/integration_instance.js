/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Integration Instance Properties Javascript');

/*
** Define Integration Instance Properties Class
*/
class IntegrationInstanceProperties extends OkitResourceProperties {
    constructor (resource) {
        const resource_tabs = []
        super(resource, resource_tabs)
    }

    // Build Additional Resource Specific Properties
    buildResource() {
        // Instance Type
        const integration_instance_type_data = {
            options: {
                STANDARD: 'Standard Gen 2', 
                ENTERPRISE: 'Enterprise Gen 2', 
                STANDARDX: 'Standard Gen 3', 
                ENTERPRISEX: 'Enterprise Gen 3', 
            }
        }
        const integration_instance_type = this.createInput('select', 'Edition', `${this.id}_integration_instance_type`, '', (d, i, n) => this.resource.integration_instance_type = n[i].value, integration_instance_type_data)
        this.integration_instance_type = integration_instance_type.input
        this.append(this.core_tbody, integration_instance_type.row)
        // Shape
        const shape_data = {
            options: {
                DEVELOPMENT: 'Development', 
                PRODUCTION: 'Production', 
            }
        }
        const shape = this.createInput('select', 'Shape', `${this.id}_shape`, '', (d, i, n) => this.resource.shape = n[i].value, shape_data)
        this.shape = shape.input
        this.append(this.core_tbody, shape.row)
        // Message Packs
        const message_packs_data = {min: 1, max: 3}
        const message_packs = this.createInput('number', 'Message Packs', `${this.id}_message_packs`, '', (d, i, n) => this.resource.message_packs = n[i].value, message_packs_data)
        this.message_packs = message_packs.input
        this.append(this.core_tbody, message_packs.row)
        // File Server Enabled
        const is_file_server_enabled = this.createInput('checkbox', 'File Server Enabled', `${this.id}_is_file_server_enabled`, '', (d, i, n) => {this.resource.is_file_server_enabled = n[i].checked})
        this.is_file_server_enabled = is_file_server_enabled.input
        this.append(this.core_tbody, is_file_server_enabled.row)
        // Visual Builder Enabled
        const is_visual_builder_enabled = this.createInput('checkbox', 'Visual Builder Enabled', `${this.id}_is_visual_builder_enabled`, '', (d, i, n) => {this.resource.is_visual_builder_enabled = n[i].checked})
        this.is_visual_builder_enabled = is_visual_builder_enabled.input
        this.append(this.core_tbody, is_visual_builder_enabled.row)
        // IDCS Authentication Token
        const idcs_at = this.createInput('text', 'IDCS Authentication Token', `${this.id}_idcs_at`, '', (d, i, n) => this.resource.idcs_at = n[i].value)
        this.idcs_at = idcs_at.input
        this.append(this.core_tbody, idcs_at.row)
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        // Load Selects
        // Assign Values
        this.integration_instance_type.property('value', this.resource.integration_instance_type)
        this.shape.property('value', this.resource.shape)
        this.message_packs.property('value', this.resource.message_packs)
        this.is_file_server_enabled.property('checked', this.resource.is_file_server_enabled)
        this.is_visual_builder_enabled.property('checked', this.resource.is_visual_builder_enabled)
        this.idcs_at.property('value', this.resource.idcs_at)
    }

}
