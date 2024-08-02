/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Data Integration Workspace Javascript');

/*
** Define Data Integration Workspace Class
*/
class DataIntegrationWorkspace extends OkitArtifact {
    /*
    ** Create
    */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.compartment_id = data.parent_id;
        this.description = ''
        this.dns_server_ip = ''
        this.dns_server_zone = ''
        this.is_private_network_enabled = true
        this.subnet_id = ''
        this.vcn_id = ''
        // Update with any passed data
        this.merge(data);
        this.convert();
    }
    /*
    ** Name Generation
    */
    getNamePrefix() {
        return super.getNamePrefix() + 'diw';
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return 'Data Integration Workspace';
    }
}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newDataIntegrationWorkspace = function(data) {
    this.getDataIntegrationWorkspaces().push(new DataIntegrationWorkspace(data, this));
    return this.getDataIntegrationWorkspaces()[this.getDataIntegrationWorkspaces().length - 1];
}
OkitJson.prototype.getDataIntegrationWorkspaces = function() {
    if (!this.data_integration_workspaces) this.data_integration_workspaces = []
    return this.data_integration_workspaces;
}
OkitJson.prototype.getDataIntegrationWorkspace = function(id='') {
    for (let artefact of this.getDataIntegrationWorkspaces()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
return undefined;
}
OkitJson.prototype.deleteDataIntegrationWorkspace = function(id) {
    this.data_integration_workspaces = this.data_integration_workspaces ? this.data_integration_workspaces.filter((r) => r.id !== id) : []
}

