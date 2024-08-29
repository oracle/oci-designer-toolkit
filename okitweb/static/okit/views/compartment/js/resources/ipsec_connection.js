/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Compartment IpsecConnection View Javascript');

/*
** Define IpsecConnection View Artifact Class
 */
class IpsecConnectionView extends OkitCompartmentArtefactView {
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
            this.getJsonView().loadDrgsSelect('drg_id');
            // this.loadDynamicRoutingGateways('drg_id');
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
        return IpsecConnection.getArtifactReference();
    }

    static getDropTargets() {
        return [Compartment.getArtifactReference()];
    }

}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropIpsecConnectionView = function(target) {
    let view_artefact = this.newIpsecConnection();
    view_artefact.getArtefact().compartment_id = target.id;
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newIpsecConnection = function(connect) {
    this.getIpsecConnections().push(connect ? new IpsecConnectionView(connect, this) : new IpsecConnectionView(this.okitjson.newIpsecConnection(), this));
    return this.getIpsecConnections()[this.getIpsecConnections().length - 1];
}
OkitJsonView.prototype.getIpsecConnections = function() {
    if (!this.ipsec_connections) this.ipsec_connections = []
    return this.ipsec_connections;
}
OkitJsonView.prototype.getIpsecConnection = function(id='') {
    for (let artefact of this.getIpsecConnections()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadIpsecConnections = function(fast_connects) {
    for (const artefact of fast_connects) {
        this.getIpsecConnections().push(new IpsecConnectionView(new IpsecConnection(artefact, this.okitjson), this));
    }
}
