/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { ResourceElementConfig } from "../../../../OcdPropertyTypes"
import { OciCommonConfigs } from "../../OciCommonConfigs"

export namespace OciBastionConfigs {
    export function configs(): ResourceElementConfig[] {
        return [
            ...OciCommonConfigs.configs(),
            {
                id: 'bastion_type',
                properties: {},
                configs: [],
                options: [
                    {id: 'standard', displayName: 'Standard'}
                ]
            },
            {
                id: 'client_cidr_block_allow_list',
                properties: {
                    placeholder: '0.0.0.0/0,0.0.0.0/0',
                    pattern: String.raw`^((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/(3[0-2]|[1-2][0-9]|[0-9]))(,\s?|$))+|^(var\.+(,\s?|$))`,
                    title: 'Comma separated IPv4 CIDR blocks'
                },
                configs: []
             },
             {
                id: 'max_session_ttl_in_seconds',
                properties: {
                    min: 0
                },
                configs: []
            },
        ]
    }
}
