/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Internet Gateway Javascript');

/*
** Define Internet Gateway Artifact Class
 */
class InternetGateway extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        // this.display_name = this.generateDefaultName(okitjson.internet_gateways.length + 1);
        this.compartment_id = data.compartment_id;
        this.vcn_id = data.parent_id;
        this.enabled = true;
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
        return super.getNamePrefix() + 'ig';
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return 'Internet Gateway';
    }

}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newInternetGateway = function(data) {
    console.info('New Internet Gateway');
    this.getInternetGateways().push(new InternetGateway(data, this));
    return this.getInternetGateways()[this.getInternetGateways().length - 1];
}
OkitJson.prototype.getInternetGateways = function() {
    if (!this.internet_gateways) this.internet_gateways = [];
    return this.internet_gateways;
}
OkitJson.prototype.getInternetGateway = function(id='') {
    for (let artefact of this.getInternetGateways()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJson.prototype.deleteInternetGateway = function(id) {
    this.internet_gateways = this.internet_gateways ? this.internet_gateways.filter((r) => r.id !== id) : []
}
