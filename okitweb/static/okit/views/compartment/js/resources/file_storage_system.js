/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Compartment FileStorageSystem View Javascript');

/*
** Define FileStorageSystem View Artifact Class
 */
class FileStorageSystemView extends OkitCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
    }

    get parent_id() {return this.artefact.primary_mount_target.subnet_id;}
    get parent() {return this.getJsonView().getSubnet(this.parent_id);}
    // Direct Subnet Access
    get subnet_id() {return this.artefact.primary_mount_target.subnet_id;}
    set subnet_id(id) {this.artefact.primary_mount_target.subnet_id = id;}

    /*
     ** SVG Processing
     */

    /*
    ** Property Sheet Load function
     */
    loadProperties() {
        let okitJson = this.getOkitJson();
        let me = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/file_storage_system.html", () => {
            // Build Network Security Groups
            this.loadNetworkSecurityGroups('nsg_ids', this.subnet_id);
            // Load Properties
            loadPropertiesSheet(me.artefact);
        });
    }

    /*
    ** Load and display Value Proposition
     */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/file_storage_system.html");
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return FileStorageSystem.getArtifactReference();
    }

    static getDropTargets() {
        return [Subnet.getArtifactReference()];
    }

}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropFileStorageSystemView = function(target) {
    // Pass in subnet so we create a default mount
    let view_artefact = this.newFileStorageSystem(this.okitjson.newFileStorageSystem({subnet_id: target.id}));
    view_artefact.getArtefact().compartment_id = target.compartment_id;
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newFileStorageSystem = function(storage) {
    this.getFileStorageSystems().push(storage ? new FileStorageSystemView(storage, this) : new FileStorageSystemView(this.okitjson.newFileStorageSystem(), this));
    return this.getFileStorageSystems()[this.getFileStorageSystems().length - 1];
}
OkitJsonView.prototype.getFileStorageSystems = function() {
    if (!this.file_storage_systems) this.file_storage_systems = []
    return this.file_storage_systems;
}
OkitJsonView.prototype.getFileStorageSystem = function(id='') {
    for (let artefact of this.getFileStorageSystems()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadFileStorageSystems = function(file_storage_systems) {
    for (const artefact of file_storage_systems) {
        this.getFileStorageSystems().push(new FileStorageSystemView(new FileStorageSystem(artefact, this.okitjson), this));
    }
}
