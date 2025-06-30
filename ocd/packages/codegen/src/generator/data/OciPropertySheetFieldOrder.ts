/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { resourceAttributes } from "../../importer/data/OciResourceMap.js"
import { OcdPropertySortSequence } from "../../types/OcdGeneratorTypes.js"

// export const propertySortSequence: OcdPropertySortSequence = resourceAttributes
export const propertySortSequence: OcdPropertySortSequence = {
    "oci_core_subnet": [
        "display_name",
        "availability_domain",
        "vcn_id",
        "prohibit_public_ip_on_vnic",
        "dns_label",
        "cidr_block",
        "route_table_id",
        "security_list_ids",
        "dhcp_options_id",
        "ipv6cidr_block",
        "ipv6cidr_blocks",
    ],
    "oci_core_vcn": [
        "display_name",
        "dns_label",
        "cidr_blocks",
        "is_ipv6enabled",
        "ipv6cidr_blocks",
    ],
}