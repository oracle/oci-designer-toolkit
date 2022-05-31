/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Designer MysqlDatabaseSystem View Javascript');

/*
** Define MysqlDatabaseSystem View Artifact Class
 */
class MysqlDatabaseSystemView extends OkitDesignerArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
    }

    get parent_id() {return this.artefact.subnet_id;}
    get parent() {return this.getJsonView().getSubnet(this.parent_id);}
    // Direct Subnet Access
    set subnet_id(id) {this.artefact.subnet_id = id;}

    /*
     ** SVG Processing
     */

    /*
    ** Property Sheet Load function
     */
    loadProperties() {
        let okitJson = this.getOkitJson();
        let me = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/mysql_database_system.html", () => {
            // Load DB System Configurations
            let configuration_select = $(jqId('configuration_id'));
            // Load DB System Shapes
            let shape_select = $(jqId('shape_name'));
            $(shape_select).empty();
            for (let shape of okitOciData.getMySQLShapes()) {
                shape_select.append($('<option>').attr('value', shape.name).text(shape.name));
            }
            $(shape_select).on('change', function() {
                console.info('Selected Shape ' + $(this).val());
                $(configuration_select).empty();
                for (let configuration of okitOciData.getMySQLConfigurations($(this).val())) {
                    configuration_select.append($('<option>').attr('value', configuration.id).text(configuration.display_name));
                }
                $(configuration_select).change();
            });
            // Load MySQL System Versions
            let version_select = $(jqId('mysql_version'));
            $(version_select).empty();
            version_select.append($('<option>').attr('value', '').text('System Default'));
            for (let version of okitOciData.getMySQLVersions()) {
                version_select.append($('<option>').attr('value', version.version).text(version.description));
            }
            // Load Properties
            loadPropertiesSheet(me.artefact);
            // Click Select Lists we have added dynamic on click to
            $(shape_select).change();
        });
    }

    /*
    ** Load and display Value Proposition
     */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/mysql_database_system.html");
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return MysqlDatabaseSystem.getArtifactReference();
    }

    static getDropTargets() {
        return [Subnet.getArtifactReference()];
    }

}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropMysqlDatabaseSystemView = function(target) {
    let view_artefact = this.newMysqlDatabaseSystem();
    view_artefact.getArtefact().subnet_id = target.id;
    view_artefact.getArtefact().compartment_id = target.compartment_id;
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
