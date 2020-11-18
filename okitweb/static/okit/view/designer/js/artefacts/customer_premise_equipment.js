/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Designer CustomerPremiseEquipment View Javascript');

/*
** Define CustomerPremiseEquipment View Artifact Class
 */
class CustomerPremiseEquipmentView extends OkitDesignerArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
    }

    get parent_id() {return this.artefact.compartment_id;}
    get parent() {return this.getJsonView().getCompartment(this.parent_id);}

    /*
     ** SVG Processing
     */

    /*
    ** Property Sheet Load function
     */
    loadProperties() {
        let okitJson = this.getOkitJson();
        let me = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/customer_premise_equipment.html", () => {
            // Build CPE Shapes
            let shape_select = $(jqId('cpe_device_shape_id'));
            $(shape_select).empty();
            shape_select.append($('<option>').attr('value', '').text(''));
            for (const shape of okitOciData.getCpeDeviceShapes()) {
                shape_select.append($('<option>').attr('value', shape.id).text(`${shape.cpe_device_info.vendor} (${shape.cpe_device_info.platform_software_version})`));
            }
            // Load Sheet
            loadPropertiesSheet(me.artefact);
        });
    }

    /*
    ** Load and display Value Proposition
     */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/customer_premise_equipment.html");
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return CustomerPremiseEquipment.getArtifactReference();
    }

    static getDropTargets() {
        return [Compartment.getArtifactReference()];
    }

}