/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Object Storage Bucket Javascript');

/*
** Define Object Storage Bucket Class
 */
class ObjectStorageBucket extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        // this.name = this.generateDefaultName(okitjson.object_storage_buckets.length + 1);
        this.compartment_id = data.parent_id;
        this.display_name = this.name;
        this.namespace = 'Tenancy Name';
        this.storage_tier = 'Standard';
        this.public_access_type = 'NoPublicAccess';
        // Update with any passed data
        this.merge(data);
        this.convert();
    }


    /*
    ** Clone Functionality
     */
    clone() {
        return new ObjectStorageBucket(JSON.clone(this), this.getOkitJson());
    }


    /*
    ** Delete Processing
     */
    deleteChildren() {
        for (let instance of this.getOkitJson().getInstances()) {
            for (let i=0; i < instance['object_storage_bucket_ids'].length; i++) {
                if (instance.object_storage_bucket_ids[i] === this.id) {
                    instance.object_storage_bucket_ids.splice(i, 1);
                }
            }
        }
    }

    getNamePrefix() {
        return super.getNamePrefix() + 'osb';
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return 'Object Storage Bucket';
    }

}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newObjectStorageBucket = function(data) {
    console.info('New Object Storage Bucket');
    this.getObjectStorageBuckets().push(new ObjectStorageBucket(data, this));
    return this.getObjectStorageBuckets()[this.getObjectStorageBuckets().length - 1];
}
OkitJson.prototype.getObjectStorageBuckets = function() {
    if (!this.object_storage_buckets) this.object_storage_buckets = [];
    return this.object_storage_buckets;
}
OkitJson.prototype.getObjectStorageBucket = function(id='') {
    for (let artefact of this.getObjectStorageBuckets()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJson.prototype.deleteObjectStorageBucket = function(id) {
    this.object_storage_buckets = this.object_storage_buckets ? this.object_storage_buckets.filter((r) => r.id !== id) : []
}
