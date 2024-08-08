/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Compartment RemotePeeringConnection View Javascript');

/*
** Define RemotePeeringConnection View Artifact Class
 */
class RemotePeeringConnectionView extends OkitCompartmentArtefactView {
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
        $(jqId(this.artefact_id)).addClass('highlight-association');
    }

    removeAssociationHighlighting() {
        if (this.drg_id !== '') {$(jqId(this.drg_id)).removeClass('highlight-association');}
        $(jqId(this.artefact_id)).removeClass('highlight-association');
    }
    // Draw Connections
    drawConnections() {
        if (this.drg_id !== '') {this.drawConnection(this.id, this.drg_id);}
    }

    /*
    ** Property Sheet Load function
     */
    loadProperties() {
        let okitJson = this.getOkitJson();
        let me = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/remote_peering_connection.html", () => {
            // Build Dynamic Routing Gateways
            this.getJsonView().loadDrgsSelect('drg_id');
            // this.loadDynamicRoutingGateways('drg_id');
            // Regions
            let region_select = $(jqId('peer_region_name'));
            $(region_select).empty();
            region_select.append($('<option>').attr('value', '').text(''));
            for (const region of okitOciData.getRegions()) {
                region_select.append($('<option>').attr('value', region.id).text(region.display_name));
            }
            // Load Sheet
            loadPropertiesSheet(me.artefact);
        });
    }

    /*
    ** Load and display Value Proposition
     */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/remote_peering_connection.html");
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return RemotePeeringConnection.getArtifactReference();
    }

    static getDropTargets() {
        return [Compartment.getArtifactReference()];
    }

}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropRemotePeeringConnectionView = function(target) {
    let view_artefact = this.newRemotePeeringConnection();
    view_artefact.getArtefact().compartment_id = target.id;
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newRemotePeeringConnection = function(connect) {
    this.getRemotePeeringConnections().push(connect ? new RemotePeeringConnectionView(connect, this) : new RemotePeeringConnectionView(this.okitjson.newRemotePeeringConnection(), this));
    return this.getRemotePeeringConnections()[this.getRemotePeeringConnections().length - 1];
}
OkitJsonView.prototype.getRemotePeeringConnections = function() {
    if (!this.remote_peering_connections) this.remote_peering_connections = []
    return this.remote_peering_connections;
}
OkitJsonView.prototype.getRemotePeeringConnection = function(id='') {
    for (let artefact of this.getRemotePeeringConnections()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadRemotePeeringConnections = function(fast_connects) {
    for (const artefact of fast_connects) {
        this.getRemotePeeringConnections().push(new RemotePeeringConnectionView(new RemotePeeringConnection(artefact, this.okitjson), this));
    }
}
