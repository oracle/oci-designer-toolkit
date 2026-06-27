import { describe, expect, it } from 'vitest'
import {
    validateGenAiArchitectureRouteRequest,
    validateLzAddonUpdateRequest,
    validateOciQueryRequest,
    validateResourceManagerListStacksQuery,
    validateResourceManagerCreateStackRequest,
    validateResourceManagerPlanReviewQuery,
    validateResourceManagerJobOptions,
    validateResourceManagerStackMutationRequest,
} from '../../../../web-server/src/OciWebServerValidation'

describe('Oci web server route boundary validation', () => {
    it('normalizes OCI query requests and rejects malformed compartment lists', () => {
        expect(validateOciQueryRequest({
            profile: ' DEFAULT ',
            region: ' eu-frankfurt-1 ',
            compartmentIds: [' ocid-like-placeholder ', '', 42],
        })).toEqual({
            profile: 'DEFAULT',
            region: 'eu-frankfurt-1',
            compartmentIds: ['ocid-like-placeholder'],
        })

        expect(() => validateOciQueryRequest({
            profile: 'DEFAULT',
            region: 'eu-frankfurt-1',
            compartmentIds: 'not-an-array',
        })).toThrow('compartmentIds must be an array')
    })

    it('accepts only explicit PLAN or reviewed APPLY Resource Manager job options', () => {
        expect(validateResourceManagerJobOptions(undefined)).toEqual({ operation: 'PLAN' })
        expect(validateResourceManagerJobOptions({ operation: 'PLAN', approval: 'ignored' })).toEqual({ operation: 'PLAN' })
        expect(validateResourceManagerJobOptions({
            operation: 'APPLY',
            planJobId: ' plan-job ',
            approval: ' APPLY ',
        })).toEqual({
            operation: 'APPLY',
            planJobId: 'plan-job',
            approval: 'APPLY',
        })

        expect(() => validateResourceManagerJobOptions({ operation: 'DESTROY' })).toThrow('operation must be PLAN or APPLY')
        expect(() => validateResourceManagerJobOptions({ operation: 'APPLY', approval: 'APPLY' })).toThrow('planJobId')
        expect(() => validateResourceManagerJobOptions({ operation: 'APPLY', planJobId: 'plan-job', approval: 'yes' })).toThrow('approval must be APPLY')
    })

    it('normalizes Resource Manager stack mutation requests without trusting malformed Terraform data', () => {
        expect(validateResourceManagerStackMutationRequest({
            profile: ' DEFAULT ',
            region: ' eu-frankfurt-1 ',
            compartmentId: ' compartment ',
            stackName: ' Stack ',
            data: {
                'main.tf': ['resource {}'],
                'bad.tf': 'resource {}',
            },
            jobOptions: { operation: 'PLAN' },
        })).toEqual({
            profile: 'DEFAULT',
            region: 'eu-frankfurt-1',
            compartmentId: 'compartment',
            stackName: 'Stack',
            stackId: '',
            data: { 'main.tf': ['resource {}'] },
            jobOptions: { operation: 'PLAN' },
        })

        expect(() => validateResourceManagerCreateStackRequest({
            profile: 'DEFAULT',
            region: 'eu-frankfurt-1',
            compartmentId: '',
            stackName: 'Stack',
            data: {},
        })).toThrow('compartmentId is required')
    })

    it('rejects unsafe add-on source keys and newline-bearing GitHub tokens', () => {
        expect(validateLzAddonUpdateRequest({
            sourceKey: 'landing-zone-next-gen',
            githubToken: ' ghp_private_token ',
        })).toEqual({
            sourceKey: 'landing-zone-next-gen',
            githubToken: 'ghp_private_token',
        })

        expect(() => validateLzAddonUpdateRequest({ sourceKey: '../bad' })).toThrow('Invalid Landing Zone add-on source key')
        expect(() => validateLzAddonUpdateRequest({
            sourceKey: 'landing-zone-next-gen',
            githubToken: 'token\nnext',
        })).toThrow('GitHub token must be a single line')
    })

    it('normalizes OCI GenAI architecture requests before inference', () => {
        expect(validateGenAiArchitectureRouteRequest({
            profile: ' DEFAULT ',
            region: ' eu-frankfurt-1 ',
            compartmentId: ' genai-compartment ',
            modelId: ' cohere.command-a-03-2025 ',
            prompt: ' Create a hub and spoke architecture. ',
            temperature: 'not-a-number',
            maxTokens: 4096.8,
        })).toEqual({
            profile: 'DEFAULT',
            region: 'eu-frankfurt-1',
            compartmentId: 'genai-compartment',
            modelId: 'cohere.command-a-03-2025',
            prompt: 'Create a hub and spoke architecture.',
            temperature: 0.2,
            maxTokens: 4000,
        })

        expect(() => validateGenAiArchitectureRouteRequest({
            profile: 'DEFAULT',
            region: 'eu-frankfurt-1',
            compartmentId: 'genai-compartment',
            modelId: 'cohere.command-a-03-2025',
            prompt: '',
        })).toThrow('Architecture prompt is required.')
        expect(() => validateGenAiArchitectureRouteRequest(null)).toThrow('Request body must be a JSON object')
    })

    it('validates Resource Manager GET query parameters before backend calls', () => {
        expect(validateResourceManagerListStacksQuery(new URLSearchParams({
            profile: ' DEFAULT ',
            region: ' eu-frankfurt-1 ',
            compartmentId: ' compartment ',
        }))).toEqual({
            profile: 'DEFAULT',
            region: 'eu-frankfurt-1',
            compartmentId: 'compartment',
        })

        expect(validateResourceManagerPlanReviewQuery(new URLSearchParams({
            profile: ' DEFAULT ',
            region: ' eu-frankfurt-1 ',
            jobId: ' plan-job ',
        }))).toEqual({
            profile: 'DEFAULT',
            region: 'eu-frankfurt-1',
            jobId: 'plan-job',
        })

        expect(() => validateResourceManagerListStacksQuery(new URLSearchParams({
            profile: 'DEFAULT',
            region: 'eu-frankfurt-1',
        }))).toThrow('compartmentId is required')
        expect(() => validateResourceManagerPlanReviewQuery(new URLSearchParams({
            profile: 'DEFAULT',
            region: 'eu-frankfurt-1',
        }))).toThrow('jobId is required')
    })
})
