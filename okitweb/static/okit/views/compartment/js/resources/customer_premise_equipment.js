/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Compartment CustomerPremiseEquipment View Javascript');

/*
** Define CustomerPremiseEquipment View Artifact Class
 */
class CustomerPremiseEquipmentView extends OkitCompartmentArtefactView {
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
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropCustomerPremiseEquipmentView = function(target) {
    let view_artefact = this.newCustomerPremiseEquipment();
    view_artefact.getArtefact().compartment_id = target.id;
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newCustomerPremiseEquipment = function(connect) {
    this.getCustomerPremiseEquipments().push(connect ? new CustomerPremiseEquipmentView(connect, this) : new CustomerPremiseEquipmentView(this.okitjson.newCustomerPremiseEquipment(), this));
    return this.getCustomerPremiseEquipments()[this.getCustomerPremiseEquipments().length - 1];
}
OkitJsonView.prototype.getCustomerPremiseEquipments = function() {
    if (!this.customer_premise_equipments) this.customer_premise_equipments = []
    return this.customer_premise_equipments;
}
OkitJsonView.prototype.getCustomerPremiseEquipment = function(id='') {
    for (let artefact of this.getCustomerPremiseEquipments()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadCustomerPremiseEquipments = function(fast_connects) {
    for (const artefact of fast_connects) {
        this.getCustomerPremiseEquipments().push(new CustomerPremiseEquipmentView(new CustomerPremiseEquipment(artefact, this.okitjson), this));
    }
}
