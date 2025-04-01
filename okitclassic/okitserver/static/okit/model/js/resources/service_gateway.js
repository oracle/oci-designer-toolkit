/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Service Gateway Javascript');

/*
** Define ServiceGateway Class
 */
class ServiceGateway extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        // this.display_name = this.generateDefaultName(okitjson.service_gateways.length + 1);
        this.compartment_id = data.compartment_id;
        this.vcn_id = data.parent_id;
        this.service_name = '';
        // this.autonomous_database_ids = [];
        // this.object_storage_bucket_ids = [];
        this.route_table_id = '';
        // Update with any passed data
        this.merge(data);
        this.convert();
    }


    /*
    ** Delete Processing
     */
    deleteReferences() {
        // Remove Route Rules
        this.getOkitJson().getRouteTables().forEach((rt) => rt.route_rules = rt.route_rules.filter((d) => d.network_entity_id !== this.id))        
    }

    getNamePrefix() {
        return super.getNamePrefix() + 'sg';
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return 'Service Gateway';
    }

}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newServiceGateway = function(data) {
    console.info('New Service Gateway');
    this.getServiceGateways().push(new ServiceGateway(data, this));
    return this.getServiceGateways()[this.getServiceGateways().length - 1];
}
OkitJson.prototype.getServiceGateways = function() {
    if (!this.service_gateways) this.service_gateways = [];
    return this.service_gateways;
}
OkitJson.prototype.getServiceGateway = function(id='') {
    for (let artefact of this.getServiceGateways()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJson.prototype.deleteServiceGateway = function(id) {
    this.service_gateways = this.service_gateways ? this.service_gateways.filter((r) => r.id !== id) : []
}
