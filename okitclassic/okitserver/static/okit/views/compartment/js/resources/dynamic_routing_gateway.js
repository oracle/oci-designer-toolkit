/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Compartment DynamicRoutingGateway View Javascript');

/*
** Define DynamicRoutingGateway View Artifact Class
 */
class DynamicRoutingGatewayView extends OkitCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
    }

    get parent_id() {return this.artefact.compartment_id;}
    get parent() {return this.getJsonView().getCompartment(this.parent_id);}
    // get parent_id() {return this.artefact.vcn_id && this.artefact.vcn_id !== '' ? this.artefact.vcn_id : this.artefact.compartment_id;}
    // get parent() {return this.artefact.vcn_id && this.artefact.vcn_id !== '' ? this.getJsonView().getVirtualCloudNetwork(this.parent_id) : this.getJsonView().getCompartment(this.parent_id);}

    /*
     ** SVG Processing
     */

    /*
    ** Property Sheet Load function
    */
    newPropertiesSheet() {
        this.properties_sheet = new DynamicRoutingGatewayProperties(this.artefact)
    }

    /*
    ** Load and display Value Proposition
     */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/dynamic_routing_gateway.html");
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return DynamicRoutingGateway.getArtifactReference();
    }

    static getDropTargets() {
        // return [VirtualCloudNetwork.getArtifactReference()];
        return [Compartment.getArtifactReference()];
    }


}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropDynamicRoutingGatewayView = function(target) {
    let view_artefact = this.newDynamicRoutingGateway();
    view_artefact.getArtefact().compartment_id = target.id;
    // view_artefact.getArtefact().vcn_id = target.id;
    // view_artefact.getArtefact().compartment_id = target.compartment_id;
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newDynamicRoutingGateway = function(gateway) {
    this.getDynamicRoutingGateways().push(gateway ? new DynamicRoutingGatewayView(gateway, this) : new DynamicRoutingGatewayView(this.okitjson.newDynamicRoutingGateway(), this));
    return this.getDynamicRoutingGateways()[this.getDynamicRoutingGateways().length - 1];
}
OkitJsonView.prototype.getDynamicRoutingGateways = function() {
    if (!this.dynamic_routing_gateways) this.dynamic_routing_gateways = []
    return this.dynamic_routing_gateways;
}
OkitJsonView.prototype.getDynamicRoutingGateway = function(id='') {
    for (let artefact of this.getDynamicRoutingGateways()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadDynamicRoutingGateways = function(dynamic_routing_gateways) {
    for (const artefact of dynamic_routing_gateways) {
        this.getDynamicRoutingGateways().push(new DynamicRoutingGatewayView(new DynamicRoutingGateway(artefact, this.okitjson), this));
    }
}
OkitJsonView.prototype.loadDynamicRoutingGatewaysSelect = function(id, empty_option=false) {
    // Build Dynamic Routing Gateways
    let drg_select = $(jqId(id));
    $(drg_select).empty();
    if (empty_option) drg_select.append($('<option>').attr('value', '').text(''));
    for (const drg of this.getOkitJson().getDynamicRoutingGateways()) {
        drg_select.append($('<option>').attr('value', drg.id).text(drg.display_name));
    }
}
OkitArtefactView.prototype.loadDynamicRoutingGatewaysSelect = function(id, empty=true) {this.getJsonView().loadDynamicRoutingGatewaysSelect(id, empty)}
OkitArtefactView.prototype.loadDynamicRoutingGatewaySelect = function(id, empty=true) {this.getJsonView().loadDynamicRoutingGatewaysSelect(id, empty)}
