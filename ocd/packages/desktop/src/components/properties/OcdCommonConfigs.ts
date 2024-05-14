/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { ResourceElementConfig } from "./OcdPropertyTypes";

export namespace OcdCommonConfigs {
    export function configs(): ResourceElementConfig[] {
        return [
            {
                id: 'cidr_block',
                properties: {
                    placeholder: '0.0.0.0/0',
                    pattern: "^((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/(3[0-2]|[1-2][0-9]|[0-9]))$)+|^var\.+$",
                    title: 'IPv4 CIDR block'
                },
                configs: []
            },
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
                id: 'ip_address',
                properties: {
                    placeholder: '0.0.0.0',
                    pattern: "^((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$)+|^var\.+$",
                    title: 'IPv4 Address'
                },
                configs: []
            },
            {
                id: 'ipv6cidr_block',
                properties: {
                    placeholder: '2001:0db8:0123:45::/56',
                    pattern: "^((((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4}))*::((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4}))*|((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4})){7})(,\s?|$))+|^(var\.+(,\s?|$))",
                    title: 'IPv6 CIDR block'
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
            },
            {
                id: 'dns_label',
                properties: {
                    maxLength: 15,
                    pattern: '^[a-zA-Z][a-zA-Z0-9]{0,15}$|^var\.+$',
                    title: 'Only letters and numbers, starting with a letter. 15 characters max, or a variable starting "var."'
                },
                configs: []
            },
            {
                id: 'hostname_label',
                properties: {
                    maxLength: 64,
                    pattern: '^[a-zA-Z][a-zA-Z0-9]{0,64}$|^var\.+$',
                    title: 'Hostname can only be letters and numbers, starting with a letter. 64 characters max.'
                },
                configs: []
            }
        ]
    }
}