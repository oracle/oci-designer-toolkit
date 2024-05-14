/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { ResourceElementConfig } from "../../../../OcdPropertyTypes"
import { OciCommonConfigs } from "../../OciCommonConfigs"

export namespace OciLoadBalancerListenerConfigs {
    export function configs(): ResourceElementConfig[] {return [
        ...OciCommonConfigs.configs(),
        {
            id: 'display_name',
            properties: {
                maxLength: 64,
                pattern: '^[a-zA-Z][a-zA-Z0-9]{0,64}$|^var\.+$',
                title: 'Backend Set Name can only be letters and numbers, starting with a letter. 64 characters max.'
            },
            configs: []
        },
        {
            id: 'hostname_names',
            properties: {
                // pattern: '^[a-zA-Z][a-zA-Z0-9]{0,64}$|^var\.+$',
                title: 'Comma separate list of hostnames.'
            },
            configs: []
        },
    ]}
}
