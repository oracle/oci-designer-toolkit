/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Instance Pool Javascript');

/*
** Define Instance Pool Class
*/
class InstancePool extends OkitArtifact {
    /*
    ** Create
    */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.compartment_id = data.parent_id;
        this.instance_configuration_id = ''
        this.size = 1
        this.placement_configurations = [this.newPlacementConfiguration()]
        this.load_balancers = []
        // Update with any passed data
        this.merge(data);
        this.convert();
    }
    /*
    ** Name Generation
    */
    getNamePrefix() {
        return super.getNamePrefix() + 'ip';
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return 'Instance Pool';
    }
    /*
    ** New Objects
    */
   newPlacementConfiguration = () => {
    return {
        availability_domain: '1',
        fault_domains: [],
        primary_subnet_id: ''
    }
   }
   newLoadBalancer = () => {
    return {
        load_balancer_id: '',
        backend_set_name: '',
        port: '',
        vnic_selection: 'PrimaryVnic'
    }
   }
}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newInstancePool = function(data) {
    this.getInstancePools().push(new InstancePool(data, this));
    return this.getInstancePools()[this.getInstancePools().length - 1];
}
OkitJson.prototype.getInstancePools = function() {
    if (!this.instance_pools) this.instance_pools = []
    return this.instance_pools;
}
OkitJson.prototype.getInstancePool = function(id='') {
    return this.getInstancePools().find(r => r.id === id)
}
OkitJson.prototype.deleteInstancePool = function(id) {
    this.instance_pools = this.instance_pools ? this.instance_pools.filter((r) => r.id !== id) : []
}

