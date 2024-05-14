/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { ResourceElementConfig } from "../../../../OcdPropertyTypes"
import { OciCommonConfigs } from "../../OciCommonConfigs"

export namespace OciIpsecConfigs {
    export function configs(): ResourceElementConfig[] {
        return [
            ...OciCommonConfigs.configs(),
            {
                id: 'static_routes',
                properties: {
                    placeholder: '0.0.0.0/0',
                    pattern: "^((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-1][0-9]|22[0-3])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/(3[0-2]|[1-2][0-9]|[0-9]))$)+|^var\.+$",
                    title: 'IPv4 Class A-C CIDR block'
                },
                configs: []
            },
        ]
    }
}
