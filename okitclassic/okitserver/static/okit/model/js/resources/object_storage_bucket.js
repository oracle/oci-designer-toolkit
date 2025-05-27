/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Object Storage Bucket Javascript');

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
        // this.display_name = this.name;
        this.namespace = 'Tenancy Name';
        this.storage_tier = 'Standard';
        this.public_access_type = 'NoPublicAccess';
        this.object_events_enabled = false
        this.versioning = 'Disabled'
        this.auto_tiering = 'Disabled'
        this.kms_key_id = '';
        // Pricing Only
        this.estimated_monthly_capacity_gbs = 1
        this.estimated_monthly_requests = 1
        // Update with any passed data
        this.merge(data);
        this.convert();
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
