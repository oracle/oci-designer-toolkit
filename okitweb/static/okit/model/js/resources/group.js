/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Group Javascript');

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
        // this.display_name = this.generateDefaultName(okitjson.groups.length + 1);
        this.compartment_id = null;
        this.description = `User Group ${this.display_name}`
        this.user_ids = []
        // Update with any passed data
        this.merge(data);
        this.convert();
        // Expose Useful Information
        Object.defineProperty(this, 'user_count', {get: () => {return this.user_ids.length}})
    }
    /*
    ** Name Generation
    */
    getNamePrefix() {
        return super.getNamePrefix() + 'grp';
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
    this.groups = this.groups ? this.groups.filter((r) => r.id !== id) : []
}

