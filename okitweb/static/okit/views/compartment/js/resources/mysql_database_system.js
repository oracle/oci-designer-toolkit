/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Compartment MysqlDatabaseSystem View Javascript');

/*
** Define MysqlDatabaseSystem View Artifact Class
 */
class MysqlDatabaseSystemView extends OkitCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
    }

    get parent_id() {
        let primary_subnet = this.getJsonView().getSubnet(this.artefact.subnet_id);
        if (primary_subnet && primary_subnet.compartment_id === this.artefact.compartment_id) {
            return this.artefact.subnet_id;
        } else {
            return this.artefact.compartment_id;
        }
    }
    get parent() {return this.getJsonView().getSubnet(this.parent_id) ? this.getJsonView().getSubnet(this.parent_id) : this.getJsonView().getCompartment(this.parent_id);}
    // Direct Subnet Access
    set subnet_id(id) {this.artefact.subnet_id = id;}

    /*
     ** SVG Processing
     */

    /*
    ** Property Sheet Load function
     */
    newPropertiesSheet() {
        this.properties_sheet = new MysqlDatabaseSystemProperties(this.artefact)
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return MysqlDatabaseSystem.getArtifactReference();
    }

    static getDropTargets() {
        return [Subnet.getArtifactReference(), Compartment.getArtifactReference()];
    }

}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropMysqlDatabaseSystemView = function(target) {
    let view_artefact = this.newMysqlDatabaseSystem();
    // view_artefact.getArtefact().subnet_id = target.id;
    // view_artefact.getArtefact().compartment_id = target.compartment_id;
    if (target.type === Subnet.getArtifactReference()) {
        view_artefact.getArtefact().subnet_id = target.id;
        view_artefact.getArtefact().compartment_id = target.compartment_id;
    } else if (target.type === Compartment.getArtifactReference()) {
        view_artefact.getArtefact().compartment_id = target.id;
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newMysqlDatabaseSystem = function(database) {
    this.getMysqlDatabaseSystems().push(database ? new MysqlDatabaseSystemView(database, this) : new MysqlDatabaseSystemView(this.okitjson.newMysqlDatabaseSystem(), this));
    return this.getMysqlDatabaseSystems()[this.getMysqlDatabaseSystems().length - 1];
}
OkitJsonView.prototype.getMysqlDatabaseSystems = function() {
    if (!this.mysql_database_systems) this.mysql_database_systems = []
    return this.mysql_database_systems;
}
OkitJsonView.prototype.getMysqlDatabaseSystem = function(id='') {
    for (let artefact of this.getMysqlDatabaseSystems()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadMysqlDatabaseSystems = function(database_systems) {
    for (const artefact of database_systems) {
        this.getMysqlDatabaseSystems().push(new MysqlDatabaseSystemView(new MysqlDatabaseSystem(artefact, this.okitjson), this));
    }
}
