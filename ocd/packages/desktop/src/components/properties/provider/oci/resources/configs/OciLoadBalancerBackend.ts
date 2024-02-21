/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { ResourceElementConfig } from "../../../../OcdPropertyTypes"
import { OciCommonConfigs } from "../../OciCommonConfigs"

export namespace OciLoadBalancerBackendConfigs {
    export function configs(): ResourceElementConfig[] {return [
        ...OciCommonConfigs.configs(),
        {
            id: 'ip_address',
            properties: {disabled: true},
            configs: []
        },
        {
            id: 'port',
            properties: {min: 1},
            configs: []
        },
        {
            id: 'weight',
            properties: {min: 1, max: 100},
            configs: []
        },
    ]}
}
