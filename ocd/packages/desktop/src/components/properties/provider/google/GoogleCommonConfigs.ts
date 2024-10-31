/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { ResourceElementConfig } from "../../OcdPropertyTypes";
import { OcdCommonConfigs } from "../../OcdCommonConfigs";

export namespace GoogleCommonConfigs {
    export function configs(): ResourceElementConfig[] {
        return [
            ...OcdCommonConfigs.configs(),
            {
                id: 'admin_password',
                properties: {
                    pattern: String.raw`^var\.+$`,
                    title: 'Password fields only support Variables.'
                },
                configs: []
            },
        ]
    }
}
