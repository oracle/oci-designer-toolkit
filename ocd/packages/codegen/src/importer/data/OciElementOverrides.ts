/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdElementOverrides } from "../../types/OcdImporterData";

export const elementOverrides: OcdElementOverrides = {
    "lookups": [],
    "staticLookups": [
        "availability_domain",
        "destination_type",
        "fault_domain",
        "protocol",
        "source_type",
        "egress_security_rules.protocol",
        "ingress_security_rules.protocol",
        "ingress_security_rules.source_type"
    ],
    "types": {
        "common": {},
        "oci_core_instance": {
            "assign_public_ip": "bool"
        }
    }
}