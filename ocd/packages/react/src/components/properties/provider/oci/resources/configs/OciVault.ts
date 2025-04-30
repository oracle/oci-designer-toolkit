/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { ResourceElementConfig } from "../../../../OcdPropertyTypes"
import { OciCommonConfigs } from "../../OciCommonConfigs"

export namespace OciVaultConfigs {
    export function configs(): ResourceElementConfig[] {
        return [
            ...OciCommonConfigs.configs(),
            {
                id: 'vault_type',
                properties: {},
                configs: [],
                options: [
                    {id: 'DEFAULT', displayName: 'Default'},
                    {id: 'VIRTUAL_PRIVATE', displayName: 'Virtual Private Vault'},
                ]
            },
        ]
    }
}
