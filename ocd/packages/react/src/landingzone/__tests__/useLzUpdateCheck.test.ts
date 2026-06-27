import { describe, expect, it } from 'vitest'
import { LzSource } from '../OcdLzSources'
import { buildEffectiveLzUpdateSources, shouldForceLzUpdateCheck } from '../useLzUpdateCheck'

const source: LzSource = {
    key: 'landing-zone-next-gen',
    label: 'Landing Zone Next Gen',
    repo: 'iwanhoogendoorn/landing-zone-next-gen',
    kind: 'commit',
    pinnedRef: 'old-pin',
    role: 'project-addon',
}

describe('useLzUpdateCheck source preparation', () => {
    it('overrides manifest pins with backend-reported source pins without mutating input sources', () => {
        const sources = [source]
        const effective = buildEffectiveLzUpdateSources(sources, {
            'landing-zone-next-gen': 'new-pin',
        })

        expect(effective).toEqual([
            {
                ...source,
                pinnedRef: 'new-pin',
            },
        ])
        expect(sources[0].pinnedRef).toBe('old-pin')
    })

    it('keeps manifest pins when backend source health has no pin for a source', () => {
        expect(buildEffectiveLzUpdateSources([source], {})).toEqual([source])
    })

    it('forces update checks when backend-pinned refs changed or the user explicitly refreshes', () => {
        expect(shouldForceLzUpdateCheck({ explicitForce: false, pinnedRefsChanged: false, githubTokenChanged: false })).toBe(false)
        expect(shouldForceLzUpdateCheck({ explicitForce: true, pinnedRefsChanged: false, githubTokenChanged: false })).toBe(true)
        expect(shouldForceLzUpdateCheck({ explicitForce: false, pinnedRefsChanged: true, githubTokenChanged: false })).toBe(true)
        expect(shouldForceLzUpdateCheck({ explicitForce: false, pinnedRefsChanged: false, githubTokenChanged: true })).toBe(true)
    })
})
