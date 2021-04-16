/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Vm Cluster Network Javascript');

/*
** Define Vm Cluster Network Class
*/
class VmClusterNetwork extends OkitArtifact {
    /*
    ** Create
    */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.display_name = this.generateDefaultName(okitjson.vm_cluster_networks.length + 1);
        this.compartment_id = data.parent_id;
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
    ** Clone Functionality
    */
    clone() {
        return new VmClusterNetwork(JSON.clone(this), this.getOkitJson());
    }
    /*
    ** Name Generation
    */
    getNamePrefix() {
        return super.getNamePrefix() + 'vcn';
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return 'Vm Cluster Network';
    }
}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newVmClusterNetwork = function(data) {
    this.getVmClusterNetworks().push(new VmClusterNetwork(data, this));
    return this.getVmClusterNetworks()[this.getVmClusterNetworks().length - 1];
}
OkitJson.prototype.getVmClusterNetworks = function() {
    if (!this.vm_cluster_networks) {
        this.vm_cluster_networks = [];
    }
    return this.vm_cluster_networks;
}
OkitJson.prototype.getVmClusterNetwork = function(id='') {
    for (let artefact of this.getVmClusterNetworks()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
return undefined;
}
OkitJson.prototype.deleteVmClusterNetwork = function(id) {
    for (let i = 0; i < this.vm_cluster_networks.length; i++) {
        if (this.vm_cluster_networks[i].id === id) {
            this.vm_cluster_networks[i].delete();
            this.vm_cluster_networks.splice(i, 1);
            break;
        }
    }
}

