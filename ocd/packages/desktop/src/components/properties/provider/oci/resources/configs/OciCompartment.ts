/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { ResourceElementConfig } from "../../../../OcdPropertyTypes"
import { OciCommonConfigs } from "../../OciCommonConfigs"

export namespace OciCompartmentConfigs {
    export function configs(): ResourceElementConfig[] {
        return [
            ...OciCommonConfigs.configs(),
            {
                id: 'display_name',
                properties: {
                    pattern: '^[a-zA-Z][a-zA-Z0-9]+$',
                    title: 'Compartment Name can only letters and numbers.'
                },
                configs: []
            }
        ]
    }
}
