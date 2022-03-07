/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Subnet Javascript');

/*
** Define Subnet Artifact Class
 */
class Subnet extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={},) {
        super(okitjson);
        // Configure default values
        // this.display_name = this.generateDefaultName(okitjson.subnets.length + 1);
        this.compartment_id = '';
        this.vcn_id = '';
        this.cidr_block = '';
        this.dns_label = `sn${this.display_name.toLowerCase().slice(-6)}`;
        this.prohibit_public_ip_on_vnic = false;
        this.route_table_id = '';
        this.security_list_ids = [];
        this.availability_domain = '0';
        this.is_ipv6enabled = false;
        this.ipv6cidr_block = '';
        this.dhcp_options_id = '';
        // Update with any passed data
        this.merge(data);
        this.convert();
        // if (this.availability_domain && this.availability_domain.length > 1) {
        //     this.region_availability_domain = this.availability_domain;
        //     this.availability_domain = this.getAvailabilityDomainNumber(this.region_availability_domain);
        // }
    }


    /*
    ** Delete Processing
     */
    deleteChildren() {
        console.log('Deleting Children of ' + this.getArtifactReference() + ' : ' + this.display_name);
        // Remove Instances
        this.getOkitJson().getInstances() = this.getOkitJson().getInstances().filter(function(child) {
            if (child.primary_vnic.subnet_id === this.id) {
                console.info('Deleting ' + child.display_name);
                //child.delete();
                return false; // So the filter removes the element
            }
            return true;
        }, this);
        for (let instance of this.getOkitJson().getInstances()) {
            instance.vnics = instance.vnics.filter(function(child) {
                if (child.subnet_id === this.id) {
                    console.info('Deleting ' + child.hostname_label);
                    return false; // So the filter removes the element
                }
                return true;
            }, this);
        }
        // Remove Load Balancers
        this.getOkitJson().getLoadBalancers() = this.getOkitJson().getLoadBalancers().filter(function(child) {
            if (child.subnet_id === this.id) {
                console.info('Deleting ' + child.display_name);
                //child.delete();
                return false; // So the filter removes the element
            }
            return true;
        }, this);
        // Remove File Storage Systems
        this.getOkitJson().getFileStorageSystems() = this.getOkitJson().getFileStorageSystems().filter(function(child) {
            if (child.subnet_id === this.id) {
                console.info('Deleting ' + child.display_name);
                //child.delete();
                return false; // So the filter removes the element
            }
            return true;
        }, this);
        console.log();
    }

    /*
    ** Utility Methods
     */
    generateCIDR() {
        let vcn_cidr = '10.0.0.0/16';
        const vcn = this.getOkitJson().getVirtualCloudNetwork(this.vcn_id);
        if (vcn) {
            vcn_cidr = vcn.cidr_block;
        }
        let vcn_octets = vcn_cidr.split('/')[0].split('.');
        let subnet_cidrs = [];
        for (let subnet of this.getOkitJson().getSubnets()) {
            if (subnet.vcn_id === this.vcn_id && subnet.id !== this.id) {
                subnet_cidrs.push(subnet.cidr_block.split('/')[0]);
            }
        }
        let third_octet = 0;
        let subnet_ip = '';
        do {
            subnet_ip = `${vcn_octets[0]}.${vcn_octets[1]}.${third_octet}.${vcn_octets[3]}`
            third_octet += 1;
        } while (subnet_cidrs.includes(subnet_ip));

        this.cidr_block = `${subnet_ip}/24`;
        return this.cidr_block;
    }


    /*
    ** Container Specific Overrides
     */

    getNamePrefix() {
        return super.getNamePrefix() + 'sn';
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return 'Subnet';
    }
}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newSubnet = function(data) {
    console.info('New Subnet');
    this.getSubnets().push(new Subnet(data, this));
    return this.getSubnets()[this.getSubnets().length - 1];
}
OkitJson.prototype.getSubnets = function() {
    if (!this.subnets) this.subnets = [];
    return this.subnets;
}
OkitJson.prototype.getSubnet = function(id='') {
    for (let artefact of this.getSubnets()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJson.prototype.deleteSubnet = function(id) {
    this.subnets = this.subnets ? this.subnets.filter((r) => r.id !== id) : []
}
