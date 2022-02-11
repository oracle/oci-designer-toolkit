/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Designer DynamicRoutingGateway View Javascript');

/*
** Define DynamicRoutingGateway View Artifact Class
 */
class DynamicRoutingGatewayView extends OkitDesignerArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
    }

    // get parent_id() {return this.artefact.compartment_id;}
    // get parent() {return this.getJsonView().getCompartment(this.parent_id);}
    get parent_id() {return this.artefact.vcn_id && this.artefact.vcn_id !== '' ? this.artefact.vcn_id : this.artefact.compartment_id;}
    get parent() {return this.artefact.vcn_id && this.artefact.vcn_id !== '' ? this.getJsonView().getVirtualCloudNetwork(this.parent_id) : this.getJsonView().getCompartment(this.parent_id);}

    /*
     ** SVG Processing
     */

    /*
    ** Property Sheet Load function
     */
    loadProperties() {
        let okitJson = this.getOkitJson();
        let me = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/dynamic_routing_gateway.html", () => {loadPropertiesSheet(me.artefact);});
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
        return [VirtualCloudNetwork.getArtifactReference()];
        // return [Compartment.getArtifactReference()];
    }


}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropDynamicRoutingGatewayView = function(target) {
    let view_artefact = this.newDynamicRoutingGateway();
    view_artefact.getArtefact().compartment_id = target.id;
    view_artefact.getArtefact().vcn_id = target.id;
    view_artefact.getArtefact().compartment_id = target.compartment_id;
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
