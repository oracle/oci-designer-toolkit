/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Designer VirtualNetworkInterface View Javascript');

/*
** Define VirtualNetworkInterface View Artifact Class
 */
class VirtualNetworkInterfaceView extends OkitDesignerArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
    }

    get rect_id() {return this.artefact ? `${this.artefact.id}-vnic` : '';}
    get parent_id() {return this.attached_id;}
    get parent() {return this.attached_id ? this.getJsonView().getInstance(this.parent_id) : null;}

    /*
     ** SVG Processing
     */
    // Add Specific Mouse Events
    addAssociationHighlighting() {
        $(jqId(this.artefact_id)).addClass('highlight-association');
    }

    removeAssociationHighlighting() {
        $(jqId(this.artefact_id)).removeClass('highlight-association');
    }

    /*
    ** Property Sheet Load function
     */
    loadProperties() {
        let me = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/virtual_network_interface.html", () => {
            // Load Referenced Ids
            let route_table_select = $(jqId('route_table_id'));
            route_table_select.append($('<option>').attr('value', '').text(''));
            for (let route_table of me.artefact.getOkitJson().route_tables) {
                if (me.vcn_id === route_table.vcn_id) {
                    route_table_select.append($('<option>').attr('value', route_table.id).text(route_table.display_name));
                }
            }
            let security_lists_select = $(jqId('security_list_ids'));
            for (let security_list of me.artefact.getOkitJson().security_lists) {
                if (me.vcn_id === security_list.vcn_id) {
                    security_lists_select.append($('<option>').attr('value', security_list.id).text(security_list.display_name));
                }
            }
            // Load Properties
            loadPropertiesSheet(me.artefact);}
            );
    }

    /*
    ** Load and display Value Proposition
     */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/virtual_network_interface.html");
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return VirtualNetworkInterface.getArtifactReference();
    }

    static getDropTargets() {
        return [];
    }

}