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
        /*
        ** TODO: Add Resource / Artefact specific parameters and default
resource "oci_analytics_analytics_instance" "test_analytics_instance" {
    #Required
    capacity {
        #Required
        capacity_type = var.analytics_instance_capacity_capacity_type
        capacity_value = var.analytics_instance_capacity_capacity_value
    }
    compartment_id = var.compartment_id
    feature_set = var.analytics_instance_feature_set
    idcs_access_token = var.analytics_instance_idcs_access_token
    license_type = var.analytics_instance_license_type
    name = var.analytics_instance_name

    #Optional
    defined_tags = {"Operations.CostCenter"= "42"}
    description = var.analytics_instance_description
    email_notification = var.analytics_instance_email_notification
    freeform_tags = {"Department"= "Finance"}
    network_endpoint_details {
        #Required
        network_endpoint_type = var.analytics_instance_network_endpoint_details_network_endpoint_type

        #Optional
        subnet_id = oci_core_subnet.test_subnet.id
        vcn_id = oci_core_vcn.test_vcn.id
        whitelisted_ips = var.analytics_instance_network_endpoint_details_whitelisted_ips
        whitelisted_vcns {

            #Optional
            id = var.analytics_instance_network_endpoint_details_whitelisted_vcns_id
            whitelisted_ips = var.analytics_instance_network_endpoint_details_whitelisted_vcns_whitelisted_ips
        }
    }
}        */
        this.feature_set = '';
        this.idcs_access_token = '';
        this.license_type = '';
        this.capacity = {
            capacity_type: '',
            capacity_value: ''
        }
        this.description = '';
        this.network_endpoint_details = {
            subnet_id: ''
        }
        // Update with any passed data
        this.merge(data);
        this.convert();
        // TODO: If the Resource is within a Subnet but the subnet_iss is not at the top level then raise it with the following functions if not required delete them.
        // Expose subnet_id at the top level
        Object.defineProperty(this, 'subnet_id', {get: function() {return this.network_endpoint_details.subnet_id;}, set: function(id) {this.network_endpoint_details.subnet_id = id;}, enumerable: false });
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

