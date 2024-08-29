/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Mount Target Javascript');

/*
** Define Mount Target Class
*/
class MountTarget extends OkitArtifact {
    /*
    ** Create
    */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        // this.display_name = this.generateDefaultName(okitjson.mount_targets.length + 1);
        this.compartment_id = data.compartment_id;
        this.availability_domain = '1';
        this.subnet_id = '';
        this.hostname_label = '';
        this.ip_address = '';
        this.nsg_ids = [];
        this.max_fs_stat_bytes = '';
        this.max_fs_stat_files = '';
        this.exports = [];
        // Update with any passed data
        this.merge(data);
        this.convert();
    }

    convert() {
        super.convert()
        delete this.export_set
        this.exports.forEach((e, i) => {
            if (!e.resource_name) e.resource_name = `${this.resource_name}Export${i+1}`
            if (!e.options) e.options = this.newExportOptions()
        })
    }
    /*
    ** Create Export Element
    */
    newExport() {
        return {
            resource_name: `${this.generateResourceName()}Export`,
            file_system_id: '',
            path: this.isOCI() ? '' : 'AUTOSELECT',
            options: this.newExportOptions()
        }
    }
    newExportOptions() {
        return {
            source: this.getOkitJson().getSubnet(this.subnet_id) ? this.getOkitJson().getSubnet(this.subnet_id).cidr_block : '',
            access: 'READ_ONLY',
            anonymous_gid: 65534,
            anonymous_uid: 65534,
            identity_squash: 'ROOT',
            require_privileged_source_port: true
        }
    }
    /*
    ** Name Generation
    */
    getNamePrefix() {
        return super.getNamePrefix() + 'mt';
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return 'Mount Target';
    }
}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newMountTarget = function(data) {
    this.getMountTargets().push(new MountTarget(data, this));
    return this.getMountTargets()[this.getMountTargets().length - 1];
}
OkitJson.prototype.getMountTargets = function() {
    if (!this.mount_targets) {
        this.mount_targets = [];
    }
    return this.mount_targets;
}
OkitJson.prototype.getMountTarget = function(id='') {
    for (let artefact of this.getMountTargets()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
return undefined;
}
OkitJson.prototype.deleteMountTarget = function(id) {
    this.mount_targets = this.mount_targets ? this.mount_targets.filter((r) => r.id !== id) : []
}
OkitJson.prototype.filterMountTargets = function(filter) {this.mount_targets = this.mount_targets ? this.mount_targets.filter(filter) : []}

