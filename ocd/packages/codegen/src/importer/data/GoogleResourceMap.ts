/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdIncludedElements, OcdResourceMap } from "../../types/OcdImporterData";

export const resourceMap: OcdResourceMap = {
    "azapi_resource": "azapi_resource"
}

export const dataMap: OcdResourceMap = {}

export const resourceAttributes: OcdIncludedElements = {
    "common": [],
    "azapi_resource": [
        "body",
        "identity",
        "identity.identity_ids",
        "identity.principal_id",
        "identity.tenant_id",
        "identity.type",
        "ignore_casing",
        "ignore_missing_property",
        "location",
        "name",
        "parent_id",
        "removing_special_chars",
        "schema_validation_enabled",
        "tags",
        "timeouts",
        "type"
      ]
}
