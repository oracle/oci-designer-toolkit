/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded CustomerPremiseEquipment Javascript');

/*
** Define Block Storage Volume Class
 */
class CustomerPremiseEquipment extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        // this.display_name = this.generateDefaultName(okitjson.customer_premise_equipments.length + 1);
        this.compartment_id = data.parent_id;
        this.ip_address = '';
        this.cpe_device_shape_id = '';
        // Update with any passed data
        this.merge(data);
        this.convert();
    }


    /*
    ** Delete Processing
     */


    getNamePrefix() {
        return super.getNamePrefix() + 'cpe';
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return 'Customer Premise Equipment';
    }

}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newCustomerPremiseEquipment = function(data = {}) {
    console.info('New CustomerPremiseEquipment');
    this.getCustomerPremiseEquipments().push(new CustomerPremiseEquipment(data, this));
    return this.getCustomerPremiseEquipments()[this.getCustomerPremiseEquipments().length - 1];
}
OkitJson.prototype.getCustomerPremiseEquipments = function() {
    if (!this.customer_premise_equipments) this.customer_premise_equipments = [];
    return this.customer_premise_equipments;
}
OkitJson.prototype.getCustomerPremiseEquipment = function(id='') {
    for (let artefact of this.getCustomerPremiseEquipments()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJson.prototype.deleteCustomerPremiseEquipment = function(id) {
    this.customer_premise_equipments = this.customer_premise_equipments ? this.customer_premise_equipments.filter((r) => r.id !== id) : []
}
