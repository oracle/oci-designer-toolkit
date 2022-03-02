/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Compartment Javascript');

/*
** Define Compartment Artifact Class
 */
class Compartment extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.compartment_id = null;
        // this.name = this.generateDefaultName(okitjson.compartments.length + 1);
        // this.display_name = this.name;
        this.description = this.name;
        // Update with any passed data
        this.merge(data);
        this.convert();
    }

    /*
    ** Conversion Routine allowing loading of old json
     */
    convert() {
        super.convert();
        // Check if Root
        if (this.id === this.compartment_id || this.compartment_id === 'canvas') {this.compartment_id = null;}
    }

    /*
    ** Clone Functionality
     */
    clone() {
        return new Compartment(JSON.clone(this), this.getOkitJson());
    }


    /*
    ** Delete Processing
     */
    deleteChildren() {
        console.log('Deleting Children of ' + this.getArtifactReference() + ' : ' + this.display_name);

        // Remove Compartments
        this.getOkitJson().getCompartments().filter((d) => d.vcn_id === this.id).forEach((c) => c.delete())
        // Virtual Cloud Networks
        this.getOkitJson().getVirtualCloudNetworks().filter((d) => d.vcn_id === this.id).forEach((c) => c.delete())
        // Block Storage Volumes
        this.getOkitJson().getBlockStorageVolumes().filter((d) => d.vcn_id === this.id).forEach((c) => c.delete())
        // Object Storage Buckets
        this.getOkitJson().getObjectStorageBuckets().filter((d) => d.vcn_id === this.id).forEach((c) => c.delete())
        // Autonomous Databases
        this.getOkitJson().getAutonomousDatabases().filter((d) => d.vcn_id === this.id).forEach((c) => c.delete())
        // Dynamic Routing Gateways
        this.getOkitJson().getDynamicRoutingGateways().filter((d) => d.vcn_id === this.id).forEach((c) => c.delete())
    }


    getNamePrefix() {
        return super.getNamePrefix() + 'comp';
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return 'Compartment';
    }

}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newCompartment = function(data = {}) {
    console.info('New Compartment');
    this.getCompartments().push(new Compartment(data, this));
    return this.getCompartments()[this.getCompartments().length - 1];
}
OkitJson.prototype.getCompartments = function() {
    if (!this.compartments) this.compartments = [];
    return this.compartments;
}
OkitJson.prototype.getCompartment = function(id='') {
    for (let artefact of this.getCompartments()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJson.prototype.deleteCompartment = function(id) {
    this.compartments = this.compartments ? this.compartments.filter((r) => r.id !== id) : []
}
