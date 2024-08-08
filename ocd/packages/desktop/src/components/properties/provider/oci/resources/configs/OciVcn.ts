/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { ResourceElementConfig } from "../../../../OcdPropertyTypes";
import { OciCommonConfigs } from "../../OciCommonConfigs"

export namespace OciVcnConfigs {
    export function configs(): ResourceElementConfig[] {
        return [
            ...OciCommonConfigs.configs()
            // {
            //     id: 'dns_label',
            //     properties: {
            //         maxLength: 15,
            //         pattern: '^[a-zA-Z][a-zA-Z0-9]{0,15}$',
            //         title: 'Only letters and numbers, starting with a letter. 15 characters max.'
            //     },
            //     configs: []
            // }
        ]
    }
}