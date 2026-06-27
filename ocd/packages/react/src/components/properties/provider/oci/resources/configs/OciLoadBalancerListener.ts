/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
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
                pattern: '^[a-zA-Z][a-zA-Z0-9]{0,63}$|^var\.+$',
                title: 'Listener name can only be letters and numbers, starting with a letter. 64 characters max.'
            },
            configs: []
        },
        {
            id: 'port',
            properties: {
                min: 1,
                max: 65535,
                title: 'Listener port must be between 1 and 65535.'
            },
            configs: []
        },
        {
            id: 'protocol',
            properties: {
                title: 'Use a protocol supported by the selected OCI load balancer shape.'
            },
            configs: [],
            options: [
                {id: 'HTTP', displayName: 'HTTP'},
                {id: 'HTTPS', displayName: 'HTTPS'},
                {id: 'HTTP2', displayName: 'HTTP/2'},
                {id: 'TCP', displayName: 'TCP'}
            ]
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
