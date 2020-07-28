/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Virtual Network Interface Javascript');

/*
** Set Artifact Constants
 */

/*
** Define Virtual Network Interface Class
 */
class VirtualNetworkInterface extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.display_name = this.generateDefaultName(okitjson.subnets.length + 1);
        this.compartment_id = '';
        this.instance_id = data.parent_id;
        this.vcn_id = data.parent_id;
        this.cidr_block = '';
        this.dns_label = this.display_name.toLowerCase().slice(-5);
        this.prohibit_public_ip_on_vnic = false;
        this.route_table_id = '';
        this.security_list_ids = [];
        // Update with any passed data
        this.merge(data);
        this.convert();
    }


    /*
    ** Clone Functionality
     */
    clone() {
        return new VirtualNetworkInterface(this, this.getOkitJson());
    }


    /*
    ** Delete Processing
     */
    deleteChildren() {}

    getNamePrefix() {
        return super.getNamePrefix() + 'vnic';
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return 'Virtual Network Interface';
    }

}

