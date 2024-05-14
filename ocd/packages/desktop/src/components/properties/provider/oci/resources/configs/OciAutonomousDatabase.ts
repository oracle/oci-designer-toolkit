/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { ResourceElementConfig } from "../../../../OcdPropertyTypes"
import { OciCommonConfigs } from "../../OciCommonConfigs"

export namespace OciAutonomousDatabaseConfigs {
    export function configs(): ResourceElementConfig[] {
        return [
            ...OciCommonConfigs.configs(),
            {
                id: 'cpu_core_count',
                properties: {
                    min: 1
                },
                configs: []
            },
            {
                id: 'data_storage_size_in_tbs',
                properties: {
                    min: 1
                },
                configs: []
            },
            {
                id: 'db_version',
                properties: {},
                configs: [],
                resourceFilter: (r, resource, rootResource) => r.dbWorkload === rootResource.dbWorkload
            },
            {
                id: 'db_workload',
                properties: {},
                configs: [],
                options: [
                    {id: 'OLTP', displayName: 'Transaction Processing database'},
                    {id: 'DW', displayName: 'Data Warehouse database'},
                    {id: 'AJD', displayName: 'JSON Database'},
                    {id: 'APEX', displayName: 'Oracle APEX Application'}
                ]
            },
        ]
    }
}
