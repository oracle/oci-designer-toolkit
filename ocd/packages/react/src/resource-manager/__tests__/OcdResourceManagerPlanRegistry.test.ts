import { afterEach, describe, expect, it, vi } from 'vitest'
import {
    buildResourceManagerRecentPlanReviewSummary,
    filterResourceManagerRecentPlans,
    findLatestResourceManagerRecentPlan,
    loadResourceManagerRecentPlans,
    makeResourceManagerRecentPlanId,
    removeResourceManagerRecentPlan,
    saveResourceManagerRecentPlan,
} from '../OcdResourceManagerPlanRegistry'

const createMockStorage = (): Storage => {
    let values: Record<string, string> = {}
    return {
        get length() { return Object.keys(values).length },
        clear: vi.fn(() => { values = {} }),
        getItem: vi.fn((key: string) => values[key] ?? null),
        key: vi.fn((index: number) => Object.keys(values)[index] ?? null),
        removeItem: vi.fn((key: string) => { delete values[key] }),
        setItem: vi.fn((key: string, value: string) => { values = { ...values, [key]: value } }),
    }
}

describe('Resource Manager recent plan registry', () => {
    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it('saves newest Resource Manager plans first and filters by source context', () => {
        vi.stubGlobal('localStorage', createMockStorage())

        saveResourceManagerRecentPlan({
            origin: 'designer',
            profile: 'DEFAULT',
            region: 'eu-frankfurt-1',
            stackName: 'designer-plan',
            jobId: 'designer-job',
            submittedAt: '2026-06-12T10:00:00.000Z',
        })
        saveResourceManagerRecentPlan({
            origin: 'discovery',
            profile: 'DEFAULT',
            region: 'eu-frankfurt-1',
            stackName: 'discovery-plan',
            jobId: 'discovery-job',
            packageDigest: 'fnv1a-12345678',
            submittedAt: '2026-06-12T11:00:00.000Z',
        })

        expect(loadResourceManagerRecentPlans().map((plan) => plan.jobId)).toEqual(['discovery-job', 'designer-job'])
        expect(findLatestResourceManagerRecentPlan({
            origin: 'discovery',
            profile: 'DEFAULT',
            region: 'eu-frankfurt-1',
        })).toMatchObject({
            packageDigest: 'fnv1a-12345678',
            stackName: 'discovery-plan',
        })
    })

    it('deduplicates by profile, region, and job id while retaining only the latest entries', () => {
        vi.stubGlobal('localStorage', createMockStorage())
        for (let index = 0; index < 12; index += 1) {
            saveResourceManagerRecentPlan({
                origin: 'discovery',
                profile: 'DEFAULT',
                region: 'eu-frankfurt-1',
                stackName: `plan-${index}`,
                jobId: `job-${index}`,
                submittedAt: `2026-06-12T11:${String(index).padStart(2, '0')}:00.000Z`,
            })
        }
        saveResourceManagerRecentPlan({
            origin: 'discovery',
            profile: 'DEFAULT',
            region: 'eu-frankfurt-1',
            stackName: 'updated-plan',
            jobId: 'job-11',
            submittedAt: '2026-06-12T12:00:00.000Z',
        })

        const plans = loadResourceManagerRecentPlans()
        expect(plans).toHaveLength(10)
        expect(plans[0]).toMatchObject({
            id: makeResourceManagerRecentPlanId('DEFAULT', 'eu-frankfurt-1', 'job-11'),
            stackName: 'updated-plan',
        })
        expect(new Set(plans.map((plan) => plan.id)).size).toBe(plans.length)
    })

    it('removes entries and ignores unavailable localStorage', () => {
        vi.stubGlobal('localStorage', createMockStorage())
        const saved = saveResourceManagerRecentPlan({
            origin: 'discovery',
            profile: 'DEFAULT',
            region: 'eu-frankfurt-1',
            stackName: 'discovery-plan',
            jobId: 'job-to-remove',
        })
        expect(saved).toBeDefined()

        removeResourceManagerRecentPlan(saved?.id ?? '')
        expect(loadResourceManagerRecentPlans()).toEqual([])

        vi.stubGlobal('localStorage', undefined)
        expect(loadResourceManagerRecentPlans()).toEqual([])
        expect(saveResourceManagerRecentPlan({
            origin: 'discovery',
            profile: 'DEFAULT',
            region: 'eu-frankfurt-1',
            stackName: 'discovery-plan',
            jobId: 'no-storage-job',
        })).toBeDefined()
    })

    it('filters in-memory recent plan lists with the shared matching rules', () => {
        vi.stubGlobal('localStorage', createMockStorage())
        saveResourceManagerRecentPlan({
            origin: 'designer',
            profile: 'DEFAULT',
            region: 'eu-frankfurt-1',
            stackName: 'designer-plan',
            jobId: 'designer-job',
        })
        saveResourceManagerRecentPlan({
            origin: 'discovery',
            profile: 'CAP',
            region: 'uk-london-1',
            stackName: 'discovery-plan',
            jobId: 'discovery-job',
        })

        expect(filterResourceManagerRecentPlans(loadResourceManagerRecentPlans(), {
            profile: ' DEFAULT ',
            region: ' eu-frankfurt-1 ',
        }).map((plan) => plan.jobId)).toEqual(['designer-job'])
    })

    it('builds recent plan review summaries that expose stale discovery package drift', () => {
        const submittedAt = '2026-06-12T12:00:00.000Z'

        expect(buildResourceManagerRecentPlanReviewSummary(undefined, 'fnv1a-current')).toEqual({
            state: 'missing',
            label: 'No recent PLAN',
            detail: 'Submit a Resource Manager PLAN for the current package before reviewing apply output.',
        })
        expect(buildResourceManagerRecentPlanReviewSummary({
            origin: 'discovery',
            profile: 'DEFAULT',
            region: 'eu-frankfurt-1',
            stackName: 'discovery-stack',
            jobId: 'job-1',
            packageDigest: 'fnv1a-current',
            submittedAt,
        }, 'fnv1a-current')).toEqual({
            state: 'current',
            label: 'Recent PLAN current',
            detail: 'discovery-stack / job-1 / current',
        })
        expect(buildResourceManagerRecentPlanReviewSummary({
            origin: 'discovery',
            profile: 'DEFAULT',
            region: 'eu-frankfurt-1',
            stackName: 'discovery-stack',
            jobId: 'job-1',
            packageDigest: 'fnv1a-stale',
            submittedAt,
        }, 'fnv1a-current')).toEqual({
            state: 'stale',
            label: 'Recent PLAN stale',
            detail: 'Generated package changed since job job-1. Submit a new PLAN before apply.',
        })
        expect(buildResourceManagerRecentPlanReviewSummary({
            origin: 'designer',
            profile: 'DEFAULT',
            region: 'eu-frankfurt-1',
            stackName: 'designer-stack',
            jobId: 'job-2',
            submittedAt,
        })).toMatchObject({
            state: 'current',
            label: 'Recent PLAN current',
            detail: 'designer-stack / job-2',
        })
    })
})
