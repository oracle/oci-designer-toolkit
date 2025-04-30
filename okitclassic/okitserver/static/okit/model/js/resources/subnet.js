/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Subnet Javascript');

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
        this.compartment_id = '';
        this.vcn_id = '';
        this.cidr_block = '';
        // this.dns_label = this.getOkitJson().metadata.platform === 'pca' ? '' : this.generateDnsLabel()
        this.dns_label = this.generateDnsLabel();
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
    }

    /*
    ** Filters
     */
    not_child_filter = (r) => r.subnet_id !== this.id
    child_filter = (r) => r.subnet_id === this.id

    /*
    ** Delete Processing
     */
    deleteReferences() {
        // Instance Volume Attachment
        this.getOkitJson().getInstances().forEach((r) => r.vnic_attachments = r.vnic_attachments.filter((v) => v.subnet_id !== this.id))
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
    generateDnsLabel = () => this.display_name.toLowerCase().replace(/[^a-z]/g, '').slice(0, 15)
    // generateDnsLabel = () => this.display_name.toLowerCase().replaceAll(' ', '').slice(0, 15)

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
