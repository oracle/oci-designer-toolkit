/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Drg Javascript');

/*
** Define Drg Class
*/
class Drg extends OkitArtifact {
    /*
    ** Create
    */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.display_name = this.generateDefaultName(okitjson.drgs.length + 1);
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
        return new Drg(JSON.clone(this), this.getOkitJson());
    }
    /*
    ** Name Generation
    */
    getNamePrefix() {
        return super.getNamePrefix() + 'drg';
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return 'Drg';
    }
}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newDrg = function(data) {
    this.getDrgs().push(new Drg(data, this));
    return this.getDrgs()[this.getDrgs().length - 1];
}
OkitJson.prototype.getDrgs = function() {
    if (!this.drgs) {
        this.drgs = [];
    }
    return this.drgs;
}
OkitJson.prototype.getDrg = function(id='') {
    for (let artefact of this.getDrgs()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
return undefined;
}
OkitJson.prototype.deleteDrg = function(id) {
    this.drgs = this.drgs ? this.drgs.filter((r) => r.id !== id) : []
}

