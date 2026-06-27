import { describe, expect, it } from 'vitest'
import { buildResourceManagerRecentPlanDisplayList } from '../OcdResourceManagerRecentPlans'
import type { OcdResourceManagerRecentPlan } from '../OcdResourceManagerPlanRegistry'

const plan = (overrides: Partial<OcdResourceManagerRecentPlan>): OcdResourceManagerRecentPlan => ({
    id: 'plan',
    origin: 'designer',
    profile: 'DEFAULT',
    region: 'eu-frankfurt-1',
    stackName: 'Stack',
    stackId: 'stack',
    jobId: 'job',
    submittedAt: '2026-06-12T00:00:00.000Z',
    ...overrides,
})

describe('OcdResourceManagerRecentPlans', () => {
    it('prioritizes plans matching the active profile and region without dropping other history', () => {
        const plans = [
            plan({ id: 'other-region', region: 'uk-london-1', jobId: 'job-other-region' }),
            plan({ id: 'matching-a', jobId: 'job-a' }),
            plan({ id: 'other-profile', profile: 'CAP', jobId: 'job-other-profile' }),
            plan({ id: 'matching-b', jobId: 'job-b' }),
        ]

        expect(buildResourceManagerRecentPlanDisplayList(plans, {
            profile: 'DEFAULT',
            region: 'eu-frankfurt-1',
        }).map((recentPlan) => recentPlan.id)).toEqual([
            'matching-a',
            'matching-b',
            'other-region',
            'other-profile',
        ])
    })

    it('applies the display limit after profile and region prioritization', () => {
        const plans = [
            plan({ id: 'other-region', region: 'uk-london-1' }),
            plan({ id: 'matching-a', jobId: 'job-a' }),
            plan({ id: 'matching-b', jobId: 'job-b' }),
        ]

        expect(buildResourceManagerRecentPlanDisplayList(plans, {
            profile: 'DEFAULT',
            region: 'eu-frankfurt-1',
        }, 2).map((recentPlan) => recentPlan.id)).toEqual(['matching-a', 'matching-b'])
    })
})
