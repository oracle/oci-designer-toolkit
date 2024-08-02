/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Network Security Group Javascript');

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

    get egress_rules() {return this.security_rules.filter((r) => r.direction === 'EGRESS')}
    get ingress_rules() {return this.security_rules.filter((r) => r.direction === 'INGRESS')}
    get egress_security_rules() {return this.security_rules.filter((r) => r.direction === 'EGRESS')}
    get ingress_security_rules() {return this.security_rules.filter((r) => r.direction === 'INGRESS')}

    convert() {
        super.convert()
        this.security_rules.forEach((r, i) => {if (!r.resource_name) r.resource_name = `${this.resource_name}_Rule${i+1}`})
    }
    /*
    ** Create Security Rule Elements
    */
    newSecurityRule() {
        return {
            resource_name: `${this.generateResourceName()}Rule`,
            direction: "INGRESS", 
            protocol: "all", 
            is_stateless: false, 
            description: "",
            source_type: "CIDR_BLOCK", 
            source: "0.0.0.0/0"
        }
    }

    newIngressRule() {
        return {
            resource_name: `${this.generateResourceName()}Rule`,
            direction: "INGRESS", 
            protocol: "all", 
            is_stateless: false, 
            description: "",
            destination_type: "CIDR_BLOCK", 
            destination: "0.0.0.0/0"
        }
    }

    newEgressRule() {
        return {
            resource_name: `${this.generateResourceName()}Rule`,
            direction: "EGRESS", 
            protocol: "all", 
            is_stateless: false, 
            description: "",
            source_type: "CIDR_BLOCK", 
            source: "0.0.0.0/0",
            destination_type: "CIDR_BLOCK", 
            destination: "0.0.0.0/0"
        }
    }

    newTcpOptions() {
        return {
            source_port_range: this.newPortRange(),
            destination_port_range: this.newPortRange()
        }
    }

    newUdpOptions() {
        return {
            source_port_range: this.newPortRange(),
            destination_port_range: this.newPortRange()
        }
    }

    newPortRange() {
        return {
            min: '',
            max: ''
        }
    }

    newIcmpOptions() {
        return {
            type: '3',
            code: '4'
        }
    }

    /*
    ** Delete Processing
     */
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
