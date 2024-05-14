/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { ResourceElementConfig } from "../../../../OcdPropertyTypes"
import { OciCommonConfigs } from "../../OciCommonConfigs"

export namespace OciDhcpOptionsConfigs {
    export function configs(): ResourceElementConfig[] {
        return [
            ...OciCommonConfigs.configs(),
            {
                id: 'domain_name_type',
                properties: {},
                configs: [],
                options: [
                    {id: '', displayName: ''},
                    {id: 'VCN_DOMAIN', displayName: 'Vcn Domain'},
                    {id: 'SUBNET_DOMAIN', displayName: 'Subnet Domain'},
                    {id: 'CUSTOM_DOMAIN', displayName: 'Custom Domain'}
                ]
            },
            {
                id: 'options.type',
                properties: {},
                configs: [],
                options: [
                    {id: 'DomainNameServer', displayName: 'Domain Name Server'},
                    {id: 'SearchDomain', displayName: 'Search Domain'}
                ]
            },
            {
                id: 'options.server_type',
                properties: {},
                configs: [],
                options: [
                    {id: 'VcnLocalPlusInternet', displayName: 'Vcn Local Plus Internet'},
                    {id: 'CustomDnsServer', displayName: 'Custom Dns Server'}
                ]
            },
            {
                id: 'options.custom_dns_servers',
                properties: {
                    placeholder: '0.0.0.0/0,0.0.0.0/0',
                    pattern: "^((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/(3[0-2]|[1-2][0-9]|[0-9]))(,\s?|$))+|^(var\.+(,\s?|$))",
                    title: 'Comma separated IPv4 CIDR blocks'
                },
                configs: []
            },
            {
                id: 'options.search_domain_names',
                properties: {
                    placeholder: 'vcn.oracle.com,test.com',
                    title: 'Comma separated list domain names'
                },
                configs: []
            }
        ]
    }
}
