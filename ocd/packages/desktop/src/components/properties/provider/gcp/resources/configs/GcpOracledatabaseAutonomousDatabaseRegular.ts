/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { ResourceElementConfig } from "../../../../OcdPropertyTypes"
import { GcpCommonConfigs } from "../../GcpCommonConfigs"

export namespace GcpOracledatabaseAutonomousDatabaseRegularConfigs {
    export function configs(): ResourceElementConfig[] {return [...GcpCommonConfigs.configs()]}
}
