/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { describe, expect, it } from 'vitest'
import {
    getOciConfigProfileNames,
    sanitizeOciConfigProfile,
} from '../../../../query/src/OciBackendService'
import {
    buildResourceManagerJobDetails as buildJobDetails,
    buildResourceManagerPlanReview,
    isResourceManagerJobSucceeded,
    isResourceManagerJobTerminal,
    summariseTerraformPlan,
} from '../../../../query/src/OciResourceManagerQuery'

const parsedConfig = (profiles: Record<string, Record<string, string>>) => ({
    accumulator: {
        configurationsByProfile: new Map(
            Object.entries(profiles).map(([profile, values]) => [profile, new Map(Object.entries(values))])
        ),
    },
})

describe('OciBackendService profile helpers', () => {
    it('returns configured profile names and rejects empty config files', () => {
        expect(getOciConfigProfileNames(parsedConfig({ DEFAULT: { region: 'us-ashburn-1' } }))).toEqual(['DEFAULT'])
        expect(() => getOciConfigProfileNames(parsedConfig({}))).toThrow('No OCI profiles found')
    })

    it('strips credential-bearing OCI config keys before profiles leave the backend', () => {
        const sanitized = sanitizeOciConfigProfile(new Map([
            ['region', 'us-ashburn-1'],
            ['tenancy', '<TENANCY_OCID>'],
            ['key_file', '/home/user/.oci/key.pem'],
            ['fingerprint', '<FINGERPRINT>'],
            ['pass_phrase', 'secret'],
            ['security_token_file', '/home/user/.oci/token'],
        ]))

        expect(sanitized).toEqual({
            region: 'us-ashburn-1',
            tenancy: '<TENANCY_OCID>',
        })
    })

    it('throws an actionable error for unknown profiles', () => {
        expect(() => sanitizeOciConfigProfile(undefined, 'MISSING')).toThrow("OCI profile 'MISSING' not found")
    })
})

describe('Resource Manager job safety contract', () => {
    const now = new Date('2026-06-11T10:00:00.000Z')

    it('builds plan jobs by default', () => {
        const details = buildJobDetails(' stack-id ', undefined, now)

        expect(details).toEqual({
            stackId: 'stack-id',
            displayName: 'OKIT plan 2026-06-11T10:00:00.000Z',
            operation: 'PLAN',
            jobOperationDetails: { operation: 'PLAN' },
            freeformTags: { ManagedBy: 'okit-open-cloud-designer' },
        })
    })

    it('requires reviewed plan metadata before building apply jobs', () => {
        expect(() => buildJobDetails('stack-id', { operation: 'APPLY' }, now)).toThrow('reviewed plan job id')
        expect(() => buildJobDetails('stack-id', { operation: 'APPLY', planJobId: 'plan-id', approval: 'yes' }, now)).toThrow('Type APPLY')
    })

    it('builds apply jobs from a reviewed plan and never auto-approves', () => {
        const details = buildJobDetails('stack-id', { operation: 'APPLY', planJobId: 'plan-id', approval: 'APPLY' }, now)

        expect(details.jobOperationDetails).toEqual({
            operation: 'APPLY',
            executionPlanStrategy: 'FROM_PLAN_JOB_ID',
            executionPlanJobId: 'plan-id',
        })
        expect(JSON.stringify(details)).not.toContain('AUTO_APPROVED')
    })

    it('classifies Resource Manager job states before enabling apply', () => {
        expect(isResourceManagerJobTerminal('ACCEPTED')).toBe(false)
        expect(isResourceManagerJobTerminal('IN_PROGRESS')).toBe(false)
        expect(isResourceManagerJobTerminal('SUCCEEDED')).toBe(true)
        expect(isResourceManagerJobTerminal('FAILED')).toBe(true)
        expect(isResourceManagerJobTerminal('CANCELED')).toBe(true)
        expect(isResourceManagerJobSucceeded('SUCCEEDED')).toBe(true)
        expect(isResourceManagerJobSucceeded('FAILED')).toBe(false)
    })

    it('summarises long Terraform plan output without mutating the original text', () => {
        const source = Array.from({ length: 20 }, (_, index) => `line ${index + 1}`).join('\n')
        const summary = summariseTerraformPlan(source, 32)

        expect(summary.length).toBeLessThanOrEqual(200)
        expect(summary).toContain('line 1')
        expect(summary).toContain('truncated')
        expect(source).toContain('line 20')
    })

    it('requires a succeeded plan job before marking a plan ready to apply', () => {
        const pendingReview = buildResourceManagerPlanReview({
            id: 'job-id',
            operation: 'PLAN',
            lifecycleState: 'IN_PROGRESS',
        }, '')
        const readyReview = buildResourceManagerPlanReview({
            id: 'job-id',
            operation: 'PLAN',
            lifecycleState: 'SUCCEEDED',
        }, 'Plan: 1 to add, 0 to change, 0 to destroy.')
        const emptyReview = buildResourceManagerPlanReview({
            id: 'job-id',
            operation: 'PLAN',
            lifecycleState: 'SUCCEEDED',
        }, '')

        expect(pendingReview).toMatchObject({ terminal: false, readyToApply: false })
        expect(readyReview).toMatchObject({ terminal: true, readyToApply: true })
        expect(emptyReview).toMatchObject({ terminal: true, readyToApply: false })
    })
})
