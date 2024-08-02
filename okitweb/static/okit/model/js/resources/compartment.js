/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Compartment Javascript');

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
    ** Filters
     */
    not_child_filter = (r) => r.compartment_id !== this.id
    child_filter = (r) => r.compartment_id === this.id

    /*
    ** Conversion Routine allowing loading of old json
     */
    convert() {
        super.convert();
        // Check if Root
        if (this.id === this.compartment_id || this.compartment_id === 'canvas') {this.compartment_id = null;}
    }

    /*
    ** Delete Processing
     */


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
