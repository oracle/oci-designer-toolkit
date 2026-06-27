/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { describe, expect, it } from 'vitest'
import { buildUpdatePlan, compareUrl, shortRef, SETUP_LZ_COMMAND } from '../OcdLzUpdatePlan'
import { LzUpdateStatus } from '../OcdLzUpdateCheck'

function status(partial: Partial<LzUpdateStatus>): LzUpdateStatus {
    return {
        key: 'k', label: 'L', repo: 'o/r', kind: 'commit',
        current: '', latest: '', latestShort: '', updateAvailable: false,
        url: '', date: '',
        ...partial,
    }
}

describe('shortRef', () => {
    it('truncates a long commit sha to 12 chars', () => {
        expect(shortRef('917f56214282b2d301d95dbce799e79fb0cd94d0')).toBe('917f56214282')
    })
    it('returns (unpinned) for an empty ref', () => {
        expect(shortRef('')).toBe('(unpinned)')
    })
    it('returns short refs / tags verbatim', () => {
        expect(shortRef('v1.2.0')).toBe('v1.2.0')
    })
})

describe('compareUrl', () => {
    it('builds a compare URL when both refs are present', () => {
        expect(compareUrl('o/r', 'aaaa', 'bbbb')).toBe('https://github.com/o/r/compare/aaaa...bbbb')
    })
    it('falls back to commits when there is no base ref', () => {
        expect(compareUrl('o/r', '', 'bbbb')).toBe('https://github.com/o/r/commits')
    })
    it('falls back to the repo when nothing is known', () => {
        expect(compareUrl('o/r', '', '')).toBe('https://github.com/o/r')
    })
})

describe('buildUpdatePlan', () => {
    it('reports no updates when nothing is available', () => {
        const plan = buildUpdatePlan([status({ updateAvailable: false })])
        expect(plan.hasUpdates).toBe(false)
        expect(plan.items).toHaveLength(0)
        expect(plan.command).toBe(SETUP_LZ_COMMAND)
    })

    it('includes only sources with an update available', () => {
        const plan = buildUpdatePlan([
            status({ key: 'a', updateAvailable: true, current: 'old1', latest: 'new1', latestShort: 'new1' }),
            status({ key: 'b', updateAvailable: false }),
        ])
        expect(plan.hasUpdates).toBe(true)
        expect(plan.items.map((i) => i.key)).toEqual(['a'])
        expect(plan.items[0].compareUrl).toBe('https://github.com/o/r/compare/old1...new1')
        expect(plan.pinFiles).toContain('scripts/setup_landing_zone.mjs')
    })

    it('derives a short ref when latestShort is absent', () => {
        const plan = buildUpdatePlan([
            status({ updateAvailable: true, current: 'x', latest: '917f56214282b2d301d95dbce799e79fb0cd94d0', latestShort: '' }),
        ])
        expect(plan.items[0].toRefShort).toBe('917f56214282')
    })
})
