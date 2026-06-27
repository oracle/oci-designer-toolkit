import { describe, expect, it } from 'vitest'
import type { OciResourceManagerPlanReview } from '@ocd/query'
import { formatResourceManagerPlanReviewMessage } from '../OcdResourceManagerPlanReview'

const review = (overrides: Partial<OciResourceManagerPlanReview>): OciResourceManagerPlanReview => ({
    job: {
        id: 'job-for-test',
        lifecycleState: 'IN_PROGRESS',
    },
    planText: '',
    terminal: false,
    readyToApply: false,
    ...overrides,
})

describe('Resource Manager plan review helpers', () => {
    it('describes waiting, running, successful, and terminal failed plan states', () => {
        expect(formatResourceManagerPlanReviewMessage(undefined)).toBe('Waiting for Resource Manager plan status...')
        expect(formatResourceManagerPlanReviewMessage(review({}))).toBe('Plan job is still running.')
        expect(formatResourceManagerPlanReviewMessage(review({
            readyToApply: true,
            terminal: true,
            job: { id: 'job-for-test', lifecycleState: 'SUCCEEDED' },
        }))).toBe('Plan succeeded and is ready for explicit review.')
        expect(formatResourceManagerPlanReviewMessage(review({
            terminal: true,
            job: { id: 'job-for-test', lifecycleState: 'FAILED' },
        }))).toBe('Plan job is terminal but not ready to apply.')
    })

    it('allows surfaces to provide more specific messages', () => {
        expect(formatResourceManagerPlanReviewMessage(review({ readyToApply: true, terminal: true }), {
            ready: 'Ready for controlled apply.',
        })).toBe('Ready for controlled apply.')
    })
})
