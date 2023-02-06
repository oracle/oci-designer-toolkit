/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Node Pool Javascript');

/*
** Define Node Pool Class
*/
class NodePool extends OkitArtifact {
    /*
    ** Create
    */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.compartment_id = data.parent_id;
        this.cluster_id = ''
        this.node_shape = ''
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
        return super.getNamePrefix() + 'np';
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return 'Node Pool';
    }
}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newNodePool = function(data) {
    this.getNodePools().push(new NodePool(data, this));
    return this.getNodePools()[this.getNodePools().length - 1];
}
OkitJson.prototype.getNodePools = function() {
    if (!this.node_pools) this.node_pools = []
    return this.node_pools;
}
OkitJson.prototype.getNodePool = function(id='') {
    return this.getNodePools().find(r => r.id === id)
}
OkitJson.prototype.deleteNodePool = function(id) {
    this.node_pools = this.node_pools ? this.node_pools.filter((r) => r.id !== id) : []
}

