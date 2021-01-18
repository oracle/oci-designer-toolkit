/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Security List Javascript');

/*
** Define Security List Class
 */
class SecurityList extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.display_name = this.generateDefaultName(okitjson.security_lists.length + 1);
        this.compartment_id = '';
        this.vcn_id = data.parent_id;
        this.egress_security_rules = [];
        this.ingress_security_rules = [];
        // Update with any passed data
        this.merge(data);
        this.convert();
    }


    /*
    ** Clone Functionality
     */
    clone() {
        return new SecurityList(JSON.clone(this), this.getOkitJson());
    }


    /*
    ** Delete Processing
     */
    deleteChildren() {
        // Remove Subnet references
        for (let subnet of this.getOkitJson().subnets) {
            for (let i=0; i < subnet.security_list_ids.length; i++) {
                if (subnet.security_list_ids[i] === this.id) {
                    subnet.security_list_ids.splice(i, 1);
                }
            }
        }
    }

    getNamePrefix() {
        return super.getNamePrefix() + 'sl';
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return 'Security List';
    }


    /*
    ** Artifact Specific Functions
     */
    addDefaultSecurityListRules(vcn_cidr_block='10.0.0.0/16') {
        console.info('Adding Default Security List Rules for ' + this.id);
        // Add Egress Rule
        this.egress_security_rules.push(
            {
                "destination": "0.0.0.0/0",
                "destination_type": "CIDR_BLOCK",
                "icmp_options": null,
                "is_stateless": false,
                "protocol": "all",
                "tcp_options": null,
                "udp_options": null,
                "description": ""
            }
        );
        // Ingress Rules
        this.ingress_security_rules.push(
            {
                "icmp_options": null,
                "is_stateless": false,
                "protocol": "6",
                "source": "0.0.0.0/0",
                "source_type": "CIDR_BLOCK",
                "tcp_options": {
                    "destination_port_range": {
                        "max": 22,
                        "min": 22
                    },
                    "source_port_range": {
                        "max": null,
                        "min": null
                    }
                },
                "udp_options": null,
                "description": ""
            }
        );
        this.ingress_security_rules.push(
            {
                "icmp_options": {
                    "code": 4,
                    "type": 3
                },
                "is_stateless": false,
                "protocol": "1",
                "source": "0.0.0.0/0",
                "source_type": "CIDR_BLOCK",
                "tcp_options": null,
                "udp_options": null,
                "description": ""
            }
        );
        this.ingress_security_rules.push(
            {
                "icmp_options": {
                    "code": null,
                    "type": 3
                },
                "is_stateless": false,
                "protocol": "1",
                "source": vcn_cidr_block,
                "source_type": "CIDR_BLOCK",
                "tcp_options": null,
                "udp_options": null,
                "description": ""
            }
        );
    }
}
