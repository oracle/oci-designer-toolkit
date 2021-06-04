/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Integration Instance Javascript');

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
        this.display_name = this.generateDefaultName(okitjson.integration_instances.length + 1);
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
        return new IntegrationInstance(JSON.clone(this), this.getOkitJson());
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
    if (!this.integration_instances) {
        this.integration_instances = [];
    }
    return this.integration_instances;
}
OkitJson.prototype.getIntegrationInstance = function(id='') {
    for (let artefact of this.getIntegrationInstances()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
return undefined;
}
OkitJson.prototype.deleteIntegrationInstance = function(id) {
    for (let i = 0; i < this.integration_instances.length; i++) {
        if (this.integration_instances[i].id === id) {
            this.integration_instances[i].delete();
            this.integration_instances.splice(i, 1);
            break;
        }
    }
}

