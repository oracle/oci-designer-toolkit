/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { ResourceElementConfig } from "../../../../OcdPropertyTypes"
import { OciCommonConfigs } from "../../OciCommonConfigs"

export namespace OciVolumeConfigs {
    export function configs(): ResourceElementConfig[] {
        return [
            ...OciCommonConfigs.configs(),
            {
                id: 'size_in_gbs',
                properties: {
                    min: 50
                },
                configs: []
            },
            {
                id: 'vpus_per_gb',
                properties: {
                    min: 0,
                    max: 120,
                    step: 10
                },
                configs: []
            },
        ]
    }
}
