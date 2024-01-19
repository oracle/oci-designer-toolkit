/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdElementOverrides } from "../../types/OcdImporterData";

export const elementOverrides: OcdElementOverrides = {
    "resourceLookupOverrides": {
        "common": {
            "nsg_ids": "network_security_group"
        },
    },
    "lookups": {
        "common": [],
        "oci_core_instance": [
            "shape"
        ],
    },
    "cacheLookups": {
        "common": {},
        "oci_core_instance": {
            "shape": "shapes",
            "source_details.source_id": "images"
        },
    },
    "staticLookups": {
        "common": [
            "availability_domain",
            "fault_domain"
        ],
        "oci_core_dhcp_options": [
            "options.type",
            "options.server_type",
            "domain_name_type",
        ],
        "oci_core_instance": [
            "source_details.source_type"
        ],
        "oci_core_network_security_group_security_rule": [
            "destination_type",
            "direction",
            "protocol",
            "source_type"        
        ],
        "oci_core_security_list": [
            "egress_security_rules.protocol",
            "egress_security_rules.destination_type",
            "ingress_security_rules.protocol",
            "ingress_security_rules.source_type",
        ]
    },
    "types": {
        "common": {},
        "oci_core_instance": {
            "assign_public_ip": "bool"
        },
    }
}