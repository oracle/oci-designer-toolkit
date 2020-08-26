/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded File Storage System Javascript');

/*
** Define File Storage System Class
 */
class FileStorageSystem extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.display_name = this.generateDefaultName(okitjson.file_storage_systems.length + 1);
        this.compartment_id = '';
        this.availability_domain = '1';
        this.exports = [];
        this.mount_targets = [];
        // Update with any passed data
        this.merge(data);
        // Check if built from a query
        if (this.availability_domain.length > 1) {
            this.region_availability_domain = this.availability_domain;
            this.availability_domain = this.region_availability_domain.slice(-1);
        }
        if (this.exports.length > 0) {
            this.primary_export = this.exports[0];
        } else if (this.subnet_id) {
            this.primary_export = {path: '/mnt', export_options: {source: this.getOkitJson().getSubnet(this.subnet_id)['cidr_block'], access: 'READ_ONLY', anonymous_gid: '', anonymous_uid: '', identity_squash: 'NONE', require_privileged_source_port: true}};
            this.exports[0] = this.primary_export;
        }
        if (this.mount_targets.length > 0) {
            this.primary_mount_target = this.mount_targets[0];
        } else if (this.subnet_id) {
            this.primary_mount_target = {subnet_id: this.subnet_id, hostname_label: this.display_name.toLowerCase(), nsg_ids: [], export_set: {max_fs_stat_bytes: '', max_fs_stat_files: ''}};
            this.mount_targets[0] = this.primary_mount_target;
        }
        this.convert();
        // Expose subnet_id for the first Mount target at the top level
        delete this.subnet_id;
        Object.defineProperty(this, 'subnet_id', { get: function() {return this.primary_mount_target.subnet_id;}, enumerable: false });
    }


    /*
    ** Conversion Routine allowing loading of old json
     */
    convert() {
        super.convert();
        // Export Element
        if (this.exports === undefined) {this.export = [];}
        if (this.exports[0].export_options === undefined) {this.exports[0].export_options = {};}
        if (this.path !== undefined) {this.exports[0].path = this.path; delete this.path;}
        if (this.source !== undefined) {this.exports[0].export_options.source = this.source; delete this.source;}
        if (this.access !== undefined) {this.exports[0].export_options.access = this.access; delete this.access;}
        // Mount Target
        if (this.mount_targets === undefined) {this.mount_target = [{}];}
        if (this.subnet_id !== undefined) {this.mount_targets[0].subnet_id = this.subnet_id; delete this.subnet_id;}
        if (this.hostname_label !== undefined) {this.mount_targets[0].hostname_label = this.hostname_label; delete this.hostname_label;}
    }

    /*
    ** Clone Functionality
     */
    clone() {
        return new FileStorageSystem(this, this.getOkitJson());
    }


    /*
    ** Delete Processing
     */
    deleteChildren() {}


    getNamePrefix() {
        return super.getNamePrefix() + 'fss';
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return 'File Storage System';
    }

}
