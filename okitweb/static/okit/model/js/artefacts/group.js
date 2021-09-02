/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Group Javascript');

/*
** Define Group Class
*/
class Group extends OkitArtifact {
    /*
    ** Create
    */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.display_name = this.generateDefaultName(okitjson.groups.length + 1);
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
        return new Group(JSON.clone(this), this.getOkitJson());
    }
    /*
    ** Name Generation
    */
    getNamePrefix() {
        return super.getNamePrefix() + 'g';
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return 'Group';
    }
}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newGroup = function(data) {
    this.getGroups().push(new Group(data, this));
    return this.getGroups()[this.getGroups().length - 1];
}
OkitJson.prototype.getGroups = function() {
    if (!this.groups) {
        this.groups = [];
    }
    return this.groups;
}
OkitJson.prototype.getGroup = function(id='') {
    for (let artefact of this.getGroups()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
return undefined;
}
OkitJson.prototype.deleteGroup = function(id) {
    for (let i = 0; i < this.groups.length; i++) {
        if (this.groups[i].id === id) {
            this.groups[i].delete();
            this.groups.splice(i, 1);
            break;
        }
    }
}

