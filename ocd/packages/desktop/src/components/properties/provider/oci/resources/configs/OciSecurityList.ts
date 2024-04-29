/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdResource } from "@ocd/model"
import { ResourceElementConfig } from "../../../../OcdPropertyTypes"
import { OciCommonConfigs } from "../../OciCommonConfigs"

export namespace OciSecurityListConfigs {
    export function configs(): ResourceElementConfig[] {
        return [
            ...OciCommonConfigs.configs(),
            {
                id: 'egress_security_rules.destination',
                properties: {
                    placeholder: '0.0.0.0/0',
                    pattern: "^((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/(3[0-2]|[1-2][0-9]|[0-9]))$)+|^var\.+$",
                    title: 'IPv4 CIDR block'
                },
                configs: []
            },
            {
                id: 'egress_security_rules.destination_type',
                properties: {},
                configs: [],
                options: [
                    {id: 'CIDR_BLOCK', displayName: 'CIDR Block'},
                    {id: 'SERVICE_CIDR_BLOCK', displayName: 'Service CIDR Block'}
                ]
            },
            {
                id: 'egress_security_rules.protocol',
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
                id: 'ingress_security_rules',
                properties: {},
                configs: [],
                summary: (open: boolean, resource: OcdResource, openValue: string) => open ? openValue : resource && resource.description.trim().length > 0 ? resource.description : openValue
            },
            {
                id: 'ingress_security_rules.source',
                properties: {
                    placeholder: '0.0.0.0/0',
                    pattern: "^((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/(3[0-2]|[1-2][0-9]|[0-9]))$)+|^var\.+$",
                    title: 'IPv4 CIDR block'
                },
                configs: []
            },
            {
                id: 'ingress_security_rules.source_type',
                properties: {},
                configs: [],
                options: [
                    {id: 'CIDR_BLOCK', displayName: 'CIDR Block'},
                    {id: 'SERVICE_CIDR_BLOCK', displayName: 'Service CIDR Block'}
                ]
            },
            {
                id: 'ingress_security_rules.protocol',
                properties: {},
                configs: [],
                options: [
                    {id: 'all', displayName: 'All'},
                    {id: '6', displayName: 'TCP'},
                    {id: '1', displayName: 'ICMP'},
                    {id: '17', displayName: 'UDP'},
                ]
            },
        ]
    }
    export const layout = []
}
