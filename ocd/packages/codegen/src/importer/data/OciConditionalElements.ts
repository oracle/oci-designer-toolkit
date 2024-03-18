/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdConditionalElements } from "../../types/OcdImporterData";

export const conditionalElements: OcdConditionalElements = {
    "common": {},
    "oci_core_dhcp_options": {
        "search_domain_names": {
            "element": "type",
            "operator": "eq",
            "value": "SearchDomain"
        },
        "server_type": {
            "element": "type",
            "operator": "eq",
            "value": "DomainNameServer"
        },
        "custom_dns_servers": [
            {
                "element": "server_type",
                "operator": "eq",
                "value": "CustomDnsServer"
            },
            {
                "logic_operator": "and",
                "element": "type",
                "operator": "eq",
                "value": "DomainNameServer"
            }
        ]
    },
    "oci_core_instance": {
        "shape_config": {
            "element": "shape",
            "relativeToRoot": true,
            "operator": "ew",
            "value": ".Flex"
        }
    },
    "oci_core_network_security_group_security_rule": {
        "destination": {
            "element": "direction",
            "operator": "eq",
            "value": "EGRESS"
        },
        "destination_type": {
            "element": "direction",
            "operator": "eq",
            "value": "EGRESS"
        },
        "source": {
            "element": "direction",
            "operator": "eq",
            "value": "INGRESS"
        },
        "source_type": {
            "element": "direction",
            "operator": "eq",
            "value": "INGRESS"
        },
        "icmp_options": {
            "element": "protocol",
            "operator": "eq",
            "value": "1"
        },
        "tcp_options": {
            "element": "protocol",
            "operator": "eq",
            "value": "6"
        },
        "udp_options": {
            "element": "protocol",
            "operator": "eq",
            "value": "17"
        }
    },
    "oci_core_remote_peering_connection": {
        "peer_tenancy_id": {
            "element": "is_cross_tenancy_peering",
            "operator": "eq",
            "value": true
        }
    },
    "oci_core_security_list": {
        "icmp_options": {
            "element": "protocol",
            "operator": "eq",
            "value": "1"
        },
        "tcp_options": {
            "element": "protocol",
            "operator": "eq",
            "value": "6"
        },
        "udp_options": {
            "element": "protocol",
            "operator": "eq",
            "value": "17"
        }
    },
    "oci_core_volume_attachment": {
        "encryption_in_transit_type": {
            "element": "attachment_type",
            "operator": "eq",
            "value": "iscsi"
        },
        "is_agent_auto_iscsi_login_enabled": {
            "element": "attachment_type",
            "operator": "eq",
            "value": "iscsi"
        },
        "is_pv_encryption_in_transit_enabled": {
            "element": "attachment_type",
            "operator": "eq",
            "value": "paravirtualized"
        },
        "use_chap": {
            "element": "attachment_type",
            "operator": "eq",
            "value": "iscsi"
        }
    },
    "oci_core_vcn": {
        "cidr_blocks": {
            "element": "is_ipv6enabled",
            "operator": "ne",
            "value": true
        },
        "ipv6private_cidr_blocks": {
            "element": "is_ipv6enabled",
            "operator": "eq",
            "value": true
        }
    },
    "oci_load_balancer_load_balancer": {
        "shape_details": {
            "element": "shape",
            "relativeToRoot": true,
            "operator": "eq",
            "value": "flexible"
        }
    },
    "oci_load_balancer_backend": {
        "backendset_name": {
            "element": "backendset_name",
            "operator": "eq",
            "value": false
        },
        "ip_address": {
            "element": "ip_address",
            "operator": "ne",
            "value": ''
        },
        "load_balancer_id": {
            "element": "load_balancer_id",
            "operator": "eq",
            "value": false
        }
    },
    "oci_load_balancer_backend_set": {
        "compartment_id": {
            "element": "compartment_id",
            "operator": "eq",
            "value": false
        }
    },
}