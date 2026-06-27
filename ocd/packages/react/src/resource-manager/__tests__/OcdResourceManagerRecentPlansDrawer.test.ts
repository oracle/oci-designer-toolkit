import { describe, expect, it } from 'vitest'
import { formatResourceManagerRecentPlanJobCount } from '../OcdResourceManagerRecentPlansDrawer'

describe('OcdResourceManagerRecentPlansDrawer', () => {
    it('formats local Resource Manager PLAN job counts', () => {
        expect(formatResourceManagerRecentPlanJobCount(0)).toBe('0 local jobs')
        expect(formatResourceManagerRecentPlanJobCount(1)).toBe('1 local job')
        expect(formatResourceManagerRecentPlanJobCount(3)).toBe('3 local jobs')
    })
})
