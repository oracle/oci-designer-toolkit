import { describe, expect, it } from 'vitest'
import {
    getArchitectureAgentProviderReadiness,
    isOciGenAiConfigured,
    isOpenAiCompatibleConfigured,
    resolveArchitectureAgentProviderConfig,
} from '../OcdArchitectureAgentConfig'

describe('OcdArchitectureAgentConfig', () => {
    it('selects OCI GenAI when OCI architecture variables are configured', () => {
        const config = resolveArchitectureAgentProviderConfig({
            VITE_OCD_ARCHITECT_OCI_PROFILE: 'DEFAULT',
            VITE_OCD_ARCHITECT_OCI_REGION: 'eu-frankfurt-1',
            VITE_OCD_ARCHITECT_OCI_COMPARTMENT_ID: '<GENAI_COMPARTMENT_ID>',
            VITE_OCD_ARCHITECT_OCI_MODEL_ID: 'cohere.command-a-03-2025',
        })

        expect(config.plannerMode).toBe('oci-genai')
        expect(isOciGenAiConfigured(config)).toBe(true)
    })

    it('selects OpenAI-compatible planning when endpoint and model are configured', () => {
        const config = resolveArchitectureAgentProviderConfig({
            VITE_OCD_ARCHITECT_OPENAI_ENDPOINT: 'https://api.example.com/v1/chat/completions',
            VITE_OCD_ARCHITECT_OPENAI_MODEL: 'architecture-model',
        })

        expect(config.plannerMode).toBe('openai')
        expect(isOpenAiCompatibleConfigured(config)).toBe(true)
    })

    it('honours an explicit provider override while preserving defaults', () => {
        const config = resolveArchitectureAgentProviderConfig({
            VITE_OCD_ARCHITECT_PROVIDER: 'oci-genai',
        })

        expect(config.plannerMode).toBe('oci-genai')
        expect(config.ociProfile).toBe('DEFAULT')
        expect(config.ociModelId).toBe('cohere.command-a-03-2025')
        expect(config.temperature).toBe(0.2)
        expect(config.maxTokens).toBe(2400)
    })

    it('reports local planner readiness without external variables', () => {
        const config = resolveArchitectureAgentProviderConfig({})
        const readiness = getArchitectureAgentProviderReadiness(config)

        expect(readiness.ready).toBe(true)
        expect(readiness.label).toBe('Local')
        expect(readiness.issues).toEqual([])
    })

    it('reports missing OpenAI-compatible endpoint and model variables', () => {
        const config = resolveArchitectureAgentProviderConfig({
            VITE_OCD_ARCHITECT_PROVIDER: 'openai',
        })
        const readiness = getArchitectureAgentProviderReadiness(config)

        expect(readiness.ready).toBe(false)
        expect(readiness.issues.map((issue) => issue.variable)).toEqual([
            'VITE_OCD_ARCHITECT_OPENAI_ENDPOINT',
            'VITE_OCD_ARCHITECT_OPENAI_MODEL',
        ])
    })

    it('reports missing OCI GenAI variables for explicit OCI mode', () => {
        const config = resolveArchitectureAgentProviderConfig({
            VITE_OCD_ARCHITECT_PROVIDER: 'oci-genai',
            VITE_OCD_ARCHITECT_OCI_PROFILE: ' ',
            VITE_OCD_ARCHITECT_OCI_MODEL_ID: ' ',
        })
        const readiness = getArchitectureAgentProviderReadiness(config)

        expect(readiness.ready).toBe(false)
        expect(readiness.issues.map((issue) => issue.variable)).toEqual([
            'VITE_OCD_ARCHITECT_OCI_REGION',
            'VITE_OCD_ARCHITECT_OCI_COMPARTMENT_ID',
        ])
    })

    it('reports cleared OCI GenAI UI fields before generation', () => {
        const readiness = getArchitectureAgentProviderReadiness({
            plannerMode: 'oci-genai',
            openAiEndpoint: '',
            openAiModel: '',
            ociProfile: '',
            ociRegion: '',
            ociCompartmentId: '',
            ociModelId: '',
        })

        expect(readiness.ready).toBe(false)
        expect(readiness.issues.map((issue) => issue.variable)).toEqual([
            'VITE_OCD_ARCHITECT_OCI_PROFILE',
            'VITE_OCD_ARCHITECT_OCI_REGION',
            'VITE_OCD_ARCHITECT_OCI_COMPARTMENT_ID',
            'VITE_OCD_ARCHITECT_OCI_MODEL_ID',
        ])
    })
})
