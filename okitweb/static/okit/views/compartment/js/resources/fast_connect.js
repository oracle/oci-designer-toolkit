/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Compartment FastConnect View Javascript');

/*
** Define FastConnect View Artifact Class
 */
class FastConnectView extends OkitCompartmentArtefactView {
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
        let me = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/fast_connect.html", () => {
            // Load DRG Select
            me.loadDynamicRoutingGatewaySelect('gateway_id');
            loadPropertiesSheet(me.artefact);
        });
    }

    /*
    ** Load and display Value Proposition
     */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/fast_connect.html");
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return FastConnect.getArtifactReference();
    }

    static getDropTargets() {
        return [Compartment.getArtifactReference()];
    }


}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropFastConnectView = function(target) {
    let view_artefact = this.newFastConnect();
    view_artefact.getArtefact().compartment_id = target.id;
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newFastConnect = function(connect) {
    this.getFastConnects().push(connect ? new FastConnectView(connect, this) : new FastConnectView(this.okitjson.newFastConnect(), this));
    return this.getFastConnects()[this.getFastConnects().length - 1];
}
OkitJsonView.prototype.getFastConnects = function() {
    if (!this.fast_connects) this.fast_connects = []
    return this.fast_connects;
}
OkitJsonView.prototype.getFastConnect = function(id='') {
    for (let artefact of this.getFastConnects()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadFastConnects = function(fast_connects) {
    for (const artefact of fast_connects) {
        this.getFastConnects().push(new FastConnectView(new FastConnect(artefact, this.okitjson), this));
    }
}
