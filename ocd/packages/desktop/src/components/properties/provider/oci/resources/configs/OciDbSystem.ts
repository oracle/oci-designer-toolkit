/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { ResourceElementConfig } from "../../../../OcdPropertyTypes"
import { OciCommonConfigs } from "../../OciCommonConfigs"

export namespace OciDbSystemConfigs {
    export function configs(): ResourceElementConfig[] {
        return [
            ...OciCommonConfigs.configs(),
            {
                id: 'database_edition',
                properties: {},
                configs: [],
                options: [
                    {id: 'STANDARD_EDITION', displayName: 'Standard'},
                    {id: 'ENTERPRISE_EDITION', displayName: 'Enterprise'},
                    {id: 'ENTERPRISE_EDITION_HIGH_PERFORMANCE', displayName: 'High Performance'},
                    {id: 'ENTERPRISE_EDITION_EXTREME_PERFORMANCE', displayName: 'Extreme Performance'}
                ]
            },
            {
                id: 'db_home.database.admin_password',
                properties: {
                    pattern: '^var\.+$',
                    title: 'Password fields only support Variables.'
                },
                configs: []
            },
            {
                id: 'db_home.database.db_name',
                properties: {
                    maxLength: 8
                },
                configs: []
            },
            {
                id: 'db_home.database.tde_wallet_password',
                properties: {
                    pattern: '^var\.+$',
                    title: 'Password fields only support Variables.'
                },
                configs: []
            },
            {
                id: 'shape',
                properties: {},
                configs: [],
                lookupGroups: [
                    {displayName: 'Virtual Machine', simpleFilter: (r) => r.shapeFamily === 'VIRTUALMACHINE'},
                    {displayName: 'ExaData', simpleFilter: (r) => r.shapeFamily === 'EXADATA'},
                    {displayName: 'ExaCC', simpleFilter: (r) => r.shapeFamily === 'EXACC'}
                ]
            },
        ]
    }
}
