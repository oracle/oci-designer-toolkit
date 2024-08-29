/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Vm Cluster Javascript');

/*
** Define Vm Cluster Class
*/
class VmCluster extends OkitArtifact {
    /*
    ** Create
    */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        // this.display_name = this.generateDefaultName(okitjson.vm_clusters.length + 1);
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
        return super.getNamePrefix() + 'vc';
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return 'Vm Cluster';
    }
}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newVmCluster = function(data) {
    this.getVmClusters().push(new VmCluster(data, this));
    return this.getVmClusters()[this.getVmClusters().length - 1];
}
OkitJson.prototype.getVmClusters = function() {
    if (!this.vm_clusters) {
        this.vm_clusters = [];
    }
    return this.vm_clusters;
}
OkitJson.prototype.getVmCluster = function(id='') {
    for (let artefact of this.getVmClusters()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
return undefined;
}
OkitJson.prototype.deleteVmCluster = function(id) {
    this.vm_clusters = this.vm_clusters ? this.vm_clusters.filter((r) => r.id !== id) : []
}

