/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Compartment NatGateway View Javascript');

/*
** Define NatGateway View Artifact Class
 */
class NatGatewayView extends OkitCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
    }

    get parent_id() {return this.artefact.vcn_id;}
    get parent() {return this.getJsonView().getVirtualCloudNetwork(this.parent_id);}
    // ---- Okit View Functions
    get cloneable() {return false;}

    /*
     ** SVG Processing
     */

    /*
    ** Property Sheet Load function
     */
    newPropertiesSheet() {
        this.properties_sheet = new NatGatewayProperties(this.artefact)
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return NatGateway.getArtifactReference();
    }

    static getDropTargets() {
        return [VirtualCloudNetwork.getArtifactReference()];
    }

}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropNatGatewayView = function(target) {
    // Check if Gateway Already exists
    for (let gateway of this.nat_gateways) {
        if (gateway.vcn_id === target.id) {
            alert('The maximum limit of 1 NAT Gateway per Virtual Cloud Network has been exceeded for ' + this.getVirtualCloudNetwork(target.id).display_name);
            return null;
        }
    }
    let view_artefact = this.newNatGateway();
    view_artefact.getArtefact().vcn_id = target.id;
    view_artefact.getArtefact().compartment_id = target.compartment_id;
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newNatGateway = function(gateway) {
    let ng = gateway ? new NatGatewayView(gateway, this) : new NatGatewayView(this.okitjson.newNatGateway(), this);
    if (ng.artefact === null) {
        return null;
    }
    this.getNatGateways().push(ng);
    return this.getNatGateways()[this.getNatGateways().length - 1];
}
OkitJsonView.prototype.getNatGateways = function() {
    if (!this.nat_gateways) this.nat_gateways = []
    return this.nat_gateways;
}
OkitJsonView.prototype.getNatGateway = function(id='') {
    for (let artefact of this.getNatGateways()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadNatGateways = function(nat_gateways) {
    for (const artefact of nat_gateways) {
        this.getNatGateways().push(new NatGatewayView(new NatGateway(artefact, this.okitjson), this));
    }
}
