/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { ResourceElementConfig } from "../../OcdPropertyTypes";
import { OcdCommonConfigs } from "../../OcdCommonConfigs";

export namespace OciCommonConfigs {
    export function configs(): ResourceElementConfig[] {
        return [
            ...OcdCommonConfigs.configs(),
            {
                id: 'admin_password',
                properties: {
                    pattern: '^var\.+$',
                    title: 'Password fields only support Variables.'
                },
                configs: []
            },
            {
                id: 'availability_domain',
                properties: {},
                configs: [],
                options: [
                    {id: '1', displayName: 'Availability Domain 1'},
                    {id: '2', displayName: 'Availability Domain 2'},
                    {id: '3', displayName: 'Availability Domain 3'}
                ]
            },
            {
                id: 'backup_tde_password',
                properties: {
                    pattern: '^var\.+$',
                    title: 'Password fields only support Variables.'
                },
                configs: []
            },
            {
                id: 'cluster_admin_password',
                properties: {
                    pattern: '^var\.+$',
                    title: 'Password fields only support Variables.'
                },
                configs: []
            },
            {
                id: 'database_admin_password',
                properties: {
                    pattern: '^var\.+$',
                    title: 'Password fields only support Variables.'
                },
                configs: []
            },
            {
                id: 'fault_domain',
                properties: {},
                configs: [],
                options: [
                    {id: '', displayName: 'Let Oracle Choose'},
                    {id: 'FAULT-DOMAIN-1', displayName: 'Fault Domain 1'},
                    {id: 'FAULT-DOMAIN-2', displayName: 'Fault Domain 2'},
                    {id: 'FAULT-DOMAIN-3', displayName: 'Fault Domain 3'}
                ]
            },
            {
                id: 'ipv6private_cidr_blocks',
                properties: {
                    placeholder: '2001:0db8:0123:45::/56',
                    pattern: "^((((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4}))*::((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4}))*|((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4})){7})(,\s?|$))+|^(var\.+(,\s?|$))",
                    title: 'Comma separated IPv6 CIDR blocks'
                },
                configs: []
            },
            {
                id: 'license_model',
                properties: {},
                configs: [],
                options: [
                    {id: 'BRING_YOUR_OWN_LICENSE', displayName: 'Bring Your Own License'},
                    {id: 'LICENSE_INCLUDED', displayName: 'License Included'}
                ]
            },
            {
                id: 'tde_wallet_password',
                properties: {
                    pattern: '^var\.+$',
                    title: 'Password fields only support Variables.'
                },
                configs: []
            },
            {
                id: 'vpc_password',
                properties: {
                    pattern: '^var\.+$',
                    title: 'Password fields only support Variables.'
                },
                configs: []
            },
            {
                id: 'whitelisted_ips',
                properties: {
                    placeholder: '0.0.0.0/0,0.0.0.0/0',
                    pattern: "^((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/(3[0-2]|[1-2][0-9]|[0-9]))(,\s?|$))+|^(var\.+(,\s?|$))",
                    title: 'Comma separated IPv4 CIDR blocks'
                },
                configs: []
             }
        ]
    }
}