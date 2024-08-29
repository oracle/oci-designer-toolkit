/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Security List Javascript');

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
        // this.display_name = this.generateDefaultName(okitjson.security_lists.length + 1);
        this.compartment_id = '';
        this.vcn_id = data.parent_id;
        this.egress_security_rules = [];
        this.ingress_security_rules = [];
        this.default = false;
        // Update with any passed data
        this.merge(data);
        this.convert();
    }

    convert() {
        super.convert()
        // Check min & max are set for all Egress Rules
        this.egress_security_rules.forEach((rule) => {
            if (rule.tcp_options) {
                if (rule.tcp_options.destination_port_range) {
                    rule.tcp_options.destination_port_range.max = rule.tcp_options.destination_port_range.max == '' ? rule.tcp_options.destination_port_range.min : rule.tcp_options.destination_port_range.max
                    rule.tcp_options.destination_port_range.min = rule.tcp_options.destination_port_range.min == '' ? rule.tcp_options.destination_port_range.max : rule.tcp_options.destination_port_range.min
                }
                if (rule.tcp_options.source_port_range) {
                    rule.tcp_options.source_port_range.max = rule.tcp_options.source_port_range.max == '' ? rule.tcp_options.source_port_range.min : rule.tcp_options.source_port_range.max
                    rule.tcp_options.source_port_range.min = rule.tcp_options.source_port_range.min == '' ? rule.tcp_options.source_port_range.max : rule.tcp_options.source_port_range.min
                }
            }
        })
        // Check min & max are set for all Ingress Rules
        this.ingress_security_rules.forEach((rule) => {
            if (rule.tcp_options) {
                if (rule.tcp_options.destination_port_range) {
                    rule.tcp_options.destination_port_range.max = rule.tcp_options.destination_port_range.max == '' ? rule.tcp_options.destination_port_range.min : rule.tcp_options.destination_port_range.max
                    rule.tcp_options.destination_port_range.min = rule.tcp_options.destination_port_range.min == '' ? rule.tcp_options.destination_port_range.max : rule.tcp_options.destination_port_range.min
                }
                if (rule.tcp_options.source_port_range) {
                    rule.tcp_options.source_port_range.max = rule.tcp_options.source_port_range.max == '' ? rule.tcp_options.source_port_range.min : rule.tcp_options.source_port_range.max
                    rule.tcp_options.source_port_range.min = rule.tcp_options.source_port_range.min == '' ? rule.tcp_options.source_port_range.max : rule.tcp_options.source_port_range.min
                }
            }
        })
    }

    newIngressRule() {
        return {
            protocol: "all", 
            is_stateless: false, 
            description: "", 
            source_type: "CIDR_BLOCK", 
            source: "0.0.0.0/0"
        };
    }

    newEgressRule() {
        return {
            protocol: "all", 
            is_stateless: false, 
            description: "", 
            destination_type: "CIDR_BLOCK", 
            destination: "0.0.0.0/0"
        };
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
        // Subnet Reference
        this.getOkitJson().getSubnets().forEach((r) => r.security_list_ids = r.security_list_ids.filter((id) => id !== this.id))
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
                        "max": "",
                        "min": ""
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
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newSecurityList = function(data) {
    console.info('New Security List');
    this.getSecurityLists().push(new SecurityList(data, this));
    return this.getSecurityLists()[this.getSecurityLists().length - 1];
}
OkitJson.prototype.getSecurityLists = function() {
    if (!this.security_lists) this.security_lists = [];
    return this.security_lists;
}
OkitJson.prototype.getSecurityList = function(id='') {
    for (let artefact of this.getSecurityLists()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJson.prototype.deleteSecurityList = function(id) {
    this.security_lists = this.security_lists ? this.security_lists.filter((r) => r.id !== id) : []
}
