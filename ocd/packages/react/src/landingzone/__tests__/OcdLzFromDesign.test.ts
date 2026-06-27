/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { describe, expect, it } from 'vitest'
import {
    adoptDesignIntoLandingZone,
    deriveLandingZoneConfig,
    environmentNameFromVcn,
} from '../OcdLzFromDesign'
import { DEFAULT_HUB_VCN } from '../OcdLzConfig'
import { LZ_CONFIG_KEY, LZ_ORIGIN_KEY } from '../OcdLzToModel'
import { lzConfigToWizardSeed } from '../OcdLzWizardContext'

// A brownfield design as the Terraform/LZ-JSON importer would produce it: a hub
// VCN with gateways attached, plus two spoke VCNs with no gateways.
const designWith = (resources: Record<string, any[]>) => ({ model: { oci: { resources } } })

const HUB_AND_SPOKES = designWith({
    vcn: [
        { id: 'vcn-hub', displayName: 'lz-hub-vcn', cidr_block: '10.100.0.0/21' },
        { id: 'vcn-prod', displayName: 'prod-spoke', cidr_block: '10.0.64.0/21' },
        { id: 'vcn-dev', displayName: 'Dev Workload VCN', cidr_block: '10.0.128.0/21' },
    ],
    internet_gateway: [{ id: 'ig-1', vcnId: 'vcn-hub' }],
    nat_gateway: [{ id: 'nat-1', vcnId: 'vcn-hub' }],
})

describe('deriveLandingZoneConfig (brownfield round-trip)', () => {
    it('picks the gateway-bearing VCN as the hub', () => {
        const config = deriveLandingZoneConfig(HUB_AND_SPOKES)
        expect(config.hubVcn).toBe('10.100.0.0/21')
    })

    it('maps every non-hub VCN to a spoke environment with a legal name + its CIDR', () => {
        const config = deriveLandingZoneConfig(HUB_AND_SPOKES)
        expect(config.environments).toHaveLength(2)
        expect(config.environments.map((e) => e.name)).toEqual(['prod', 'dev-workload'])
        expect(config.environments.map((e) => e.spokeVcn)).toEqual(['10.0.64.0/21', '10.0.128.0/21'])
        expect(config.environments.every((e) => e.securityZone === false)).toBe(true)
    })

    it('falls back to a named-"hub" VCN when no gateways are present', () => {
        const config = deriveLandingZoneConfig(
            designWith({
                vcn: [
                    { id: 'a', displayName: 'spoke-a', cidr_block: '10.0.64.0/21' },
                    { id: 'b', displayName: 'central-hub', cidr_block: '10.200.0.0/21' },
                ],
            }),
        )
        expect(config.hubVcn).toBe('10.200.0.0/21')
        expect(config.environments).toHaveLength(1)
        expect(config.environments[0].name).toBe('spoke-a')
    })

    it('substitutes the default hub CIDR when the hub VCN has an invalid/missing CIDR', () => {
        const config = deriveLandingZoneConfig(designWith({ vcn: [{ id: 'h', displayName: 'hub', cidr_block: 'not-a-cidr' }] }))
        expect(config.hubVcn).toBe(DEFAULT_HUB_VCN)
        expect(config.environments).toHaveLength(0)
    })

    it('returns a valid config with no spokes when there are no VCNs at all', () => {
        const config = deriveLandingZoneConfig(designWith({}))
        expect(config.hubVcn).toBe(DEFAULT_HUB_VCN)
        expect(config.environments).toEqual([])
    })

    it('reads a hub CIDR from cidr_blocks[] when cidr_block is absent', () => {
        const config = deriveLandingZoneConfig(
            designWith({ vcn: [{ id: 'h', displayName: 'hub', cidr_blocks: ['bad', '10.50.0.0/21'] }] }),
        )
        expect(config.hubVcn).toBe('10.50.0.0/21')
    })

    it('de-duplicates collapsed environment names', () => {
        const config = deriveLandingZoneConfig(
            designWith({
                vcn: [
                    { id: 'h', displayName: 'hub', cidr_block: '10.100.0.0/21' },
                    { id: 's1', displayName: 'prod-vcn', cidr_block: '10.0.64.0/21' },
                    { id: 's2', displayName: 'prod-network', cidr_block: '10.0.128.0/21' },
                ],
            }),
        )
        const names = config.environments.map((e) => e.name)
        expect(new Set(names).size).toBe(names.length)
    })
})

describe('environmentNameFromVcn', () => {
    it('strips topology suffixes and lower-cases', () => {
        expect(environmentNameFromVcn('Prod-VCN', 0)).toBe('prod')
        expect(environmentNameFromVcn('dev-spoke', 1)).toBe('dev')
        expect(environmentNameFromVcn('Shared Network', 2)).toBe('shared')
    })

    it('falls back to env<n> for names that cannot start with a letter', () => {
        expect(environmentNameFromVcn('123-vcn', 3)).toBe('env4')
        expect(environmentNameFromVcn('', 0)).toBe('env1')
    })
})

describe('adoptDesignIntoLandingZone', () => {
    it('stamps a derived config + LZ-origin flag without mutating the input', () => {
        const input = HUB_AND_SPOKES
        const adopted = adoptDesignIntoLandingZone(input)
        expect((input as any).userDefined).toBeUndefined()
        expect(adopted.userDefined?.[LZ_ORIGIN_KEY]).toBe(true)
        expect((adopted.userDefined?.[LZ_CONFIG_KEY] as any).hubVcn).toBe('10.100.0.0/21')
    })

    it('leaves a design that already carries a wizard config untouched', () => {
        const wizard = { userDefined: { [LZ_CONFIG_KEY]: { hubVcn: '10.9.0.0/21' } }, model: { oci: { resources: {} } } }
        expect(adoptDesignIntoLandingZone(wizard)).toBe(wizard)
    })

    // The user-visible contract: "Edit Landing Zone in Wizard" is gated on a
    // non-null wizard seed. A raw import yields null (menu stays inert); the same
    // import after adoption yields a populated seed (menu opens the wizard).
    it('flips a raw import from inert to a live wizard seed', () => {
        expect(lzConfigToWizardSeed(HUB_AND_SPOKES as any)).toBeNull()
        const adopted = adoptDesignIntoLandingZone({ ...HUB_AND_SPOKES, metadata: { title: 'Imported LZ' } })
        const seed = lzConfigToWizardSeed(adopted as any)
        expect(seed).not.toBeNull()
        expect((seed!.data as any).config.hubVcn).toBe('10.100.0.0/21')
        expect((seed!.data as any).config.environments).toHaveLength(2)
        expect((seed!.data as any).title).toBe('Imported LZ')
    })
})
