/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { describe, expect, it } from 'vitest'
import {
    DEFAULT_CONFIG,
    LandingZoneConfig,
    fromStep1,
    normalizeConfig,
    serializeLandingZoneConfig,
    upgradeConfig,
    validateConfig,
} from '../OcdLzConfig'

const BASE: LandingZoneConfig = {
    region: 'eu-frankfurt-1',
    regionShortName: 'fra',
    realm: 'oc1',
    hubKind: 'hub_a',
    hubVcn: '10.100.0.0/21',
    environments: [
        { name: 'prod', securityZone: true, spokeVcn: '10.0.64.0/21', projects: ['proj1'], platforms: [] },
        { name: 'preprod', securityZone: false, spokeVcn: '10.0.128.0/21', projects: ['proj1'], platforms: [] },
    ],
}

describe('OcdLzConfig serialization (OE schema)', () => {
    it('emits hub.kind + hub.network.vcn', () => {
        const out = serializeLandingZoneConfig(BASE)
        expect(out).toContain("kind: 'hub_a'")
        expect(out).toContain("network: { vcn: '10.100.0.0/21' }")
        expect(out).toContain("security_targets: ['prod']")
    })

    it('emits per-env shared_project_network + projects (config.libsonnet keys)', () => {
        const out = serializeLandingZoneConfig(BASE)
        expect(out).toContain("shared_project_network: { network: { vcn: '10.0.64.0/21' } }")
        expect(out).toContain('proj1: {}')
        // both environments present
        expect(out).toContain('prod: {')
        expect(out).toContain('preprod: {')
    })

    it('emits oke_simple platform with required network + extension params', () => {
        const out = serializeLandingZoneConfig({
            ...BASE,
            environments: [
                {
                    name: 'prod',
                    securityZone: true,
                    spokeVcn: '10.0.64.0/21',
                    projects: ['proj1'],
                    platforms: [{ platformName: 'oke', type: 'oke_simple', vcn: '10.0.80.0/21', projects: [] }],
                },
            ],
        })
        expect(out).toContain('platforms: {')
        expect(out).toContain('oke: {')
        expect(out).toContain("network: { vcn: '10.0.80.0/21' }")
        expect(out).toContain("type: 'oke_simple'")
        expect(out).toContain('kubernetes_version:')
    })

    it('emits exacc platform WITHOUT a network block (network_mode forbidden)', () => {
        const out = serializeLandingZoneConfig({
            ...BASE,
            environments: [
                {
                    name: 'prod',
                    securityZone: true,
                    spokeVcn: '10.0.64.0/21',
                    projects: ['proj1'],
                    platforms: [{ platformName: 'exacc', type: 'exacc', vcn: '', projects: ['proj1'] }],
                },
            ],
        })
        expect(out).toContain("type: 'exacc'")
        expect(out).toContain("project_db_compartments: ['proj1']")
        // exacc platform block must not contain a network: line
        const exaccBlock = out.slice(out.indexOf('exacc: {'))
        expect(exaccBlock.slice(0, exaccBlock.indexOf('extension:'))).not.toContain('network:')
    })

    it('omits shared_project_network when spoke VCN is blank (hub-only env)', () => {
        const out = serializeLandingZoneConfig({
            ...BASE,
            environments: [{ name: 'mgmt', securityZone: false, spokeVcn: '', projects: ['proj1'], platforms: [] }],
        })
        expect(out).not.toContain('shared_project_network')
        expect(out).toContain('mgmt: {')
    })
})

describe('OcdLzConfig validation', () => {
    it('flags invalid hub VCN', () => {
        expect(validateConfig({ ...BASE, hubVcn: 'nope' }).errors.some((e) => e.includes('Hub VCN'))).toBe(true)
    })

    it('requires a VCN for oke_simple (network_mode required)', () => {
        const errors = validateConfig({
            ...BASE,
            environments: [
                {
                    name: 'prod',
                    securityZone: true,
                    spokeVcn: '10.0.64.0/21',
                    projects: ['proj1'],
                    platforms: [{ platformName: 'oke', type: 'oke_simple', vcn: '', projects: [] }],
                },
            ],
        }).errors
        expect(errors.some((e) => e.includes('requires a valid VCN'))).toBe(true)
    })

    it('rejects platform projects not declared on the environment', () => {
        const errors = validateConfig({
            ...BASE,
            environments: [
                {
                    name: 'prod',
                    securityZone: true,
                    spokeVcn: '10.0.64.0/21',
                    projects: ['proj1'],
                    platforms: [{ platformName: 'exacc', type: 'exacc', vcn: '', projects: ['ghost'] }],
                },
            ],
        }).errors
        expect(errors.some((e) => e.includes('unknown project "ghost"'))).toBe(true)
    })
})

describe('OcdLzConfig backward compatibility', () => {
    it('upgrades a Phase 1 step1 draft into the full model', () => {
        const phase1 = {
            region: 'eu-frankfurt-1',
            regionShortName: 'fra',
            realm: 'oc1',
            environments: [
                { name: 'prod', securityZone: true },
                { name: 'dev', securityZone: false },
            ],
        }
        const upgraded = upgradeConfig(phase1)
        expect(upgraded.hubKind).toBe('hub_a')
        expect(upgraded.hubVcn).toBe('10.100.0.0/21')
        expect(upgraded.environments[0].projects.length).toBeGreaterThan(0)
        expect(upgraded.environments[0].spokeVcn).toMatch(/\/21$/)
    })

    it('round-trips a Phase 2 draft', () => {
        const upgraded = upgradeConfig(BASE)
        expect(upgraded.environments[0].platforms).toEqual([])
        expect(normalizeConfig(upgraded)).toEqual(upgraded)
    })

    it('fromStep1 preserves env names + security zones', () => {
        const out = fromStep1({
            region: 'eu-frankfurt-1',
            regionShortName: 'fra',
            realm: 'oc1',
            environments: [{ name: 'prod', securityZone: true }],
        })
        expect(out.environments[0].name).toBe('prod')
        expect(out.environments[0].securityZone).toBe(true)
    })

    it('DEFAULT_CONFIG serializes cleanly', () => {
        expect(() => serializeLandingZoneConfig(DEFAULT_CONFIG)).not.toThrow()
    })
})
