/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Compartment ObjectStorageBucket View Javascript');

/*
** Define ObjectStorageBucket View Artifact Class
 */
class ObjectStorageBucketView extends OkitCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
    }

    get parent_id() {return this.artefact.compartment_id;}
    get parent() {return this.getJsonView().getCompartment(this.parent_id);}

    /*
     ** SVG Processing
     */

    /*
    ** Property Sheet Load function
    */
    newPropertiesSheet() {
        this.properties_sheet = new ObjectStorageBucketProperties(this.artefact)
    }

    /*
    ** Load and display Value Proposition
     */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/object_storage_bucket.html");
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return ObjectStorageBucket.getArtifactReference();
    }

    static getDropTargets() {
        return [Compartment.getArtifactReference()];
    }

}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropObjectStorageBucketView = function(target) {
    let view_artefact = this.newObjectStorageBucket();
    view_artefact.getArtefact().compartment_id = target.id;
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newObjectStorageBucket = function(storage) {
    this.getObjectStorageBuckets().push(storage ? new ObjectStorageBucketView(storage, this) : new ObjectStorageBucketView(this.okitjson.newObjectStorageBucket(), this));
    return this.getObjectStorageBuckets()[this.getObjectStorageBuckets().length - 1];
}
OkitJsonView.prototype.getObjectStorageBuckets = function() {
    if (!this.object_storage_buckets) this.object_storage_buckets = []
    return this.object_storage_buckets;
}
OkitJsonView.prototype.getObjectStorageBucket = function(id='') {
    for (let artefact of this.getObjectStorageBuckets()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadObjectStorageBuckets = function(object_storage_buckets) {
    for (const artefact of object_storage_buckets) {
        this.getObjectStorageBuckets().push(new ObjectStorageBucketView(new ObjectStorageBucket(artefact, this.okitjson), this));
    }
}
