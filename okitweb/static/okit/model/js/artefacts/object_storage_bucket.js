/*
** Copyright (c) 2020, Oracle and/or its affiliates.
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
        this.name = this.generateDefaultName(okitjson.object_storage_buckets.length + 1);
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
        for (let instance of this.getOkitJson().instances) {
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
