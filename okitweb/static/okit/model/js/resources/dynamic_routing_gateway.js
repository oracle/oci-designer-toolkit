/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Dynamic Routing Gateway Javascript');

/*
** Define Dynamic Routing Gateway Class
 */
class DynamicRoutingGateway extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        // this.display_name = this.generateDefaultName(okitjson.dynamic_routing_gateways.length + 1);
        // this.compartment_id = data.parent_id;
        // this.vcn_id = '';
        this.compartment_id = data.compartment_id;
        this.vcn_id = data.parent_id;
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
        return super.getNamePrefix() + 'drg';
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return 'Dynamic Routing Gateway';
    }

}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newDynamicRoutingGateway = function(data) {
    console.info('New Dynamic Routing Gateway');
    this.getDynamicRoutingGateways().push(new DynamicRoutingGateway(data, this));
    return this.getDynamicRoutingGateways()[this.getDynamicRoutingGateways().length - 1];
}
OkitJson.prototype.getDynamicRoutingGateways = function() {
    if (!this.dynamic_routing_gateways) this.dynamic_routing_gateways = [];
    return this.dynamic_routing_gateways;
}
OkitJson.prototype.getDynamicRoutingGateway = function(id='') {
    for (let artefact of this.getDynamicRoutingGateways()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJson.prototype.deleteDynamicRoutingGateway = function(id) {
    this.dynamic_routing_gateways = this.dynamic_routing_gateways ? this.dynamic_routing_gateways.filter((r) => r.id !== id) : []
}
