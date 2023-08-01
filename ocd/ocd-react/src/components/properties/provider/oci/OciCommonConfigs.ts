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
                id: 'fault_domain',
                properties: {},
                configs: [],
                options: [
                    {id: '', displayName: 'Let Oracle Choose'},
                    {id: 'FAULT-DOMAIN-1', displayName: 'Fault Domain 1'},
                    {id: 'FAULT-DOMAIN-2', displayName: 'Fault Domain 2'},
                    {id: 'FAULT-DOMAIN-3', displayName: 'Fault Domain 3'}
                ]
            }
        ]
    }
}