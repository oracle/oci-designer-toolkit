/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Integration Instance Javascript');

/*
** Define Integration Instance Class
*/
class IntegrationInstance extends OkitArtifact {
    /*
    ** Create
    */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.compartment_id = data.compartment_id;
        this.integration_instance_type = 'ENTERPRISEX'
        this.is_byol = false
        this.message_packs = 1
        // this.consumption_model = ''
        this.is_file_server_enabled = false
        this.is_visual_builder_enabled = false
        this.shape = 'PRODUCTION'
        this.idcs_at = ''
        // Update with any passed data
        this.merge(data);
        this.convert();
        // TODO: If the Resource is within a Subnet but the subnet_iss is not at the top level then raise it with the following functions if not required delete them.
        // Expose subnet_id at the top level
        // Object.defineProperty(this, 'subnet_id', {get: function() {return this.primary_mount_target.subnet_id;}, set: function(id) {this.primary_mount_target.subnet_id = id;}, enumerable: false });
    }
    /*
    ** Name Generation
    */
    getNamePrefix() {
        return super.getNamePrefix() + 'ii';
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return 'Integration Instance';
    }
}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newIntegrationInstance = function(data) {
    this.getIntegrationInstances().push(new IntegrationInstance(data, this));
    return this.getIntegrationInstances()[this.getIntegrationInstances().length - 1];
}
OkitJson.prototype.getIntegrationInstances = function() {
    if (!this.integration_instances) this.integration_instances = []
    return this.integration_instances;
}
OkitJson.prototype.getIntegrationInstance = function(id='') {
    return this.getIntegrationInstances().find(r => r.id === id)
}
OkitJson.prototype.deleteIntegrationInstance = function(id) {
    this.integration_instances = this.integration_instances ? this.integration_instances.filter((r) => r.id !== id) : []
}

