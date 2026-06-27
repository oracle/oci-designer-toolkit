/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { ResourceElementConfig } from "../../../../OcdPropertyTypes"
import { OciCommonConfigs } from "../../OciCommonConfigs"

export namespace OciOkeNodePoolConfigs {
    export function configs(): ResourceElementConfig[] {
        return [
            ...OciCommonConfigs.configs(),
            {
                id: 'node_shape',
                properties: {
                    placeholder: 'VM.Standard.E5.Flex',
                    pattern: '^([A-Za-z0-9]+\\.)+[A-Za-z0-9]+$|^var\\.+$',
                    title: 'Use a valid OCI compute shape, for example VM.Standard.E5.Flex.'
                },
                configs: []
            },
            {
                id: 'node_config_details.size',
                properties: {
                    min: 1,
                    title: 'Node pool size must be at least 1.'
                },
                configs: []
            },
            {
                id: 'node_config_details.node_pool_pod_network_option_details.cni_type',
                properties: {
                    placeholder: 'OCI_VCN_IP_NATIVE',
                    pattern: '^(FLANNEL_OVERLAY|OCI_VCN_IP_NATIVE)$|^var\\.+$',
                    title: 'Use FLANNEL_OVERLAY or OCI_VCN_IP_NATIVE.'
                },
                configs: []
            },
            {
                id: 'node_config_details.node_pool_pod_network_option_details.max_pods_per_node',
                properties: {
                    min: 1,
                    max: 110,
                    title: 'Max pods per node should be between 1 and 110.'
                },
                configs: []
            },
            {
                id: 'node_pool_cycling_details.maximum_surge',
                properties: {
                    placeholder: '1 or 20%',
                    pattern: '^([0-9]+|[0-9]+%)$|^var\\.+$',
                    title: 'Use an absolute node count or percentage, for example 1 or 20%.'
                },
                configs: []
            },
            {
                id: 'node_pool_cycling_details.maximum_unavailable',
                properties: {
                    placeholder: '0 or 10%',
                    pattern: '^([0-9]+|[0-9]+%)$|^var\\.+$',
                    title: 'Use an absolute node count or percentage, for example 0 or 10%.'
                },
                configs: []
            },
            {
                id: 'node_shape_config.memory_in_gbs',
                properties: {
                    min: 1,
                    title: 'Flexible node shapes require memory in GB greater than 0.'
                },
                configs: []
            },
            {
                id: 'node_shape_config.ocpus',
                properties: {
                    min: 1,
                    title: 'Flexible node shapes require at least 1 OCPU.'
                },
                configs: []
            }
        ]
    }
}
