/*
** Copyright (c) 2020, Oracle and/or its affiliates.
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
    }


}