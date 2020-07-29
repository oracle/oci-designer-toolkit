/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Network Security Group Javascript');

/*
** Define Network Security Group Class
 */
class NetworkSecurityGroup extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.display_name = this.generateDefaultName(okitjson.network_security_groups.length + 1);
        this.compartment_id = '';
        this.vcn_id = data.parent_id;
        this.security_rules = [];
        // Update with any passed data
        this.merge(data);
        this.convert();
    }


    /*
    ** Clone Functionality
     */
    clone() {
        return new NetworkSecurityGroup(this, this.getOkitJson());
    }


    /*
    ** Delete Processing
     */
    deleteChildren() {
        // Remove Instance vnic references
        for (let instance of this.getOkitJson().instances) {
            for (let vnic of instance.vnics) {
                for (let i = 0; i < vnic.nsg_ids.length; i++) {
                    if (vnic.nsg_ids[i] === this.id) {
                        vnic.nsg_ids.splice(i, 1);
                    }
                }
            }
        }
    }

    getNamePrefix() {
        return super.getNamePrefix() + 'nsg';
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return 'Network Security Group';
    }

}
