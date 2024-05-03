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
                id: 'db_home.database.admin_password',
                properties: {
                    pattern: '^var\.+$',
                    title: 'Password fields only support Variables.'
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
