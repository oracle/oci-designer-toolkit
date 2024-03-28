/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { ResourceElementConfig } from "../../../../OcdPropertyTypes"
import { OciCommonConfigs } from "../../OciCommonConfigs"

export namespace OciNetworkSecurityGroupSecurityRuleConfigs {
    export function configs(): ResourceElementConfig[] {
        return [
            ...OciCommonConfigs.configs(),
            {
                id: 'destination',
                properties: {
                    placeholder: '0.0.0.0/0',
                    pattern: "^((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/(3[0-2]|[1-2][0-9]|[0-9]))$)+|^var\.+$",
                    title: 'IPv4 CIDR block'
                },
                configs: []
            },
            {
                id: 'destination_type',
                properties: {},
                configs: [],
                options: [
                    {id: 'CIDR_BLOCK', displayName: 'CIDR Block'},
                    {id: 'SERVICE_CIDR_BLOCK', displayName: 'Service CIDR Block'}
                ]
            },
            {
                id: 'direction',
                properties: {},
                configs: [],
                options: [
                    {id: 'INGRESS', displayName: 'Ingress'},
                    {id: 'EGRESS', displayName: 'Egress'}
                ]
            },
            {
                id: 'protocol',
                properties: {},
                configs: [],
                options: [
                    {id: 'all', displayName: 'All'},
                    {id: '6', displayName: 'TCP'},
                    {id: '1', displayName: 'ICMP'},
                    {id: '17', displayName: 'UDP'},
                ]
            },
            {
                id: 'source',
                properties: {
                    placeholder: '0.0.0.0/0',
                    pattern: "^((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/(3[0-2]|[1-2][0-9]|[0-9]))$)+|^var\.+$",
                    title: 'IPv4 CIDR block'
                },
                configs: []
            },
            {
                id: 'source_type',
                properties: {},
                configs: [],
                options: [
                    {id: 'CIDR_BLOCK', displayName: 'CIDR Block'},
                    {id: 'SERVICE_CIDR_BLOCK', displayName: 'Service CIDR Block'}
                ]
            },
        ]
    }
}
