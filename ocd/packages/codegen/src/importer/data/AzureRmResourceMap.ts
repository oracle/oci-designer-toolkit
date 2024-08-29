/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdIncludedElements, OcdResourceMap } from "../../types/OcdImporterData";

export const resourceMap: OcdResourceMap = {
    "azurerm_virtual_network": "virtual_network",
    "azurerm_subnet": "subnet"
}

export const dataMap: OcdResourceMap = {}

export const resourceAttributes: OcdIncludedElements = {
    "common": [
        "location",
        "name",
        "resource_group_name",
        "tags"
    ],
    "azurerm_subnet": [
        "virtual_network_name"
    ],
    "azurerm_virtual_network": [
        "address_space",
        "dns_servers",
    ]
}
