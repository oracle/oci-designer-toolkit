/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { ResourceElementConfig } from "../../../../OcdPropertyTypes"
import { OciCommonConfigs } from "../../OciCommonConfigs"

export namespace OciVolumeAttachmentConfigs {
    export function configs(): ResourceElementConfig[] {
        return [
            ...OciCommonConfigs.configs(),
            {
                id: 'attachment_type',
                properties: {},
                configs: [],
                options: [
                    {id: 'paravirtualized', displayName: 'Paravirtualised'},
                    {id: 'iscsi', displayName: 'ISCSI'}
                ]
            },
        ]
    }
}
