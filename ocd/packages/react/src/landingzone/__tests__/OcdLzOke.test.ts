/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { describe, expect, it } from 'vitest'
import { OcdDesign } from '@ocd/model'
import { LandingZoneConfig } from '../OcdLzConfig'
import { buildOcdDesignFromLz } from '../OcdLzToModel'
import {
    applyOkeNativeOverlay,
    findOkeResource,
    isOkeNativeEnabled,
    LZ_OKE_NATIVE_ENABLED_KEY,
} from '../OcdLzOke'

function makeConfig(): LandingZoneConfig {
    return {
        region: 'eu-frankfurt-1',
        regionShortName: 'fra',
        realm: 'oc1',
        hubKind: 'hub_a',
        hubVcn: '10.100.0.0/21',
        environments: [{ name: 'prod', securityZone: true, spokeVcn: '10.0.0.0/21', projects: ['proj1'], platforms: [] }],
    }
}

function makeDesign(enabled = false): OcdDesign {
    const design = buildOcdDesignFromLz([], 'Landing Zone', makeConfig()).design
    design.userDefined[LZ_OKE_NATIVE_ENABLED_KEY] = enabled
    return design
}

function ociList(design: OcdDesign, key: string): Record<string, unknown>[] {
    return (design.model.oci.resources?.[key] ?? []) as Record<string, unknown>[]
}

describe('OcdLzOke', () => {
    it('is a no-op (same reference) when the toggle is off', () => {
        const design = makeDesign(false)
        expect(isOkeNativeEnabled(design)).toBe(false)
        expect(applyOkeNativeOverlay(design)).toBe(design)
    })

    it('is a no-op for a non-LZ design even when enabled', () => {
        const design = makeDesign(true)
        design.userDefined.lzOrigin = false
        expect(applyOkeNativeOverlay(design)).toBe(design)
    })

    it('materialises the OKE-native topology when enabled', () => {
        const result = applyOkeNativeOverlay(makeDesign(true))
        expect(ociList(result, 'oke_cluster')).toHaveLength(1)
        expect(ociList(result, 'oke_node_pool')).toHaveLength(1)
        // 4 OKE subnets (api/node/pod/lb).
        expect(ociList(result, 'subnet')).toHaveLength(4)
        expect(ociList(result, 'network_security_group')).toHaveLength(1)
        expect(ociList(result, 'dynamic_group')).toHaveLength(1)
        expect(ociList(result, 'policy')).toHaveLength(1)
        expect(ociList(result, 'vault')).toHaveLength(1)
        expect(ociList(result, 'key')).toHaveLength(1)
    })

    it('gives the pod subnet a large dedicated CIDR (VCN-native CNI)', () => {
        const result = applyOkeNativeOverlay(makeDesign(true))
        const podSubnet = findOkeResource(result, 'pod_subnet')
        const nodeSubnet = findOkeResource(result, 'node_subnet')
        expect(podSubnet?.displayName).toBe('OKE Pod Subnet (VCN-native CNI)')
        expect(podSubnet?.cidrBlock).toBe('10.0.16.0/20') // >=4096 IPs
        expect(nodeSubnet?.cidrBlock).toBe('10.0.1.0/24')
        // Pod subnet is distinct from the node subnet — the key VCN-native rule.
        expect(podSubnet?.id).not.toBe(nodeSubnet?.id)
    })

    it('uses an enhanced cluster (required for Workload Identity) and wires the node pool', () => {
        const result = applyOkeNativeOverlay(makeDesign(true))
        const cluster = findOkeResource(result, 'cluster')
        const nodePool = findOkeResource(result, 'node_pool')
        expect(cluster?.displayName).toBe('OKE Cluster (enhanced)')
        expect(cluster?.type).toBe('ENHANCED')
        expect(nodePool?.clusterId).toBe(cluster?.id)
    })

    it('wires the key to the vault and emits Workload Identity DG + policy', () => {
        const result = applyOkeNativeOverlay(makeDesign(true))
        const vault = findOkeResource(result, 'vault')
        const key = findOkeResource(result, 'key')
        const dg = findOkeResource(result, 'dynamic_group')
        const policy = findOkeResource(result, 'policy')
        expect(key?.vaultId).toBe(vault?.id)
        expect(String(dg?.matchingRule)).toContain("resource.type = 'workload'")
        expect((policy?.statements as string[]).length).toBeGreaterThan(0)
    })

    it('is idempotent — re-applying does not duplicate resources', () => {
        const once = applyOkeNativeOverlay(makeDesign(true))
        const twice = applyOkeNativeOverlay(once)
        expect(ociList(twice, 'subnet')).toHaveLength(4)
        expect(ociList(twice, 'oke_cluster')).toHaveLength(1)
        expect(JSON.stringify(twice)).toBe(JSON.stringify(once))
    })

    it('does not mutate the input design', () => {
        const design = makeDesign(true)
        const before = JSON.stringify(design)
        applyOkeNativeOverlay(design)
        expect(JSON.stringify(design)).toBe(before)
    })
})
