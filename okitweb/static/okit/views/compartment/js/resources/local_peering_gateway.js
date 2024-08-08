/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Compartment LocalPeeringGateway View Javascript');

/*
** Define LocalPeeringGateway View Artifact Class
 */
class LocalPeeringGatewayView extends OkitCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
    }

    get parent_id() {return this.artefact.vcn_id;}
    get parent() {return this.getJsonView().getVirtualCloudNetwork(this.parent_id);}

    /*
     ** SVG Processing
     */
    // Add Specific Mouse Events
    addAssociationHighlighting() {
        if (this.peer_id !== '') {$(jqId(this.peer_id)).addClass('highlight-association');}
        $(jqId(this.artefact_id)).addClass('highlight-association');
    }

    removeAssociationHighlighting() {
        if (this.peer_id !== '') {$(jqId(this.peer_id)).removeClass('highlight-association');}
        $(jqId(this.artefact_id)).removeClass('highlight-association');
    }
    // Draw Connections
    drawConnections() {
        if (this.peer_id !== '') {this.drawConnection(this.id, this.peer_id);}
    }

    /*
    ** Property Sheet Load function
     */
    newPropertiesSheet() {
        this.properties_sheet = new LocalPeeringGatewayProperties(this.artefact)
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return LocalPeeringGateway.getArtifactReference();
    }

    static getDropTargets() {
        return [VirtualCloudNetwork.getArtifactReference()];
    }

}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropLocalPeeringGatewayView = function(target) {
    let view_artefact = this.newLocalPeeringGateway();
    view_artefact.getArtefact().vcn_id = target.id;
    view_artefact.getArtefact().compartment_id = target.compartment_id;
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newLocalPeeringGateway = function(gateway) {
    this.getLocalPeeringGateways().push(gateway ? new LocalPeeringGatewayView(gateway, this) : new LocalPeeringGatewayView(this.okitjson.newLocalPeeringGateway(), this));
    return this.getLocalPeeringGateways()[this.getLocalPeeringGateways().length - 1];
}
OkitJsonView.prototype.getLocalPeeringGateways = function() {
    if (!this.local_peering_gateways) this.local_peering_gateways = []
    return this.local_peering_gateways;
}
OkitJsonView.prototype.getLocalPeeringGateway = function(id='') {
    for (let artefact of this.getLocalPeeringGateways()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadLocalPeeringGateways = function(local_peering_gateways) {
    for (const artefact of local_peering_gateways) {
        this.getLocalPeeringGateways().push(new LocalPeeringGatewayView(new LocalPeeringGateway(artefact, this.okitjson), this));
    }
}
