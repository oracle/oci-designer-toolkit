/*
** Copyright (c) 2020, Oracle and/or its affiliates.
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
        this.display_name = this.generateDefaultName(okitjson.subnets.length + 1);
        this.compartment_id = '';
        this.vcn_id = data.parent_id;
        this.cidr_block = this.generateCIDR(this.vcn_id);
        this.dns_label = this.display_name.toLowerCase().slice(-5);
        this.prohibit_public_ip_on_vnic = false;
        this.route_table_id = '';
        this.security_list_ids = [];
        this.availability_domain = '0';
        this.is_ipv6enabled = false;
        this.ipv6cidr_block = '';
        // Update with any passed data
        this.merge(data);
        this.convert();
        if (this.availability_domain && this.availability_domain.length > 1) {
            this.region_availability_domain = this.availability_domain;
            this.availability_domain = this.getAvailabilityDomainNumber(this.region_availability_domain);
        }
    }


    /*
    ** Clone Functionality
     */
    clone() {
        return new Subnet(this, this.getOkitJson());
    }


    /*
    ** Delete Processing
     */
    deleteChildren() {
        console.log('Deleting Children of ' + this.getArtifactReference() + ' : ' + this.display_name);
        // Remove Instances
        this.getOkitJson().instances = this.getOkitJson().instances.filter(function(child) {
            if (child.primary_vnic.subnet_id === this.id) {
                console.info('Deleting ' + child.display_name);
                //child.delete();
                return false; // So the filter removes the element
            }
            return true;
        }, this);
        for (let instance of this.getOkitJson().instances) {
            instance.vnics = instance.vnics.filter(function(child) {
                if (child.subnet_id === this.id) {
                    console.info('Deleting ' + child.hostname_label);
                    return false; // So the filter removes the element
                }
                return true;
            }, this);
        }
        // Remove Load Balancers
        this.getOkitJson().load_balancers = this.getOkitJson().load_balancers.filter(function(child) {
            if (child.subnet_id === this.id) {
                console.info('Deleting ' + child.display_name);
                //child.delete();
                return false; // So the filter removes the element
            }
            return true;
        }, this);
        // Remove File Storage Systems
        this.getOkitJson().file_storage_systems = this.getOkitJson().file_storage_systems.filter(function(child) {
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
    generateCIDR(vcn_id) {
        let vcn_cidr = '10.0.0.0/16';
        for (let virtual_cloud_network of this.getOkitJson()['virtual_cloud_networks']) {
            if (virtual_cloud_network['id'] == vcn_id) {
                vcn_cidr = virtual_cloud_network['cidr_block'];
                break;
            }
        }
        let vcn_octets = vcn_cidr.split('/')[0].split('.');
        for (let i = 0; i < this.getOkitJson().subnets.length; i++) {
            if (this.getOkitJson().subnets[i].id === this.id) {
                return vcn_octets[0] + '.' + vcn_octets[1] + '.' + i + '.' + vcn_octets[3] + '/24';
            }
        }
        return vcn_octets[0] + '.' + vcn_octets[1] + '.' + this.getOkitJson().subnets.length + '.' + vcn_octets[3] + '/24';
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
