/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Analytics Instance Javascript');

/*
** Define Analytics Instance Class
*/
class AnalyticsInstance extends OkitArtifact {
    /*
    ** Create
    */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.display_name = this.generateDefaultName(okitjson.analytics_instances.length + 1);
        this.compartment_id = '';
        this.feature_set = '';
        this.idcs_access_token = '';
        this.license_type = '';
        this.capacity = {
            capacity_type: '',
            capacity_value: ''
        }
        this.description = '';
        this.network_endpoint_details = {
            network_endpoint_type: '',
            subnet_id: '',
            vcn_id: '',
            whitelisted_ips: '',
            whitelisted_vcns: []
        }
        // Update with any passed data
        this.merge(data);
        this.convert();
        // Expose subnet_id at the top level
        delete this.subnet_id;
        delete this.vcn_id;
        Object.defineProperty(this, 'subnet_id', {get: function() {return this.network_endpoint_details.subnet_id;}, set: function(id) {this.network_endpoint_details.subnet_id = id;}, enumerable: true });
        Object.defineProperty(this, 'vcn_id', {get: function() {return this.network_endpoint_details.vcn_id;}, set: function(id) {this.network_endpoint_details.vcn_id = id;}, enumerable: true });
    }
    /*
    ** Clone Functionality
    */
    clone() {
        return new AnalyticsInstance(JSON.clone(this), this.getOkitJson());
    }
    /*
    ** Name Generation
    */
    getNamePrefix() {
        return super.getNamePrefix() + 'ai';
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return 'Analytics Instance';
    }
}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newAnalyticsInstance = function(data) {
    this.getAnalyticsInstances().push(new AnalyticsInstance(data, this));
    return this.getAnalyticsInstances()[this.getAnalyticsInstances().length - 1];
}
OkitJson.prototype.getAnalyticsInstances = function() {
    if (!this.analytics_instances) {
        this.analytics_instances = [];
    }
    return this.analytics_instances;
}
OkitJson.prototype.getAnalyticsInstance = function(id='') {
    for (let artefact of this.getAnalyticsInstances()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
return undefined;
}
OkitJson.prototype.deleteAnalyticsInstance = function(id) {
    for (let i = 0; i < this.analytics_instances.length; i++) {
        if (this.analytics_instances[i].id === id) {
            this.analytics_instances[i].delete();
            this.analytics_instances.splice(i, 1);
            break;
        }
    }
}

