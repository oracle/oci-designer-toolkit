/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { describe, expect, it } from 'vitest'
import {
    DEFAULT_STEP1,
    normalizeStep1,
    serializeStep1Config,
    validateStep1,
} from '../OcdLzStep1Config'

describe('OcdLzStep1Config', () => {
    it('serializes the default config jsonnet', () => {
        expect(serializeStep1Config(DEFAULT_STEP1)).toContain("region_short_name: 'fra'")
        expect(serializeStep1Config(DEFAULT_STEP1)).toContain("kind: 'hub_a'")
        expect(serializeStep1Config(DEFAULT_STEP1)).toContain("network: { vcn: '10.100.0.0/21' }")
        expect(serializeStep1Config(DEFAULT_STEP1)).toContain("security_targets: ['prod']")
        expect(serializeStep1Config(DEFAULT_STEP1)).toContain('prod: {}')
        expect(serializeStep1Config(DEFAULT_STEP1)).toContain('preprod: {}')
        expect(serializeStep1Config(DEFAULT_STEP1)).toContain('dev: {}')
    })

    it('quotes environment keys that are not plain identifiers', () => {
        expect(serializeStep1Config({
            ...DEFAULT_STEP1,
            environments: [
                { name: 'prod', securityZone: true },
                { name: 'pre-prod', securityZone: false },
            ],
        })).toContain("'pre-prod': {}")
    })

    it('normalizes comma and newline separated environments', () => {
        expect(normalizeStep1({
            ...DEFAULT_STEP1,
            environments: ' prod, preprod\n dev ',
        }).environments).toEqual([
            { name: 'prod', securityZone: false },
            { name: 'preprod', securityZone: false },
            { name: 'dev', securityZone: false },
        ])
    })

    it('normalizes legacy string environments and security zone objects', () => {
        expect(normalizeStep1({
            ...DEFAULT_STEP1,
            environments: ['prod', { name: 'preprod', securityZone: true }],
        }).environments).toEqual([
            { name: 'prod', securityZone: false },
            { name: 'preprod', securityZone: true },
        ])
    })

    it('rejects invalid input before rendering', () => {
        expect(validateStep1({ ...DEFAULT_STEP1, region: '' }).errors).toContain('Region is required.')
        expect(validateStep1({ ...DEFAULT_STEP1, environments: [] }).errors).toContain('At least one environment is required.')
        expect(validateStep1({ ...DEFAULT_STEP1, environments: ['prod', 'prod'] }).errors).toContain('Environment names must be unique.')
        expect(validateStep1({ ...DEFAULT_STEP1, environments: ['1prod'] }).errors).toContain('Environment "1prod" must start with a letter and contain only letters, numbers, underscores, or hyphens.')
        expect(validateStep1({ ...DEFAULT_STEP1, realm: 'oc2' }).errors).toContain('Realm must be one of: oc1, oc19.')
        expect(validateStep1({ ...DEFAULT_STEP1, realm: 'oc19', region: 'eu-frankfurt-1' }).errors).toContain('Region must belong to the selected realm.')
    })
})
