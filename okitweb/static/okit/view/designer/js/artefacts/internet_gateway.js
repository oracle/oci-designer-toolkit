/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Designer InternetGateway View Javascript');

/*
** Define InternetGateway View Artifact Class
 */
class InternetGatewayView extends OkitDesignerArtefactView {
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
    loadProperties() {
        let okitJson = this.getOkitJson();
        let me = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/internet_gateway.html", () => {loadPropertiesSheet(me.artefact);});
    }

    /*
    ** Load and display Value Proposition
     */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/internet_gateway.html");
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return InternetGateway.getArtifactReference();
    }

    static getDropTargets() {
        return [VirtualCloudNetwork.getArtifactReference()];
    }
    
}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropInternetGatewayView = function(target) {
    // Check if Gateway Already exists
    for (let gateway of this.internet_gateways) {
        if (gateway.vcn_id === target.id) {
            alert('The maximum limit of 1 Internet Gateway per Virtual Cloud Network has been exceeded for ' + this.getVirtualCloudNetwork(target.id).display_name);
            return null;
        }
    }
    let view_artefact = this.newInternetGateway();
    view_artefact.getArtefact().vcn_id = target.id;
    view_artefact.getArtefact().compartment_id = target.compartment_id;
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newInternetGateway = function(gateway) {
    let ig = gateway ? new InternetGatewayView(gateway, this) : new InternetGatewayView(this.okitjson.newInternetGateway(), this);
    if (ig.artefact === null) {
        return null;
    }
    this.getInternetGateways().push(ig);
    return this.getInternetGateways()[this.getInternetGateways().length - 1];
}
OkitJsonView.prototype.getInternetGateways = function() {
    if (!this.internet_gateways) this.internet_gateways = []
    return this.internet_gateways;
}
OkitJsonView.prototype.getInternetGateway = function(id='') {
    for (let artefact of this.getInternetGateways()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadInternetGateways = function(internet_gateways) {
    for (const artefact of internet_gateways) {
        this.getInternetGateways().push(new InternetGatewayView(new InternetGateway(artefact, this.okitjson), this));
    }
}
