/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { describe, expect, it } from 'vitest'
import {
    FAULT_DOMAINS_PER_AD,
    getAvailabilityDomainCount,
    getAvailabilityDomains,
    getFaultDomains,
} from '../OcdLzADData'

describe('OcdLzADData', () => {
    it('reports 3 ADs for established multi-AD regions', () => {
        expect(getAvailabilityDomainCount('us-ashburn-1')).toBe(3)
        expect(getAvailabilityDomainCount('eu-frankfurt-1')).toBe(3)
        expect(getAvailabilityDomainCount('uk-london-1')).toBe(3)
        expect(getAvailabilityDomainCount('us-phoenix-1')).toBe(3)
    })

    it('defaults unknown / single-AD regions to 1 AD', () => {
        expect(getAvailabilityDomainCount('eu-amsterdam-1')).toBe(1)
        expect(getAvailabilityDomainCount('not-a-real-region')).toBe(1)
    })

    it('always returns exactly 3 fault domains with aligned tokens', () => {
        const fds = getFaultDomains()
        expect(fds).toHaveLength(FAULT_DOMAINS_PER_AD)
        expect(fds.map((f) => f.token)).toEqual([
            'FAULT-DOMAIN-1',
            'FAULT-DOMAIN-2',
            'FAULT-DOMAIN-3',
        ])
        expect(fds.map((f) => f.label)).toEqual(['FD-1', 'FD-2', 'FD-3'])
    })

    it('builds ADs with index-aligned tokens and 3 FDs each', () => {
        const ads = getAvailabilityDomains('us-ashburn-1')
        expect(ads).toHaveLength(3)
        expect(ads.map((a) => a.token)).toEqual(['1', '2', '3'])
        expect(ads.map((a) => a.label)).toEqual(['AD-1', 'AD-2', 'AD-3'])
        for (const ad of ads) {
            expect(ad.faultDomains).toHaveLength(3)
        }
    })

    it('yields a single AD (still with 3 FDs) for single-AD regions', () => {
        const ads = getAvailabilityDomains('eu-amsterdam-1')
        expect(ads).toHaveLength(1)
        expect(ads[0].token).toBe('1')
        expect(ads[0].faultDomains).toHaveLength(3)
    })

    it('is deterministic (pure) across calls', () => {
        expect(getAvailabilityDomains('us-ashburn-1')).toEqual(getAvailabilityDomains('us-ashburn-1'))
    })
})
