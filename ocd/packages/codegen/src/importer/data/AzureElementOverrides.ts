/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdElementOverrides } from "../../types/OcdImporterData";

export const elementOverrides: OcdElementOverrides = {
    "defaults": {
        "common": {},
    },
    "labels": {
        "common": {},
    },
    "required": {
        "common": {},
    },
    "lookupOverrides": {
        "common": {},
    },
    "lookups": {
        "common": [],
    },
    "cacheLookups": {
        "common": {},
    },
    "staticLookups": {
        "common": [],
    },
    "types": {
        "common": {},
        "azapi_resource": {
            "body": ["string", "code"]
        }
    },
    "maps": {
        "common": {},
    }
}