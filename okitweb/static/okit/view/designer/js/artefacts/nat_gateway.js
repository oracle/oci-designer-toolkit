/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Designer NATGateway View Javascript');

/*
** Define NATGateway View Artifact Class
 */
class NATGatewayView extends OkitDesignerArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
    }

    get parent_id() {return this.artefact.vcn_id;}
    get parent() {return this.getJsonView().getVirtualCloudNetwork(this.parent_id);}

    /*
     ** SVG Processing
     */

    /*
    ** Property Sheet Load function
     */
    loadProperties() {
        let okitJson = this.getOkitJson();
        let me = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/nat_gateway.html", () => {loadPropertiesSheet(me.artefact);});
    }

    /*
    ** Load and display Value Proposition
     */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/nat_gateway.html");
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return NATGateway.getArtifactReference();
    }

    static getDropTargets() {
        return [VirtualCloudNetwork.getArtifactReference()];
    }

}