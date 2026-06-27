/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Unit tests for the per-source update-check classification logic
** (OcdLzUpdateCheck). Private / unreachable repos (HTTP 404/403/429 — e.g. the
** landing-zone-next-gen project add-on, which lives in a private GitHub repo)
** must classify as { unavailable: true } — NOT as errors — produce no
** console.error/warn noise, and never set updateAvailable (banner gate).
*/

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LzGithubFetchError, checkLzUpdates, classifyCheckFailure } from '../OcdLzUpdateCheck'
import { LzSource } from '../OcdLzSources'

const PINNED_SHA = 'a'.repeat(40)
const NEWER_SHA = 'b'.repeat(40)

const privateAddonSource: LzSource = {
    key: 'test-private-addon',
    label: 'Test Private Add-on',
    repo: 'someone/private-addon-repo',
    kind: 'commit',
    pinnedRef: '',
    role: 'project-addon',
}

const pinnedVendoredSource: LzSource = {
    key: 'test-vendored',
    label: 'Test Vendored Source',
    repo: 'oci-landing-zones/test-vendored-repo',
    kind: 'commit',
    pinnedRef: PINNED_SHA,
    role: 'vendored-jsonnet',
}

function jsonResponse(status: number, body: unknown): Response {
    return {
        ok: status >= 200 && status < 300,
        status,
        json: async () => body,
    } as unknown as Response
}

describe('classifyCheckFailure', () => {
    it('classifies a 404 (private repo) as unavailable, not error', () => {
        expect(classifyCheckFailure(new LzGithubFetchError('GitHub API responded 404.', 404))).toBe('unavailable')
    })

    it('classifies 403 and 429 (forbidden / rate-limited) as unavailable', () => {
        expect(classifyCheckFailure(new LzGithubFetchError('rate limit', 403))).toBe('unavailable')
        expect(classifyCheckFailure(new LzGithubFetchError('rate limit', 429))).toBe('unavailable')
    })

    it('classifies other HTTP statuses and generic failures as error', () => {
        expect(classifyCheckFailure(new LzGithubFetchError('GitHub API responded 500.', 500))).toBe('error')
        expect(classifyCheckFailure(new Error('network down'))).toBe('error')
        expect(classifyCheckFailure('not even an Error')).toBe('error')
    })
})

describe('checkLzUpdates classification', () => {
    let fetchMock: ReturnType<typeof vi.fn>
    let errorSpy: ReturnType<typeof vi.spyOn>
    let warnSpy: ReturnType<typeof vi.spyOn>
    let debugSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
        fetchMock = vi.fn()
        vi.stubGlobal('fetch', fetchMock)
        errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    it('marks a 404 (private repo) source unavailable — not an error', async () => {
        fetchMock.mockResolvedValue(jsonResponse(404, { message: 'Not Found' }))

        const [status] = await checkLzUpdates([privateAddonSource], { force: true })

        expect(status.unavailable).toBe(true)
        expect(status.error).toBeUndefined()
        expect(status.updateAvailable).toBe(false)
        expect(status.role).toBe('project-addon')
    })

    it('emits no console.error/warn noise for a 404 — at most one debug line', async () => {
        fetchMock.mockResolvedValue(jsonResponse(404, { message: 'Not Found' }))

        await checkLzUpdates([privateAddonSource], { force: true })

        expect(errorSpy).not.toHaveBeenCalled()
        expect(warnSpy).not.toHaveBeenCalled()
        expect(debugSpy.mock.calls.length).toBeLessThanOrEqual(1)
    })

    it('never lets a 404 project-addon source trigger the update banner (updateAvailable stays false)', async () => {
        fetchMock.mockResolvedValue(jsonResponse(404, { message: 'Not Found' }))

        const statuses = await checkLzUpdates([privateAddonSource], { force: true })

        expect(statuses.some((s) => s.updateAvailable && !s.unavailable)).toBe(false)
    })

    it('marks a 403 source unavailable', async () => {
        fetchMock.mockResolvedValue(jsonResponse(403, { message: 'Forbidden' }))

        const [status] = await checkLzUpdates([privateAddonSource], { force: true })

        expect(status.unavailable).toBe(true)
        expect(status.error).toBeUndefined()
        expect(status.updateAvailable).toBe(false)
    })

    it('reports an update when GitHub returns 200 with a newer sha than the pin', async () => {
        fetchMock.mockResolvedValue(
            jsonResponse(200, [
                {
                    sha: NEWER_SHA,
                    html_url: `https://github.com/${pinnedVendoredSource.repo}/commit/${NEWER_SHA}`,
                    commit: { author: { date: '2026-06-01T00:00:00Z' } },
                },
            ]),
        )

        const [status] = await checkLzUpdates([pinnedVendoredSource], { force: true })

        expect(status.updateAvailable).toBe(true)
        expect(status.unavailable).toBeFalsy()
        expect(status.error).toBeUndefined()
        expect(status.latest).toBe(NEWER_SHA)
        expect(status.role).toBe('vendored-jsonnet')
    })

    it('uses a session GitHub token for authenticated private source checks', async () => {
        fetchMock.mockResolvedValue(
            jsonResponse(200, [
                {
                    sha: NEWER_SHA,
                    html_url: `https://github.com/${privateAddonSource.repo}/commit/${NEWER_SHA}`,
                    commit: { author: { date: '2026-06-01T00:00:00Z' } },
                },
            ]),
        )

        const [status] = await checkLzUpdates([privateAddonSource], {
            force: true,
            githubToken: 'ghp_session_token',
        })

        expect(status.unavailable).toBeFalsy()
        expect(status.error).toBeUndefined()
        expect(status.latest).toBe(NEWER_SHA)
        expect(fetchMock).toHaveBeenCalledWith(
            `https://api.github.com/repos/${privateAddonSource.repo}/commits?per_page=1`,
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: 'Bearer ghp_session_token',
                }),
            }),
        )
    })

    it('keeps genuine failures (network error) as per-source errors, not unavailable', async () => {
        fetchMock.mockRejectedValue(new Error('network down'))

        const [status] = await checkLzUpdates([pinnedVendoredSource], { force: true })

        expect(status.error).toBe('network down')
        expect(status.unavailable).toBeFalsy()
        expect(status.updateAvailable).toBe(false)
        expect(warnSpy).toHaveBeenCalledTimes(1)
        expect(errorSpy).not.toHaveBeenCalled()
    })
})
