/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
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
        // this.display_name = this.generateDefaultName(okitjson.network_security_groups.length + 1);
        this.compartment_id = '';
        this.vcn_id = data.parent_id;
        this.security_rules = [];
        // Update with any passed data
        this.merge(data);
        this.convert();
    }


    /*
    ** Delete Processing
     */
    deleteChildren() {
        // Remove Instance vnic references
        for (let instance of this.getOkitJson().getInstances()) {
            for (let vnic of instance.vnics) {
                for (let i = 0; i < vnic.nsg_ids.length; i++) {
                    if (vnic.nsg_ids[i] === this.id) {
                        vnic.nsg_ids.splice(i, 1);
                    }
                }
            }
        }
    }
    deleteReferences() {
        // Instance VNIC Reference
        this.getOkitJson().getInstances().forEach((r) => r.vnics.forEach((v) => v.nsg_ids = v.nsg_ids.filter((id) => id !== this.id)))
        // Mount Target Reference
        this.getOkitJson().getMountTargets().forEach((r) => r.nsg_ids = r.nsg_ids.filter((id) => id !== this.id))
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
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newNetworkSecurityGroup = function(data) {
    console.info('New Network Security Group');
    this.getNetworkSecurityGroups().push(new NetworkSecurityGroup(data, this));
    return this.getNetworkSecurityGroups()[this.getNetworkSecurityGroups().length - 1];
}
OkitJson.prototype.getNetworkSecurityGroups = function() {
    if (!this.network_security_groups) this.network_security_groups = [];
    return this.network_security_groups;
}
OkitJson.prototype.getNetworkSecurityGroup = function(id='') {
    for (let artefact of this.getNetworkSecurityGroups()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJson.prototype.deleteNetworkSecurityGroup = function(id) {
    this.network_security_groups = this.network_security_groups ? this.network_security_groups.filter((r) => r.id !== id) : []
}
