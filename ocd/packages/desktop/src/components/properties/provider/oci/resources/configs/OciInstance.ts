/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { ResourceElementConfig } from "../../../../OcdPropertyTypes"
import { OciCommonConfigs } from "../../OciCommonConfigs"

export namespace OciInstanceConfigs {
    export function configs(): ResourceElementConfig[] {
        return [
            ...OciCommonConfigs.configs(),
            {
                id: 'create_vnic_details.hostname_label',
                properties: {
                    maxLength: 64,
                    pattern: '^[a-zA-Z][a-zA-Z0-9]{0,64}$',
                    title: 'Hostname can only be letters and numbers, starting with a letter. 64 characters max.'
                },
                configs: []
            },
            {
                id: 'metadata.ssh_authorized_keys',
                properties: {
                    pattern: '^ssh-(ed25519|rsa|dss|ecdsa) AAAA(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=|[A-Za-z0-9+\/]{4})( [^@]+@[^@]+)?$',
                    title: 'SSH Public key must be specified'
                },
                configs: []
            },
            {
                id: 'metadata.user_data',
                properties: {
                    rows: 10,
                    cols: 38
                },
                configs: []
            },
            {
                id: 'shape',
                properties: {},
                configs: [],
                lookupGroups: [
                    {displayName: 'Flexible Virtual Machine', simpleFilter: (r) => r.isFlexible},
                    {displayName: 'Virtual Machine', simpleFilter: (r) => !r.isFlexible && r.id.startsWith('VM.')},
                    {displayName: 'Bare Metal', simpleFilter: (r) => !r.isFlexible && r.id.startsWith('BM.')}
                ]
            },
            {
                id: 'source_details.boot_volume_size_in_gbs',
                properties: {
                    min: 50
                },
                configs: []
            },
            {
                id: 'source_details.source_id',
                properties: {},
                configs: [],
                resourceFilter: (r, resource, rootResource) => r.shapes.includes(rootResource.shape),
                lookupGroups: [
                    {displayName: 'Oracle', simpleFilter: (r) => r.id.startsWith('Oracle')},
                    {displayName: 'Windows', simpleFilter: (r) => r.id.startsWith('Windows')},
                    {displayName: 'Canonical', simpleFilter: (r) => r.id.startsWith('Canonical')},
                    {displayName: 'CentOS', simpleFilter: (r) => r.id.startsWith('CentOS')},
                    {displayName: 'Others', simpleFilter: (r) => ! r.id.startsWith('Oracle') && r.id.startsWith('Windows') && r.id.startsWith('Canonical') && r.id.startsWith('CentOS')}
                ]
            },
            {
                id: 'source_details.source_type',
                properties: {},
                configs: [],
                options: [
                    {id: 'image', displayName: 'Image'}
                ]
            }
        ]
    }
}
