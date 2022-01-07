/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Network Load Balancer Javascript');

/*
** Define Network Load Balancer Class
*/
class NetworkLoadBalancer extends OkitArtifact {
    /*
    ** Create
    */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        // this.display_name = this.generateDefaultName(okitjson.network_load_balancers.length + 1);
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
        return new NetworkLoadBalancer(JSON.clone(this), this.getOkitJson());
    }
    /*
    ** Name Generation
    */
    getNamePrefix() {
        return super.getNamePrefix() + 'nlb';
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return 'Network Load Balancer';
    }
}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newNetworkLoadBalancer = function(data) {
    this.getNetworkLoadBalancers().push(new NetworkLoadBalancer(data, this));
    return this.getNetworkLoadBalancers()[this.getNetworkLoadBalancers().length - 1];
}
OkitJson.prototype.getNetworkLoadBalancers = function() {
    if (!this.network_load_balancers) {
        this.network_load_balancers = [];
    }
    return this.network_load_balancers;
}
OkitJson.prototype.getNetworkLoadBalancer = function(id='') {
    for (let artefact of this.getNetworkLoadBalancers()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
return undefined;
}
OkitJson.prototype.deleteNetworkLoadBalancer = function(id) {
    this.network_load_balancers = this.network_load_balancers ? this.network_load_balancers.filter((r) => r.id !== id) : []
}

