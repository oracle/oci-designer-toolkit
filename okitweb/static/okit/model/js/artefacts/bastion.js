/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Bastion Javascript');

/*
** Define Bastion Class
*/
class Bastion extends OkitArtifact {
    /*
    ** Create
    */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.display_name = this.generateDefaultName(okitjson.bastions.length + 1);
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
        return new Bastion(JSON.clone(this), this.getOkitJson());
    }
    /*
    ** Name Generation
    */
    getNamePrefix() {
        return super.getNamePrefix() + 'b';
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return 'Bastion';
    }
}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newBastion = function(data) {
    this.getBastions().push(new Bastion(data, this));
    return this.getBastions()[this.getBastions().length - 1];
}
OkitJson.prototype.getBastions = function() {
    if (!this.bastions) {
        this.bastions = [];
    }
    return this.bastions;
}
OkitJson.prototype.getBastion = function(id='') {
    for (let artefact of this.getBastions()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
return undefined;
}
OkitJson.prototype.deleteBastion = function(id) {
    this.bastions = this.bastions ? this.bastions.filter((r) => r.id !== id) : []
}

