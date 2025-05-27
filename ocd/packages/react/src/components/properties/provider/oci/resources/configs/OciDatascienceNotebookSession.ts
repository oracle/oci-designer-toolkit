/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { ResourceElementConfig } from "../../../../OcdPropertyTypes"
import { OciCommonConfigs } from "../../OciCommonConfigs"

export namespace OciDatascienceNotebookSessionConfigs {
    export function configs(): ResourceElementConfig[] {
        return [
            ...OciCommonConfigs.configs(),
            {
                id: 'notebook_session_config_details.shape',
                properties: {},
                configs: [],
                lookupGroups: [
                    {displayName: 'Flexible Virtual Machine', simpleFilter: (r) => r.isFlexible},
                    {displayName: 'Virtual Machine', simpleFilter: (r) => !r.isFlexible && r.id.startsWith('VM.')},
                    {displayName: 'Bare Metal', simpleFilter: (r) => !r.isFlexible && r.id.startsWith('BM.')}
                ]
            },
        ]
    }
}
