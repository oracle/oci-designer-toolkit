/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Designer IPSecConnection View Javascript');

/*
** Define IPSecConnection View Artifact Class
 */
class IPSecConnectionView extends OkitDesignerArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
    }

    get parent_id() {return this.artefact.compartment_id;}
    get parent() {return this.getJsonView().getCompartment(this.parent_id);}
    get top_bottom_connectors_preferred() {return false;}

    /*
     ** SVG Processing
     */
    // Add Specific Mouse Events
    addAssociationHighlighting() {
        if (this.drg_id !== '') {$(jqId(this.drg_id)).addClass('highlight-association');}
        if (this.cpe_id !== '') {$(jqId(this.cpe_id)).addClass('highlight-association');}
        $(jqId(this.artefact_id)).addClass('highlight-association');
    }

    removeAssociationHighlighting() {
        if (this.drg_id !== '') {$(jqId(this.drg_id)).removeClass('highlight-association');}
        if (this.cpe_id !== '') {$(jqId(this.cpe_id)).removeClass('highlight-association');}
        $(jqId(this.artefact_id)).removeClass('highlight-association');
    }

    // Draw Connections
    drawConnections() {
        if (this.cpe_id !== '') {this.drawConnection(this.id, this.cpe_id);}
        if (this.drg_id !== '') {this.drawConnection(this.id, this.drg_id);}
    }

    /*
    ** Property Sheet Load function
     */
    loadProperties() {
        let okitJson = this.getOkitJson();
        let me = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/ipsec_connection.html", () => {
            // Build Dynamic Routing Gateways
            this.loadDynamicRoutingGateways('drg_id');
            // Build Customer Premise Equipments
            this.loadCustomerPremiseEquipments('cpe_id');
            // Load Sheet
            loadPropertiesSheet(me.artefact);
        });
    }

    /*
    ** Load and display Value Proposition
     */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/ipsec_connection.html");
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return IPSecConnection.getArtifactReference();
    }

    static getDropTargets() {
        return [Compartment.getArtifactReference()];
    }

}