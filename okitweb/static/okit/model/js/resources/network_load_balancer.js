/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Network Load Balancer Javascript');

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
        this.subnet_id = ''
        this.is_preserve_source_destination = false 
        this.is_private = false
        this.network_security_group_ids = []
        // nlb_ip_version = 'IPv4'
        this.reserved_ips = []
        this.backend_sets = []
        this.listeners = []
        // Update with any passed data
        this.merge(data);
        this.convert();
    }

        /*
    ** Conversion Routine allowing loading of old json
     */
    convert() {
        super.convert()
        if (this.backend_sets && !Array.isArray(this.backend_sets) && typeof this.backend_sets === 'object') this.backend_sets = Object.values(this.backend_sets)
        if (this.listeners && !Array.isArray(this.listeners) && typeof this.listeners === 'object') this.listeners = Object.values(this.listeners)
    }

    newHealthChecker() {
        return {
            protocol: 'HTTP',
            interval_in_millis: 10000,
            port: 80,
            request_data: '',
            response_body_regex: '',
            response_data: '',
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
            policy: 'FIVE_TUPLE',
            ip_version: '',
            is_preserve_source: true,
            backends: []
        }
    }

    newBackend() {
        return {
            resource_name: `${this.generateResourceName()}Backend`,
            port: 80,
            ip_address: '',
            is_backup: false,
            is_drain: false,
            is_offline: false,
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
            protocol: 'TCP',
            ip_version: ''
        }
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

