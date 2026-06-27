/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
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
                    // Issues #434 / #633: OCI compute boot volumes commonly default to ~47GB
                    // (Oracle Linux image default), so a 50GB floor rejects valid imported
                    // tenancy resources. Block volumes keep the 50GB OCI minimum (see OciVolume.ts).
                    min: 47
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
            },
            {
                // Issue #563: surface the full standard OCI Oracle Cloud Agent plugin set
                // (previously only the Management/Monitoring booleans were exposed). Each
                // plugin is added via the agent_config.plugins_config list with a name and
                // desired_state; these options drive the name suggestion datalist.
                id: 'agent_config.plugins_config.name',
                properties: {},
                configs: [],
                options: [
                    {id: 'Bastion', displayName: 'Bastion'},
                    {id: 'Block Volume Management', displayName: 'Block Volume Management'},
                    {id: 'Cloud Guard Workload Protection', displayName: 'Cloud Guard Workload Protection'},
                    {id: 'Compute HPC RDMA Authentication', displayName: 'Compute HPC RDMA Authentication'},
                    {id: 'Compute HPC RDMA Auto-Configuration', displayName: 'Compute HPC RDMA Auto-Configuration'},
                    {id: 'Compute Instance Monitoring', displayName: 'Compute Instance Monitoring'},
                    {id: 'Compute Instance Run Command', displayName: 'Compute Instance Run Command'},
                    {id: 'Compute RDMA GPU Monitoring', displayName: 'Compute RDMA GPU Monitoring'},
                    {id: 'Custom Logs Monitoring', displayName: 'Custom Logs Monitoring'},
                    {id: 'Management Agent', displayName: 'Management Agent'},
                    {id: 'OS Management Hub Agent', displayName: 'OS Management Hub Agent'},
                    {id: 'OS Management Service Agent', displayName: 'OS Management Service Agent'},
                    {id: 'Oracle Autonomous Linux', displayName: 'Oracle Autonomous Linux'},
                    {id: 'Vulnerability Scanning', displayName: 'Vulnerability Scanning'}
                ]
            },
            {
                id: 'agent_config.plugins_config.desired_state',
                properties: {},
                configs: [],
                options: [
                    {id: 'ENABLED', displayName: 'Enabled'},
                    {id: 'DISABLED', displayName: 'Disabled'}
                ]
            }
        ]
    }
}
