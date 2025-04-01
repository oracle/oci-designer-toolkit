/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Compartment AutonomousDatabase View Javascript');

/*
** Define AutonomousDatabase View Artifact Class
 */
class AutonomousDatabaseView extends OkitCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
    }

    // -- Reference
    get icon_definition_id() {return this.db_workload.startsWith('DW') ? OkitJsonView.toSvgIconDef('AutonomousDataWarehouseCloudService') : super.icon_definition_id;}
    get parent_id() {
        const subnet = this.getJsonView().getSubnet(this.artefact.subnet_id);
        if (subnet && subnet.compartment_id === this.artefact.compartment_id) {
            return this.subnet_id;
        } else {
            return this.compartment_id;
        }
    }
    get parent() {return this.getJsonView().getSubnet(this.parent_id) ? this.getJsonView().getSubnet(this.parent_id) : this.getJsonView().getCompartment(this.parent_id);}
    // Direct Subnet Access
    set subnet_id(id) {this.artefact.subnet_id = id;}
    // ---- Icon
    get icon_definition_id() {return this.resource.db_workload === 'OLTP' ? OkitJsonView.toSvgIconDef('AutonomousTransactionProcessing') : this.resource.db_workload === 'DW' ? OkitJsonView.toSvgIconDef('AutonomousDataWarehouse') : this.resource.db_workload === 'APEX' ? OkitJsonView.toSvgIconDef('AutonomousAPEX') : super.icon_definition_id;}

    /*
     ** SVG Processing
     */
    getLinks() {return super.getLinks().filter((id) => !this.resource.nsg_ids)}
     // Add Specific Mouse Events
    addAssociationHighlighting() {
        for (let id of this.nsg_ids) {$(jqId(id)).addClass('highlight-association');}
        $(jqId(this.artefact_id)).addClass('highlight-association');
    }

    removeAssociationHighlighting() {
        for (let id of this.nsg_ids) {$(jqId(id)).removeClass('highlight-association');}
        $(jqId(this.artefact_id)).removeClass('highlight-association');
    }

    /*
    ** Property Sheet Load function
     */
    newPropertiesSheet() {
        this.properties_sheet = new AutonomousDatabaseProperties(this.artefact)
    }
    loadProperties1() {
        let okitJson = this.getOkitJson();
        let me = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/autonomous_database.html", () => {
            $('#is_free_tier').on('change', () => {
                if($('#is_free_tier').is(':checked')) {
                    $('#license_model').val("LICENSE_INCLUDED");
                    $('#is_auto_scaling_enabled').prop('checked', false);
                    $('#license_model').attr('disabled', true);
                    $('#is_auto_scaling_enabled').attr('disabled', true);
                } else {
                    $('#license_model').removeAttr('disabled');
                    $('#is_auto_scaling_enabled').removeAttr('disabled');
                }
            });
            if (me.is_free_tier) {
                me.artefact.license_model = "LICENSE_INCLUDED";
                me.artefact.is_auto_scaling_enabled =  false;
                $('#license_model').attr('disabled', true);
                $('#is_auto_scaling_enabled').attr('disabled', true);
            }
            // Load Reference Ids
            // Network Security Groups
            this.loadNetworkSecurityGroups('nsg_ids', this.subnet_id);
            // Subnets
            let subnet_select = $(jqId('subnet_id'));
            subnet_select.append($('<option>').attr('value', '').text(''));
            for (let subnet of okitJson.subnets) {
                subnet_select.append($('<option>').attr('value', subnet.id).text(subnet.display_name));
            }
            loadPropertiesSheet(me.artefact);
        });
    }

    /*
    ** Load and display Value Proposition
     */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/autonomous_database.html");
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return AutonomousDatabase.getArtifactReference();
    }

    static getDropTargets() {
        return [Compartment.getArtifactReference(), Subnet.getArtifactReference()];
    }

}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropAutonomousDatabaseView = function(target) {
    let view_artefact = this.newAutonomousDatabase();
    if (target.type === Subnet.getArtifactReference()) {
        view_artefact.getArtefact().subnet_id = target.id;
        view_artefact.getArtefact().compartment_id = target.compartment_id;
    } else if (target.type === Compartment.getArtifactReference()) {
        view_artefact.getArtefact().compartment_id = target.id;
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newAutonomousDatabase = function(database) {
    this.getAutonomousDatabases().push(database ? new AutonomousDatabaseView(database, this) : new AutonomousDatabaseView(this.okitjson.newAutonomousDatabase(), this));
    return this.getAutonomousDatabases()[this.getAutonomousDatabases().length - 1];
}
OkitJsonView.prototype.getAutonomousDatabases = function() {
    if (!this.autonomous_databases) this.autonomous_databases = []
    return this.autonomous_databases;
}
OkitJsonView.prototype.getAutonomousDatabase = function(id='') {
    for (let artefact of this.getAutonomousDatabases()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadAutonomousDatabases = function(autonomous_databases) {
    for (const artefact of autonomous_databases) {
        this.getAutonomousDatabases().push(new AutonomousDatabaseView(new AutonomousDatabase(artefact, this.okitjson), this));
    }
}
