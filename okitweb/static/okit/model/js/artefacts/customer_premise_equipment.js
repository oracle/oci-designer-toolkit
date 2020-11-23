/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded CustomerPremiseEquipment Javascript');

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
        this.display_name = this.generateDefaultName(okitjson.customer_premise_equipments.length + 1);
        this.compartment_id = data.parent_id;
        this.ip_address = '';
        this.cpe_device_shape_id = '';
        // Update with any passed data
        this.merge(data);
        this.convert();
    }


    /*
    ** Clone Functionality
     */
    clone() {
        return new CustomerPremiseEquipment(this, this.getOkitJson());
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
