/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Compartment SecurityList View Javascript');

/*
** Define SecurityList View Artifact Class
 */
class SecurityListView extends OkitCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
    }

    get attached() {
        if (!this.attached_id) {
            for (let subnet of this.getOkitJson().getSubnets()) {
                if (subnet.security_list_ids.includes(this.id)) {
                    return true;
                }
            }
        }
        return false;
    }
    get parent_id() {return this.attached_id ? this.attached_id : this.artefact.vcn_id;}
    get parent() {return this.attached_id ? this.getJsonView().getSubnet(this.parent_id) : this.getJsonView().getVirtualCloudNetwork(this.parent_id);}

    /*
     ** SVG Processing
     */

    /*
    ** Property Sheet Load function
     */
    newPropertiesSheet() {
        this.properties_sheet = new SecurityListProperties(this.artefact)
    }

    /*
    ** Load and display Value Proposition
     */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/security_list.html");
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return SecurityList.getArtifactReference();
    }

    static getDropTargets() {
        return [VirtualCloudNetwork.getArtifactReference(), Subnet.getArtifactReference()];
    }

}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropSecurityListView = function(target) {
    let view_artefact = this.newSecurityList();
    if (target.type === VirtualCloudNetwork.getArtifactReference()) {
        view_artefact.getArtefact().vcn_id = target.id;
        view_artefact.getArtefact().compartment_id = target.compartment_id;
    } else if (target.type === Subnet.getArtifactReference()) {
        const subnet = this.getOkitJson().getSubnet(target.id)
        view_artefact.getArtefact().vcn_id = subnet.vcn_id;
        view_artefact.getArtefact().compartment_id = target.id;
        subnet.security_list_ids.push(view_artefact.id);
    } else if (target.type === Compartment.getArtifactReference()) {
        view_artefact.getArtefact().compartment_id = target.id;
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newSecurityList = function(security) {
    this.getSecurityLists().push(security ? new SecurityListView(security, this) : new SecurityListView(this.okitjson.newSecurityList(), this));
    return this.getSecurityLists()[this.getSecurityLists().length - 1];
}
OkitJsonView.prototype.getSecurityLists = function() {
    if (!this.security_lists) this.security_lists = []
    return this.security_lists;
}
OkitJsonView.prototype.getSecurityList = function(id='') {
    for (let artefact of this.getSecurityLists()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadSecurityLists = function(security_lists) {
    for (const artefact of security_lists) {
        this.getSecurityLists().push(new SecurityListView(new SecurityList(artefact, this.okitjson), this));
    }
}
