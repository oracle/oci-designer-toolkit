/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { ResourceElementConfig } from "./OcdPropertyTypes";

export namespace OcdCommonConfigs {
    export function configs(): ResourceElementConfig[] {
        return [
            {
                id: 'cidr_blocks',
                properties: {
                    placeholder: '0.0.0.0/0,0.0.0.0/0',
                    pattern: "^((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/(3[0-2]|[1-2][0-9]|[0-9]))(,\s?|$))+|^(var\.+(,\s?|$))",
                    title: 'Comma separated IPv4 CIDR blocks'
                },
                configs: []
            },
            {
                id: 'ipv6cidr_blocks',
                properties: {
                    placeholder: '2001:0db8:0123:45::/56',
                    pattern: "^((((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4}))*::((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4}))*|((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4})){7})(,\s?|$))+|^(var\.+(,\s?|$))",
                    title: 'Comma separated IPv6 CIDR blocks'
                },
                configs: []
            }
        ]
    }
}