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

    getParent() {
        return this.parent;
    }

    getParentId() {
        return this.parent_id;
    }

    /*
     ** SVG Processing
     */
    // Return Artifact Specific Definition.
    getSvgDefinition() {
        let definition = this.newSVGDefinition(this, this.getArtifactReference());
        if (this.getParent()) {
            let first_child = this.getParent().getChildOffset(this.getArtifactReference());
            definition['svg']['x'] = first_child.dx;
            definition['svg']['y'] = first_child.dy;
            definition['svg']['width'] = this.dimensions['width'];
            definition['svg']['height'] = this.dimensions['height'];
            definition['rect']['stroke']['colour'] = stroke_colours.bark;
            definition['rect']['stroke']['dash'] = 1;
        }
        return definition;
    }


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