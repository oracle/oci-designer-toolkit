/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Data Integration Workspace Javascript');

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
        this.display_name = this.generateDefaultName(okitjson.data_integration_workspaces.length + 1);
        this.compartment_id = data.parent_id;
        /*
        ** TODO: Add Resource / Artefact specific parameters and default
        */
        // Update with any passed data
        this.merge(data);
        this.convert();
        // TODO: If the Resource is within a Subnet but the subnet_iss is not at the top level then raise it with the following functions if not required delete them.
        // Expose subnet_id at the top level
        Object.defineProperty(this, 'subnet_id', {get: function() {return this.primary_mount_target.subnet_id;}, set: function(id) {this.primary_mount_target.subnet_id = id;}, enumerable: false });
    }
    /*
    ** Clone Functionality
    */
    clone() {
        return new DataIntegrationWorkspace(JSON.clone(this), this.getOkitJson());
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
    if (!this.data_integration_workspaces) {
        this.data_integration_workspaces = [];
    }
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
    for (let i = 0; i < this.data_integration_workspaces.length; i++) {
        if (this.data_integration_workspaces[i].id === id) {
            this.data_integration_workspaces[i].delete();
            this.data_integration_workspaces.splice(i, 1);
            break;
        }
    }
}

