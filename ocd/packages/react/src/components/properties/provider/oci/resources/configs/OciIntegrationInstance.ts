/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { ResourceElementConfig } from "../../../../OcdPropertyTypes.js"
import { OciCommonConfigs } from "../../OciCommonConfigs.js"

export namespace OciIntegrationInstanceConfigs {
    export function configs(): ResourceElementConfig[] {
        return [
            ...OciCommonConfigs.configs(),
            {
                id: 'integration_instance_type',
                properties: {},
                configs: [],
                options: [
                    {id: 'ENTERPRISEX', displayName: 'Enterprise'},
                    {id: 'STANDARDX', displayName: 'Standard'}
                ]
            },
            {
                id: 'shape',
                properties: {},
                configs: [],
                options: [
                    {id: 'PRODUCTION', displayName: 'Production'},
                    {id: 'DEVELOPMENT', displayName: 'Development'}
                ]
            },
        ]
    }
}
