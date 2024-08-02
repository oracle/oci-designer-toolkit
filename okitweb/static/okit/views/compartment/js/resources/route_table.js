/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Compartment RouteTable View Javascript');

/*
** Define RouteTable View Artifact Class
 */
class RouteTableView extends OkitCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
    }

    get attached() {
        if (!this.attached_id) {
            for (let subnet of this.getOkitJson().getSubnets()) {
                if (subnet.route_table_id === this.id) {
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
        this.properties_sheet = new RouteTableProperties(this.artefact)
    }

    /*
    ** Load and display Value Proposition
     */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/route_table.html");
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return RouteTable.getArtifactReference();
    }

    static getDropTargets() {
        return [VirtualCloudNetwork.getArtifactReference(), Subnet.getArtifactReference()];
    }

}
OkitJsonView.prototype.loadRouteTablesSelect = function(select_id, vcn_id, empty_option=false) {
    $(jqId(select_id)).empty();
    const mount_target_select = $(jqId(select_id));
    if (empty_option) {
        mount_target_select.append($('<option>').attr('value', '').text(''));
    }
    for (let mount_target of this.getRouteTables().filter((rt) => rt.vcn_id === vcn_id)) {
        mount_target_select.append($('<option>').attr('value', mount_target.id).text(mount_target.display_name));
    }
}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropRouteTableView = function(target) {
    let view_artefact = this.newRouteTable();
    if (target.type === VirtualCloudNetwork.getArtifactReference()) {
        view_artefact.getArtefact().vcn_id = target.id;
        view_artefact.getArtefact().compartment_id = target.compartment_id;
    } else if (target.type === Subnet.getArtifactReference()) {
        const subnet = this.getOkitJson().getSubnet(target.id)
        view_artefact.getArtefact().vcn_id = subnet.vcn_id;
        view_artefact.getArtefact().compartment_id = target.id;
        subnet.route_table_id = view_artefact.id;
    } else if (target.type === Compartment.getArtifactReference()) {
        view_artefact.getArtefact().compartment_id = target.id;
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newRouteTable = function(routetable) {
    this.getRouteTables().push(routetable ? new RouteTableView(routetable, this) : new RouteTableView(this.okitjson.newRouteTable(), this));
    return this.getRouteTables()[this.getRouteTables().length - 1];
}
OkitJsonView.prototype.getRouteTables = function() {
    if (!this.route_tables) this.route_tables = []
    return this.route_tables;
}
OkitJsonView.prototype.getRouteTable = function(id='') {
    for (let artefact of this.getRouteTables()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadRouteTables = function(route_tables) {
    for (const artefact of route_tables) {
        this.getRouteTables().push(new RouteTableView(new RouteTable(artefact, this.okitjson), this));
    }
}
