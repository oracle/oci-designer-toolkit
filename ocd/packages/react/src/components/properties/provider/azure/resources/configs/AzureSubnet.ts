/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { ResourceElementConfig } from "../../../../OcdPropertyTypes.js"
import { AzureCommonConfigs } from "../../AzureCommonConfigs.js"

export namespace AzureSubnetConfigs {
    export function configs(): ResourceElementConfig[] {return [...AzureCommonConfigs.configs()]}
}
