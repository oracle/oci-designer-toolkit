import { afterEach, describe, expect, it, vi } from 'vitest'
import { OcdDesignFacade } from '../OcdDesignFacade'

const jsonResponse = (body: unknown): Response =>
    new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    })

const textResponse = (body: string, contentType = 'image/svg+xml'): Response =>
    new Response(body, {
        status: 200,
        headers: { 'Content-Type': contentType },
    })

describe('OcdDesignFacade browser library fallback', () => {
    afterEach(() => {
        vi.restoreAllMocks()
        delete (globalThis as { window?: unknown }).window
    })

    it('loads bundled library index and hydrates SVG previews without Electron', async () => {
        ;(globalThis as { window?: { ocdAPI?: unknown } }).window = {}
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(jsonResponse({
                oci: [{
                    title: 'Reference',
                    description: 'Reference design',
                    okitFile: 'Reference.okit',
                    svgFile: 'Reference.svg',
                }],
            }))
            .mockResolvedValueOnce(textResponse('<svg><title>Reference</title></svg>'))
        vi.stubGlobal('fetch', fetchMock)

        await expect(OcdDesignFacade.loadLibraryIndex()).resolves.toMatchObject({
            oci: [{
                title: 'Reference',
                dataUri: expect.stringContaining('data:image/svg+xml,'),
            }],
        })

        expect(fetchMock).toHaveBeenNthCalledWith(1, '/library/referenceArchitectures.json')
        expect(fetchMock).toHaveBeenNthCalledWith(2, '/library/oci/Reference.svg')
    })

    it('loads bundled OKIT designs without Electron', async () => {
        ;(globalThis as { window?: { ocdAPI?: unknown } }).window = {}
        const fetchMock = vi.fn().mockResolvedValueOnce(jsonResponse({
            metadata: { title: 'Reference' },
            model: { oci: { resources: {} } },
            view: { pages: [] },
        }))
        vi.stubGlobal('fetch', fetchMock)

        await expect(OcdDesignFacade.loadLibraryDesign('oci', 'Reference.okit')).resolves.toMatchObject({
            canceled: false,
            filename: 'Reference.okit',
            design: { metadata: { title: 'Reference' } },
        })

        expect(fetchMock).toHaveBeenCalledWith('/library/oci/Reference.okit')
    })

    it('rejects unsafe browser library path segments', async () => {
        ;(globalThis as { window?: { ocdAPI?: unknown } }).window = {}
        const fetchMock = vi.fn()
        vi.stubGlobal('fetch', fetchMock)

        await expect(OcdDesignFacade.loadLibraryDesign('../oci', 'Reference.okit')).rejects.toThrow('Invalid library section')

        expect(fetchMock).not.toHaveBeenCalled()
    })
})
