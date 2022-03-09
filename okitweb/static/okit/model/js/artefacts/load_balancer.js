/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Load Balancer Javascript');

/*
** Define Load Balancer Class
 */
class LoadBalancer extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        // this.display_name = this.generateDefaultName(okitjson.load_balancers.length + 1);
        this.compartment_id = '';
        this.subnet_ids = [];
        this.is_private = false;
        this.shape = 'flexible';
        this.protocol = 'HTTP';
        this.port = '80';
        this.instance_ids = [];
        this.ip_mode = '';
        this.network_security_group_ids = [];
        this.backend_policy = 'ROUND_ROBIN';
        this.health_checker = {url_path: '/'}
        this.shape_details = {
            minimum_bandwidth_in_mbps: 10,
            maximum_bandwidth_in_mbps: 10
        }

        // Update with any passed data
        this.merge(data);
        this.convert();
        // Expose subnet_id for the first Mount target at the top level
        Object.defineProperty(this, 'subnet_id', {get: function() {return this.subnet_ids[0];}, set: function(subnet_id) {this.subnet_ids[0] = subnet_id;}, enumerable: false });
    }

    /*
    ** Conversion Routine allowing loading of old json
     */
    convert() {
        if (this.shape_name !== undefined) {this.shape = this.shape_name; delete this.shape_name;}
    }


    /*
    ** Delete Processing
     */
    deleteChildren() {}

    getNamePrefix() {
        return super.getNamePrefix() + 'lb';
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return 'Load Balancer';
    }

}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newLoadBalancer = function(data) {
    console.info('New Load Balancer');
    this.getLoadBalancers().push(new LoadBalancer(data, this));
    return this.getLoadBalancers()[this.getLoadBalancers().length - 1];
}
OkitJson.prototype.getLoadBalancers = function() {
    if (!this.load_balancers) this.load_balancers = [];
    return this.load_balancers;
}
OkitJson.prototype.getLoadBalancer = function(id='') {
    for (let artefact of this.getLoadBalancers()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJson.prototype.deleteLoadBalancer = function(id) {
    this.load_balancers = this.load_balancers ? this.load_balancers.filter((r) => r.id !== id) : []
}
OkitJson.prototype.filterLoadBalancers = function(filter) {this.load_balancers = this.load_balancers ? this.load_balancers.filter(filter) : []}
