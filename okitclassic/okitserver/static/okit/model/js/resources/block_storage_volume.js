/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Block Storage Volume Javascript');

/*
** Define Block Storage Volume Class
 */
class BlockStorageVolume extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        // this.display_name = this.generateDefaultName(okitjson.block_storage_volumes.length + 1);
        this.compartment_id = data.parent_id;
        this.availability_domain = '1';
        this.kms_key_id = '';
        this.size_in_gbs = 1024;
        this.backup_policy = '';
        this.vpus_per_gb = '10';
        // Update with any passed data
        this.merge(data);
        this.convert();
    }


    /*
    ** Delete Processing
     */
    deleteReferences() {
        // Instance Volume Attachment
        this.getOkitJson().getInstances().forEach((r) => r.volume_attachments = r.volume_attachments.filter((v) => v.volume_id !== this.id))
    }


    getNamePrefix() {
        return super.getNamePrefix() + 'bsv';
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return 'Block Storage Volume';
    }

}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newBlockStorageVolume = function(data) {
    console.info('New Block Storage Volume');
    this.getBlockStorageVolumes().push(new BlockStorageVolume(data, this));
    return this.getBlockStorageVolumes()[this.getBlockStorageVolumes().length - 1];
}
OkitJson.prototype.getBlockStorageVolumes = function() {
    if (!this.block_storage_volumes) this.block_storage_volumes = [];
    return this.block_storage_volumes;
}
OkitJson.prototype.getBlockStorageVolume = function(id='') {
    for (let artefact of this.getBlockStorageVolumes()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJson.prototype.deleteBlockStorageVolume = function(id) {
    this.block_storage_volumes = this.block_storage_volumes ? this.block_storage_volumes.filter((r) => r.id !== id) : []
}
