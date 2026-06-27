/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { describe, expect, it } from 'vitest'
import {
    buildGenAiArchitectureChatRequest,
    buildGenAiArchitectureVisionChatRequest,
    DEFAULT_OCI_GENAI_VISION_MODEL_ID,
    extractGenAiArchitectureText,
    OciGenAiArchitectureQuery,
    redactArchitecturePrompt,
    resolveGenAiArchitectureRequestDefaults,
    validateArchitectureImageDataUri,
    validateGenAiArchitectureRequest,
} from '../../../../query/src/OciGenAiArchitectureQuery'

// Tiny synthetic 1x1 transparent PNG data-URI (no real diagram content).
const TINY_PNG_DATA_URI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='

describe('OciGenAiArchitectureQuery helpers', () => {
    it('redacts OCI identifiers, key material labels, and sensitive topology before inference', () => {
        const ocid = ['ocid1', 'compartment', 'oc1', '', 'exampleuniquevalue'].join('.')
        const publicIp = ['130', '61', '2', '3'].join('.')
        const privateIp = ['10', '42', '1', '10'].join('.')
        const prompt = [
            `Use ${ocid}`,
            'api_key=super-secret-value',
            'fingerprint=aa:bb:cc:dd:ee:ff:00:11:22:33',
            `connect ${privateIp} to ${publicIp}`,
        ].join('\n')

        const redacted = redactArchitecturePrompt(prompt)

        expect(redacted).toContain('<OCI_OCID>')
        expect(redacted).toContain('<SECRET_VALUE>')
        expect(redacted).toContain('<KEY_FINGERPRINT>')
        expect(redacted).toContain('<PRIVATE_IP>')
        expect(redacted).toContain('<PUBLIC_IP>')
        expect(redacted).not.toContain(ocid)
        expect(redacted).not.toContain('super-secret-value')
    })

    it('builds a bounded JSON-mode on-demand chat request', () => {
        const request = buildGenAiArchitectureChatRequest({
            profile: 'DEFAULT',
            region: 'eu-frankfurt-1',
            compartmentId: '<GENAI_COMPARTMENT_ID>',
            modelId: 'cohere.command-a-03-2025',
            prompt: 'Create an OCI hub and spoke network.',
            temperature: 9,
            maxTokens: 99999,
        })

        expect(request.chatDetails.compartmentId).toBe('<GENAI_COMPARTMENT_ID>')
        expect(request.chatDetails.servingMode).toMatchObject({
            servingType: 'ON_DEMAND',
            modelId: 'cohere.command-a-03-2025',
        })
        expect(request.chatDetails.chatRequest).toMatchObject({
            apiFormat: 'GENERIC',
            isStream: false,
            maxTokens: 4000,
            temperature: 1,
            responseFormat: { type: 'JSON_OBJECT' },
        })

        const content = (request.chatDetails.chatRequest as { messages: Array<{ content: Array<{ text?: string }> }> }).messages[0].content[0].text ?? ''
        expect(content).toContain('Return only valid JSON')
        expect(content).toContain('Schema: {"title": string')
        expect(content).toContain('Supported resource kinds:')
        expect(content).toContain('User request: Create an OCI hub and spoke network.')
    })

    it('requires region, compartment, and prompt after applying defaults', () => {
        expect(() => validateGenAiArchitectureRequest({
            profile: 'DEFAULT',
            region: '',
            compartmentId: '<GENAI_COMPARTMENT_ID>',
            modelId: '',
            prompt: 'Create a VCN.',
        })).toThrow('OCI region is required.')
    })

    it('resolves OCI GenAI defaults from backend environment variables', () => {
        expect(resolveGenAiArchitectureRequestDefaults({
            profile: '',
            region: '',
            compartmentId: '',
            modelId: '',
            prompt: 'Create a VCN.',
        }, {
            OCD_ARCHITECT_OCI_PROFILE: 'ARCHITECT',
            OCD_ARCHITECT_OCI_REGION: 'eu-frankfurt-1',
            OCD_ARCHITECT_OCI_COMPARTMENT_ID: '<GENAI_COMPARTMENT_ID>',
        })).toMatchObject({
            profile: 'ARCHITECT',
            region: 'eu-frankfurt-1',
            compartmentId: '<GENAI_COMPARTMENT_ID>',
            modelId: 'cohere.command-a-03-2025',
        })
    })

    it('builds a vision chat request with both a text part and the image data-URI, defaulting to the vision model', () => {
        const ocid = ['ocid1', 'compartment', 'oc1', '', 'exampleuniquevalue'].join('.')
        const request = buildGenAiArchitectureVisionChatRequest({
            profile: 'DEFAULT',
            region: 'eu-frankfurt-1',
            compartmentId: '<GENAI_COMPARTMENT_ID>',
            modelId: '',
            prompt: `Replicate the diagram. Use ${ocid}`,
            imageDataUri: TINY_PNG_DATA_URI,
        })

        // Vision model default applied when modelId is empty.
        expect(request.chatDetails.servingMode).toMatchObject({
            servingType: 'ON_DEMAND',
            modelId: DEFAULT_OCI_GENAI_VISION_MODEL_ID,
        })
        const content = (request.chatDetails.chatRequest as { messages: Array<{ content: unknown[] }> }).messages[0].content as Array<Record<string, unknown>>
        expect(content).toHaveLength(2)
        const textPart = content.find((part) => part.type === 'TEXT') as { text: string }
        const imagePart = content.find((part) => part.type === 'IMAGE') as { imageUrl: { url: string } }
        expect(imagePart.imageUrl.url).toBe(TINY_PNG_DATA_URI)
        // The text prompt is still redacted before inference.
        expect(textPart.text).toContain('<OCI_OCID>')
        expect(textPart.text).not.toContain(ocid)
    })

    it('honours an explicit vision modelId override', () => {
        const request = buildGenAiArchitectureVisionChatRequest({
            profile: 'DEFAULT',
            region: 'eu-frankfurt-1',
            compartmentId: '<GENAI_COMPARTMENT_ID>',
            modelId: 'meta.llama-3.2-11b-vision-instruct',
            prompt: 'Replicate the diagram.',
            imageDataUri: TINY_PNG_DATA_URI,
        })
        expect(request.chatDetails.servingMode).toMatchObject({ modelId: 'meta.llama-3.2-11b-vision-instruct' })
    })

    it('validates the image data-URI: accepts a small png, rejects missing prefix, non-image, and oversized payloads', () => {
        expect(validateArchitectureImageDataUri(TINY_PNG_DATA_URI)).toBe(TINY_PNG_DATA_URI)
        expect(() => validateArchitectureImageDataUri('')).toThrow('Architecture diagram image is required.')
        expect(() => validateArchitectureImageDataUri('not-a-data-uri')).toThrow(/base64 data URI/)
        expect(() => validateArchitectureImageDataUri('data:application/pdf;base64,AAAA')).toThrow(/base64 data URI/)
        const oversized = `data:image/png;base64,${'A'.repeat(8 * 1024 * 1024 * 2)}`
        expect(() => validateArchitectureImageDataUri(oversized)).toThrow(/too large/)
    })

    it('rejects a ReadableStream response from the vision path', async () => {
        const query = new OciGenAiArchitectureQuery('DEFAULT', undefined, () => ({
            chat: async () => new ReadableStream<Uint8Array>(),
        }))
        await expect(query.generateArchitecturePlanFromImage({
            profile: 'DEFAULT',
            region: 'eu-frankfurt-1',
            compartmentId: '<GENAI_COMPARTMENT_ID>',
            modelId: '',
            prompt: 'Replicate the diagram.',
            imageDataUri: TINY_PNG_DATA_URI,
        })).rejects.toThrow('OCI GenAI streaming responses are not supported for architecture planning.')
    })

    it('extracts text from generic chat choices', () => {
        const result = extractGenAiArchitectureText({
            opcRequestId: 'request-1',
            etag: '',
            modelDeprecationInfo: '',
            chatResult: {
                modelId: 'cohere.command-a-03-2025',
                modelVersion: '1',
                chatResponse: {
                    apiFormat: 'GENERIC',
                    timeCreated: new Date('2026-06-12T00:00:00.000Z'),
                    choices: [{
                        index: 0,
                        finishReason: 'stop',
                        message: {
                            role: 'ASSISTANT',
                            content: [{ type: 'TEXT', text: '{"title":"Plan"}' }],
                        },
                    }],
                },
            },
        })

        expect(result).toEqual({
            text: '{"title":"Plan"}',
            modelId: 'cohere.command-a-03-2025',
            modelVersion: '1',
            opcRequestId: 'request-1',
        })
    })
})
