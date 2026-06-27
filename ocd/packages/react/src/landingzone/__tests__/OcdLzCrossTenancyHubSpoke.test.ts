/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { describe, expect, it } from 'vitest'
import { OcdDesign } from '@ocd/model'
import { LandingZoneConfig } from '../OcdLzConfig'
import { buildOcdDesignFromLz } from '../OcdLzToModel'
import {
    applyCrossTenancyHubSpokeOverlay,
    findCrossTenancyResource,
    isCrossTenancyHubSpokeEnabled,
    LZ_CROSSTENANCY_HUBSPOKE_ENABLED_KEY,
} from '../OcdLzCrossTenancyHubSpoke'

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
    design.userDefined[LZ_CROSSTENANCY_HUBSPOKE_ENABLED_KEY] = enabled
    return design
}

function ociList(design: OcdDesign, key: string): Record<string, unknown>[] {
    return (design.model.oci.resources?.[key] ?? []) as Record<string, unknown>[]
}

describe('OcdLzCrossTenancyHubSpoke', () => {
    it('is a no-op (same reference) when the toggle is off', () => {
        const design = makeDesign(false)
        expect(isCrossTenancyHubSpokeEnabled(design)).toBe(false)
        expect(applyCrossTenancyHubSpokeOverlay(design)).toBe(design)
    })

    it('is a no-op for a non-LZ design even when enabled', () => {
        const design = makeDesign(true)
        design.userDefined.lzOrigin = false
        expect(applyCrossTenancyHubSpokeOverlay(design)).toBe(design)
    })

    it('materialises a symmetric two-tenancy DRG + RPC topology when enabled', () => {
        const before = ociList(makeDesign(false), 'drg').length
        const result = applyCrossTenancyHubSpokeOverlay(makeDesign(true))
        // Two DRGs (hub + peer) added on top of any LZ-origin DRGs.
        expect(ociList(result, 'drg').length).toBe(before + 2)
        // Hub + peer VCNs, transit subnets, DRG attachments, and the RPC pair.
        expect(findCrossTenancyResource(result, 'hub_vcn')).toBeDefined()
        expect(findCrossTenancyResource(result, 'peer_vcn')).toBeDefined()
        expect(ociList(result, 'remote_peering_connection')).toHaveLength(2)
        expect(ociList(result, 'drg_attachment').length).toBeGreaterThanOrEqual(2)
    })

    it('uses non-overlapping CIDRs across the peered tenancies', () => {
        const result = applyCrossTenancyHubSpokeOverlay(makeDesign(true))
        const hubVcn = findCrossTenancyResource(result, 'hub_vcn')
        const peerVcn = findCrossTenancyResource(result, 'peer_vcn')
        expect(hubVcn?.cidrBlocks).toEqual(['10.0.0.0/16'])
        expect(peerVcn?.cidrBlocks).toEqual(['10.1.0.0/16'])
    })

    it('expresses cross-tenancy via RPC peerTenancyId on each DRG and cross-links them', () => {
        const result = applyCrossTenancyHubSpokeOverlay(makeDesign(true))
        const hubDrg = findCrossTenancyResource(result, 'hub_drg')
        const peerDrg = findCrossTenancyResource(result, 'peer_drg')
        const hubRpc = findCrossTenancyResource(result, 'hub_rpc')
        const peerRpc = findCrossTenancyResource(result, 'peer_rpc')
        // Each RPC sits on its own tenancy's DRG.
        expect(hubRpc?.drgId).toBe(hubDrg?.id)
        expect(peerRpc?.drgId).toBe(peerDrg?.id)
        // The cross-tenancy link: each RPC names the PEER tenancy.
        expect(hubRpc?.peerTenancyId).toBe('<peer-tenancy-ocid>')
        expect(peerRpc?.peerTenancyId).toBe('<hub-tenancy-ocid>')
        // The handshake cross-link.
        expect(hubRpc?.peerId).toBe(peerRpc?.id)
        expect(peerRpc?.peerId).toBe(hubRpc?.id)
    })

    it('attaches each VCN to its own DRG', () => {
        const result = applyCrossTenancyHubSpokeOverlay(makeDesign(true))
        const hubDrg = findCrossTenancyResource(result, 'hub_drg')
        const hubVcn = findCrossTenancyResource(result, 'hub_vcn')
        const hubAttachment = findCrossTenancyResource(result, 'hub_attachment')
        expect(hubAttachment?.drgId).toBe(hubDrg?.id)
        expect((hubAttachment?.networkDetails as { ids?: string[] })?.ids).toEqual([hubVcn?.id])
    })

    it('is idempotent — re-applying does not duplicate resources', () => {
        const once = applyCrossTenancyHubSpokeOverlay(makeDesign(true))
        const twice = applyCrossTenancyHubSpokeOverlay(once)
        expect(ociList(twice, 'remote_peering_connection')).toHaveLength(2)
        expect(JSON.stringify(twice)).toBe(JSON.stringify(once))
    })

    it('does not mutate the input design', () => {
        const design = makeDesign(true)
        const before = JSON.stringify(design)
        applyCrossTenancyHubSpokeOverlay(design)
        expect(JSON.stringify(design)).toBe(before)
    })
})
