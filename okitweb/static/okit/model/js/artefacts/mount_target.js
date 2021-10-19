/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Mount Target Javascript');

/*
** Define Mount Target Class
*/
class MountTarget extends OkitArtifact {
    /*
    ** Create
    */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.display_name = this.generateDefaultName(okitjson.mount_targets.length + 1);
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
        return new MountTarget(JSON.clone(this), this.getOkitJson());
    }
    /*
    ** Name Generation
    */
    getNamePrefix() {
        return super.getNamePrefix() + 'mt';
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return 'Mount Target';
    }
}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newMountTarget = function(data) {
    this.getMountTargets().push(new MountTarget(data, this));
    return this.getMountTargets()[this.getMountTargets().length - 1];
}
OkitJson.prototype.getMountTargets = function() {
    if (!this.mount_targets) {
        this.mount_targets = [];
    }
    return this.mount_targets;
}
OkitJson.prototype.getMountTarget = function(id='') {
    for (let artefact of this.getMountTargets()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
return undefined;
}
OkitJson.prototype.deleteMountTarget = function(id) {
    this.mount_targets = this.mount_targets ? this.mount_targets.filter((r) => r.id !== id) : []
}

