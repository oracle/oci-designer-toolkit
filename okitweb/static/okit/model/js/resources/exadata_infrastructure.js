/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Exadata Infrastructure Javascript');

/*
** Define Exadata Infrastructure Class
*/
class ExadataInfrastructure extends OkitArtifact {
    /*
    ** Create
    */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        // this.display_name = this.generateDefaultName(okitjson.exadata_infrastructures.length + 1);
        this.compartment_id = data.parent_id;
        this.read_only = true;
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
        return super.getNamePrefix() + 'ei';
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return 'Exadata Infrastructure';
    }
}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newExadataInfrastructure = function(data) {
    this.getExadataInfrastructures().push(new ExadataInfrastructure(data, this));
    return this.getExadataInfrastructures()[this.getExadataInfrastructures().length - 1];
}
OkitJson.prototype.getExadataInfrastructures = function() {
    if (!this.exadata_infrastructures) {
        this.exadata_infrastructures = [];
    }
    return this.exadata_infrastructures;
}
OkitJson.prototype.getExadataInfrastructure = function(id='') {
    for (let artefact of this.getExadataInfrastructures()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
return undefined;
}
OkitJson.prototype.deleteExadataInfrastructure = function(id) {
    this.exadata_infrastructures = this.exadata_infrastructures ? this.exadata_infrastructures.filter((r) => r.id !== id) : []
}

