/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Key Javascript');

/*
** Define Key Class
*/
class Key extends OkitArtifact {
    /*
    ** Create
    */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.display_name = this.generateDefaultName(okitjson.keys.length + 1);
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
        return new Key(JSON.clone(this), this.getOkitJson());
    }
    /*
    ** Name Generation
    */
    getNamePrefix() {
        return super.getNamePrefix() + 'k';
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return 'Key';
    }
}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newKey = function(data) {
    this.getKeys().push(new Key(data, this));
    return this.getKeys()[this.getKeys().length - 1];
}
OkitJson.prototype.getKeys = function() {
    if (!this.keys) {
        this.keys = [];
    }
    return this.keys;
}
OkitJson.prototype.getKey = function(id='') {
    for (let artefact of this.getKeys()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
return undefined;
}
OkitJson.prototype.deleteKey = function(id) {
    this.keys = this.keys ? this.keys.filter((r) => r.id !== id) : []
}

