/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { ResourceElementConfig } from "../../../../OcdPropertyTypes"
import { OciCommonConfigs } from "../../OciCommonConfigs"

export namespace OciLoadBalancerConfigs {
    export function configs(): ResourceElementConfig[] {return [
        ...OciCommonConfigs.configs(),
        {
            id: 'ip_mode',
            properties: {},
            configs: [],
            options: [
                {id: 'IPV4', displayName: 'IPV4'},
                {id: 'IPV6', displayName: 'IPV6'}
            ]
        },
        {
            id: 'shape_details.maximum_bandwidth_in_mbps',
            properties: {
                min: 0
            },
            configs: []
        },
        {
            id: 'shape_details.minimum_bandwidth_in_mbps',
            properties: {
                min: 0
            },
            configs: []
        },
    ]}
}
