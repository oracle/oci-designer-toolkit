/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded NAT Gateway Javascript');

/*
** Define NAT Gateway Class
 */
class NatGateway extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        // this.display_name = this.generateDefaultName(okitjson.nat_gateways.length + 1);
        this.compartment_id = '';
        this.vcn_id = data.parent_id;
        this.block_traffic = false;
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
        return super.getNamePrefix() + 'ng';
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return 'NAT Gateway';
    }

}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newNatGateway = function(data) {
    console.info('New NAT Gateway');
    this.getNatGateways().push(new NatGateway(data, this));
    return this.getNatGateways()[this.getNatGateways().length - 1];
}
OkitJson.prototype.getNatGateways = function() {
    if (!this.nat_gateways) this.nat_gateways = [];
    return this.nat_gateways;
}
OkitJson.prototype.getNatGateway = function(id='') {
    for (let artefact of this.getNatGateways()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJson.prototype.deleteNatGateway = function(id) {
    this.nat_gateways = this.nat_gateways ? this.nat_gateways.filter((r) => r.id !== id) : []
}
