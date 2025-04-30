/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { ResourceElementConfig } from "../../../../OcdPropertyTypes"
import { OciCommonConfigs } from "../../OciCommonConfigs"

export namespace OciKeyConfigs {
    export function configs(): ResourceElementConfig[] {
        return [
            ...OciCommonConfigs.configs(),
            {
                id: 'protection_mode',
                properties: {},
                configs: [],
                options: [
                    {id: 'HSM', displayName: 'HSM'},
                    {id: 'SOFTWARE', displayName: 'Software'},
                ]
            },
            {
                id: 'key_shape.algorithm',
                properties: {},
                configs: [],
                options: [
                    {id: 'AES', displayName: 'AES'},
                    {id: 'RSA', displayName: 'RSA'},
                    {id: 'ECDSA', displayName: 'ECDSA'},
                ]
            },
            {
                id: 'key_shape.curve_id',
                properties: {},
                configs: [],
                options: [
                    {id: 'NIST_P256', displayName: 'NIST_P256'},
                    {id: 'NIST_P384', displayName: 'NIST_P384'},
                    {id: 'NIST_P521', displayName: 'NIST_P521'},
                ]
            },
            {
                id: 'key_shape.length',
                properties: {},
                configs: [],
                options: [
                    {id: '16', displayName: '128 bits'},
                    {id: '24', displayName: '192 bits'},
                    {id: '32', displayName: '256 bits'},
                ]
            },
        ]
    }
}
