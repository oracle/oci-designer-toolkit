/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Dynamic Group Javascript');

/*
** Define Dynamic Group Class
*/
class DynamicGroup extends OkitArtifact {
    /*
    ** Create
    */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        // this.display_name = this.generateDefaultName(okitjson.dynamic_groups.length + 1);
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
    ** Name Generation
    */
    getNamePrefix() {
        return super.getNamePrefix() + 'dg';
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return 'Dynamic Group';
    }
}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newDynamicGroup = function(data) {
    this.getDynamicGroups().push(new DynamicGroup(data, this));
    return this.getDynamicGroups()[this.getDynamicGroups().length - 1];
}
OkitJson.prototype.getDynamicGroups = function() {
    if (!this.dynamic_groups) {
        this.dynamic_groups = [];
    }
    return this.dynamic_groups;
}
OkitJson.prototype.getDynamicGroup = function(id='') {
    for (let artefact of this.getDynamicGroups()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
return undefined;
}
OkitJson.prototype.deleteDynamicGroup = function(id) {
    this.dynamic_groups = this.dynamic_groups ? this.dynamic_groups.filter((r) => r.id !== id) : []
}

