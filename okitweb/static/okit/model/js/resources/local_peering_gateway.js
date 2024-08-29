/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Local Peering Gateway Javascript');

/*
** Define Local Peering Gateway Class
 */
class LocalPeeringGateway extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        // this.display_name = this.generateDefaultName(okitjson.local_peering_gateways.length + 1);
        this.compartment_id = '';
        this.vcn_id = data.parent_id;
        this.route_table_id = '';
        this.peer_id = '';
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
        return super.getNamePrefix() + 'lpg';
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return 'Local Peering Gateway';
    }

}

function setPeeredGatewayPeerId(input_id, artefact) {
    if (input_id === 'peer_id' && artefact.peer_id) {
        okitJson.getLocalPeeringGateway(artefact.peer_id).peer_id = artefact.id;
    }
}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newLocalPeeringGateway = function(data) {
    console.info('New Local Peering Gateway');
    this.getLocalPeeringGateways().push(new LocalPeeringGateway(data, this));
    return this.getLocalPeeringGateways()[this.getLocalPeeringGateways().length - 1];
}
OkitJson.prototype.getLocalPeeringGateways = function() {
    if (!this.local_peering_gateways) this.local_peering_gateways = [];
    return this.local_peering_gateways;
}
OkitJson.prototype.getLocalPeeringGateway = function(id='') {
    for (let artefact of this.getLocalPeeringGateways()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJson.prototype.deleteLocalPeeringGateway = function(id) {
    this.local_peering_gateways = this.local_peering_gateways ? this.local_peering_gateways.filter((r) => r.id !== id) : []
}
