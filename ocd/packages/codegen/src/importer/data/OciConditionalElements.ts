/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdConditionalElements } from "../../types/OcdImporterData";

export const conditionalElements: OcdConditionalElements = {
    "common": {},
    "oci_core_security_list": {
        "icmp_options": {
            "element": "protocol",
            "value": "1"
        },
        "tcp_options": {
            "element": "protocol",
            "value": "6"
        },
        "udp_options": {
            "element": "protocol",
            "value": "17"
        }
    },
    "oci_core_vcn": {
        "ipv6private_cidr_blocks": {
            "element": "is_ipv6enabled",
            "value": true
        }
    }
}