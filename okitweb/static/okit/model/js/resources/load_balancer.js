/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Load Balancer Javascript');

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
        this.shape =  this.isPCA() ? '400Mbps' : 'flexible';
        this.ip_mode = '';
        this.network_security_group_ids = [];
        this.shape_details = {
            minimum_bandwidth_in_mbps: 10,
            maximum_bandwidth_in_mbps: 10
        }
        this.reserved_ips = []
        this.backend_sets = []
        this.listeners = []

        // Update with any passed data
        this.merge(data);
        this.convert();
        // Expose subnet_id for the first Mount target at the top level
        Object.defineProperty(this, 'subnet_id', {get: function() {return this.subnet_ids[0] ? this.subnet_ids[0] : '';}, set: function(subnet_id) {this.subnet_ids[0] = subnet_id;}, enumerable: false });
    }

    /*
    ** Conversion Routine allowing loading of old json
     */
    convert() {
        super.convert()
        if (this.shape_name !== undefined) {this.shape = this.shape_name; delete this.shape_name;}
        if (this.backend_sets && !Array.isArray(this.backend_sets) && typeof this.backend_sets === 'object') this.backend_sets = Object.values(this.backend_sets)
        if (this.listeners && !Array.isArray(this.listeners) && typeof this.listeners === 'object') this.listeners = Object.values(this.listeners)
        if (this.health_checker) {
            // V1 Format
            const backend_set = this.newBackendSet()
            backend_set.health_checker = this.health_checker
            backend_set.policy = this.backend_policy
            this.instance_ids.forEach((id) => {
                const backend = this.newBackend()
                backend.target_id = id
                backend.port = this.port
                backend_set.backends.push(backend)
            })
            this.backend_sets.push(backend_set)
            const listener = this.newListener()
            listener.default_backend_set_name = backend_set.resource_name
            listener.port = this.port
            listener.protocol = this.protocol
            this.listeners.push(listener)
            // Remove V1 Variables
            delete this.health_checker
            delete this.port
            delete this.protocol
            delete this.instance_ids
            delete this.backend_policy
        }
        // Check Resource Names
        this.backend_sets.forEach((bs, i) => {
            bs.resource_name = bs.resource_name ? bs.resource_name : `${this.generateResourceName()}BackendSet${i}`
            bs.backends.forEach((b, j) => b.resource_name = b.resource_name ? b.resource_name : `${this.generateResourceName()}BackendSet${i}BackEnd${j}`)
        })
        this.listeners.forEach((l, i) => l.resource_name = l.resource_name ? l.resource_name : `${this.generateResourceName()}Listener${i}`)
    }

    /*
    ** Sub Group Creation routines
    */
    newHealthChecker() {
        return {
            protocol: 'HTTP',
            interval_ms: 10000,
            port: 80,
            response_body_regex: '',
            retries: 3,
            return_code: 200,
            timeout_in_millis: 3000,
            url_path: ''
        }
    }

    newBackendSet() {
        return {
            resource_name: `${this.generateResourceName()}BackendSet`,
            health_checker: this.newHealthChecker(),
            name: `${this.display_name}BackendSet`.replaceAll(' ', '_'),
            policy: 'ROUND_ROBIN',
            backends: []
        }
    }

    newBackend() {
        return {
            resource_name: `${this.generateResourceName()}Backend`,
            port: 80,
            ip_address: '',
            backup: false,
            drain: false,
            offline: false,
            name: `${this.display_name}Backend`.replaceAll(' ', '_'),
            target_id: '',
            weight: 1
        }
    }

    newListener() {
        return {
            resource_name: `${this.generateResourceName()}Listener`,
            default_backend_set_name: '',
            name: `${this.display_name}Listener`.replaceAll(' ', '_'),
            use_any_port: false,
            port: 80,
            protocol: 'TCP'
        }
    }

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
