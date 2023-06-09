/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Autoscaling Configuration Javascript');

/*
** Define Autoscaling Configuration Class
*/
class AutoscalingConfiguration extends OkitArtifact {
    /*
    ** Create
    */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
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
    ** Name Generation
    */
    getNamePrefix() {
        return super.getNamePrefix() + 'ac';
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return 'Autoscaling Configuration';
    }
}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newAutoscalingConfiguration = function(data) {
    this.getAutoscalingConfigurations().push(new AutoscalingConfiguration(data, this));
    return this.getAutoscalingConfigurations()[this.getAutoscalingConfigurations().length - 1];
}
OkitJson.prototype.getAutoscalingConfigurations = function() {
    if (!this.autoscaling_configurations) this.autoscaling_configurations = []
    return this.autoscaling_configurations;
}
OkitJson.prototype.getAutoscalingConfiguration = function(id='') {
    return this.getAutoscalingConfigurations().find(r => r.id === id)
}
OkitJson.prototype.deleteAutoscalingConfiguration = function(id) {
    this.autoscaling_configurations = this.autoscaling_configurations ? this.autoscaling_configurations.filter((r) => r.id !== id) : []
}

