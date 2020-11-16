/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Designer AutonomousDatabase View Javascript');

/*
** Define AutonomousDatabase View Artifact Class
 */
class AutonomousDatabaseView extends OkitDesignerArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
    }

    get parent_id() {
        let subnet = this.getJsonView().getSubnet(this.artefact.subnet_id);
        if (subnet && subnet.compartment_id === this.artefact.compartment_id) {
            console.info('Using Subnet as parent');
            return this.subnet_id;
        } else {
            console.info('Using Compartment as parent');
            return this.compartment_id;
        }
    }
    get parent() {return this.getJsonView().getSubnet(this.parent_id) ? this.getJsonView().getSubnet(this.parent_id) : this.getJsonView().getCompartment(this.parent_id);}


    /*
    ** Clone Functionality
     */
    clone() {
        return new AutonomousDatabaseView(this.artefact, this.getJsonView());
    }


    /*
     ** SVG Processing
     */
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
    loadProperties() {
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