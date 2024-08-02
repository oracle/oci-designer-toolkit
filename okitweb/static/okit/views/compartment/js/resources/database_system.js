/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Compartment DatabaseSystem View Javascript');

/*
** Define DatabaseSystem View Artifact Class
 */
class DatabaseSystemView extends OkitCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
    }

    // TODO: Enable when Instance code added
    get attached1() {
        if (!this.attached_id) {
            for (let instance of this.getOkitJson().getInstances()) {
                if (instance.database_system_ids.includes(this.id)) {
                    return true;
                }
            }
        }
        return false;
    }
    // ---- Icon
    get icon_definition_id() {return this.shape.startsWith('Exadata.') ? OkitJsonView.toSvgIconDef('ExadataDatabaseSystem') : super.icon_definition_id;}
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
        this.properties_sheet = new DatabaseSystemProperties(this.artefact)
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return DatabaseSystem.getArtifactReference();
    }

    static getDropTargets() {
        return [Subnet.getArtifactReference(), Compartment.getArtifactReference()];
    }

}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropDatabaseSystemView = function(target) {
    let view_artefact = this.newDatabaseSystem();
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
OkitJsonView.prototype.newDatabaseSystem = function(database) {
    this.getDatabaseSystems().push(database ? new DatabaseSystemView(database, this) : new DatabaseSystemView(this.okitjson.newDatabaseSystem(), this));
    return this.getDatabaseSystems()[this.getDatabaseSystems().length - 1];
}
OkitJsonView.prototype.getDatabaseSystems = function() {
    if (!this.database_systems) this.database_systems = []
    return this.database_systems;
}
OkitJsonView.prototype.getDatabaseSystem = function(id='') {
    for (let artefact of this.getDatabaseSystems()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadDatabaseSystems = function(database_systems) {
    for (const artefact of database_systems) {
        this.getDatabaseSystems().push(new DatabaseSystemView(new DatabaseSystem(artefact, this.okitjson), this));
    }
}
