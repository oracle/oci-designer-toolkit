/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Virtual Cloud Network Javascript');

/*
** Define Virtual Cloud Network Artifact Class
 */
class VirtualCloudNetwork extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.display_name = this.generateDefaultName(okitjson.virtual_cloud_networks.length + 1);
        this.compartment_id = data.parent_id;
        // Generate Cidr
        this.cidr_blocks = [''];
        this.dns_label = this.display_name.toLowerCase().slice(-6);
        this.is_ipv6enabled = false;
        this.ipv6cidr_blocks = [''];
        // Update with any passed data
        this.merge(data);
        this.convert();
        Object.defineProperty(this, 'cidr_block', {get: function() {return this.cidr_blocks[0];}, set: function(cidr) {this.cidr_blocks[0] = cidr;}, enumerable: false });

    }

    /*
    ** Conversion Routine allowing loading of old json
     */
    convert() {
        super.convert();
        if (this.cidr_block !== undefined && this.cidr_block !== '') {
            if (this.cidr_blocks === undefined || this.cidr_blocks.length === 0 || (this.cidr_blocks.length === 1 && this.cidr_blocks[0] === '')) this.cidr_blocks = [this.cidr_block];
            else if (this.cidr_blocks.indexOf(this.cidr_block) < 0) this.cidr_blocks.push(this.cidr_block);
            delete this.cidr_block;
        }
        if (this.ipv6cidr_block !== undefined && this.ipv6cidr_block !== '') {
            if (this.ipv6cidr_blocks === undefined || this.ipv6cidr_blocks.length === 0 || (this.ipv6cidr_blocks.length === 1 && this.ipv6cidr_blocks[0] === '')) this.ipv6cidr_blocks = [this.ipv6cidr_block];
            else if (this.ipv6cidr_blocks.indexOf(this.ipv6cidr_block) < 0) this.ipv6cidr_blocks.push(this.ipv6cidr_block);
            delete this.ipv6cidr_block;
        }
    }

    /*
    ** Clone Functionality
     */
    clone() {
        return new VirtualCloudNetwork(JSON.clone(this), this.getOkitJson());
    }


    /*
    ** Delete Processing
     */
    deleteChildren() {
        console.log('Deleting Children of ' + this.getArtifactReference() + ' : ' + this.display_name);
        // Remove Subnets
        this.getOkitJson().subnets = this.getOkitJson().subnets.filter(function(child) {
            if (child.vcn_id === this.id) {
                console.info('Deleting ' + child.display_name);
                child.delete();
                return false; // So the filter removes the element
            }
            return true;
        }, this);
        // Remove Route_tables
        this.getOkitJson().route_tables = this.getOkitJson().route_tables.filter(function(child) {
            if (child.vcn_id === this.id) {
                console.info('Deleting ' + child.display_name);
                child.delete();
                return false; // So the filter removes the element
            }
            return true;
        }, this);
        // Remove Security Lists
        this.getOkitJson().security_lists = this.getOkitJson().security_lists.filter(function(child) {
            if (child.vcn_id === this.id) {
                console.info('Deleting ' + child.display_name);
                child.delete();
                return false; // So the filter removes the element
            }
            return true;
        }, this);
        // Remove Internet Gateways
        this.getOkitJson().internet_gateways = this.getOkitJson().internet_gateways.filter(function(child) {
            if (child.vcn_id === this.id) {
                console.info('Deleting ' + child.display_name);
                child.delete();
                return false; // So the filter removes the element
            }
            return true;
        }, this);
        // Remove NAT Gateways
        this.getOkitJson().nat_gateways = this.getOkitJson().nat_gateways.filter(function(child) {
            if (child.vcn_id === this.id) {
                console.info('Deleting ' + child.display_name);
                child.delete();
                return false; // So the filter removes the element
            }
            return true;
        }, this);
        // Remove Service Gateways
        this.getOkitJson().service_gateways = this.getOkitJson().service_gateways.filter(function(child) {
            if (child.vcn_id === this.id) {
                console.info('Deleting ' + child.display_name);
                child.delete();
                return false; // So the filter removes the element
            }
            return true;
        }, this);
        // Local Peering Gateways
        this.getOkitJson().local_peering_gateways = this.getOkitJson().local_peering_gateways.filter(function(child) {
            if (child.vcn_id === this.id) {
                console.info('Deleting ' + child.display_name);
                child.delete();
                return false; // So the filter removes the element
            }
            return true;
        }, this);
        // Network Security Groups
        this.getOkitJson().network_security_groups = this.getOkitJson().network_security_groups.filter(function(child) {
            if (child.vcn_id === this.id) {
                console.info('Deleting ' + child.display_name);
                child.delete();
                return false; // So the filter removes the element
            }
            return true;
        }, this);
        console.log();
    }

    /*
    ** Artifact Specific Functions
     */
    hasUnattachedSecurityList() {
        for (let security_list of this.getOkitJson().security_lists) {
            if (security_list.vcn_id === this.id) {
                return true;
            }
        }
        return false;
    }

    hasUnattachedRouteTable() {
         for (let route_table of this.getOkitJson().route_tables) {
            if (route_table.vcn_id === this.id) {
                return true;
            }
        }
        return false;
    }

    getGateways() {
        let gateways = [];
        // Internet Gateways
        gateways.push(...this.getInternetGateways());
        // NAT Gateways
        gateways.push(...this.getNATGateways());
        // Local Peering Gateways
        gateways.push(...this.getLocalPeeringGateways());
        // Service Gateways
        gateways.push(...this.getServiceGateways());
        // Dynamic Routing Gateways
        gateways.push(...this.getDynamicRoutingGateways());
        return gateways;
    }

    getInternetGateways() {
        let gateways = [];
        // Internet Gateways
        for (let gateway of this.getOkitJson().internet_gateways) {
            if (gateway.vcn_id === this.id) {
                gateways.push(gateway);
            }
        }
        return gateways;
    }

    getNATGateways() {
        let gateways = [];
        // NAT Gateways
        for (let gateway of this.getOkitJson().nat_gateways) {
            if (gateway.vcn_id === this.id) {
                gateways.push(gateway);
            }
        }
        return gateways;
    }

    getLocalPeeringGateways() {
        let gateways = [];
        // NAT Gateways
        for (let gateway of this.getOkitJson().local_peering_gateways) {
            if (gateway.vcn_id === this.id) {
                gateways.push(gateway);
            }
        }
        return gateways;
    }

    getServiceGateways() {
        let gateways = [];
        // Service Gateways
        for (let gateway of this.getOkitJson().service_gateways) {
            if (gateway.vcn_id === this.id) {
                gateways.push(gateway);
            }
        }
        return gateways;
    }

    getDynamicRoutingGateways() {
        let gateways = [];
        // Dynamic Routing Gateways
        for (let gateway of this.getOkitJson().dynamic_routing_gateways) {
            if (gateway.vcn_id === this.id) {
                gateways.push(gateway);
            }
        }
        return gateways;
    }

    getNamePrefix() {
        return super.getNamePrefix() + 'vcn';
    }

    /*
    ** Utility Methods
     */
    generateCIDR() {
        let vcn_cidr = '10.0.0.0/16';
        let vcn_octets = vcn_cidr.split('/')[0].split('.');
        let vcn_cidrs = [];
        for (let vcn of this.getOkitJson().getVirtualCloudNetworks()) {
            if (this.id !== vcn.id) {
                vcn.cidr_blocks.forEach((cidr_block) => {vcn_cidrs.push(cidr_block.split('/')[0])});
            }
        }
        let second_octet = 0;
        let ip = '';
        do {
            ip = `${vcn_octets[0]}.${second_octet}.${vcn_octets[2]}.${vcn_octets[3]}`
            second_octet += 1;
        } while (vcn_cidrs.includes(ip));

        this.cidr_blocks = [`${ip}/16`];
        return this.cidr_blocks;
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return 'Virtual Cloud Network';
    }
}
