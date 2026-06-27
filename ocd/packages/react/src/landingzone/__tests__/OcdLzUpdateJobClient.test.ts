import { describe, expect, it } from 'vitest'
import { describeLzAddonUpdateJob, normalizeLzGithubToken, summarizeLzAddonUpdateJobOutcome } from '../OcdLzUpdateJobClient'

describe('OcdLzUpdateJobClient', () => {
    it('summarizes successful add-on updates as source-refresh events', () => {
        const outcome = summarizeLzAddonUpdateJobOutcome({
            id: 'job-1',
            sourceKey: 'landing-zone-next-gen',
            command: 'node scripts/setup_landing_zone.mjs --latest --source landing-zone-next-gen --install',
            state: 'succeeded',
            startedAt: '2026-06-13T10:00:00.000Z',
            finishedAt: '2026-06-13T10:00:01.000Z',
            pinnedRef: 'a'.repeat(40),
            stdout: 'updated',
            stderr: '',
        })

        expect(outcome).toEqual({
            kind: 'updated',
            refreshSources: true,
            sourceKey: 'landing-zone-next-gen',
            pinnedRef: 'a'.repeat(40),
            message: 'Updated to aaaaaaaaaaaa using node scripts/setup_landing_zone.mjs --latest --source landing-zone-next-gen --install',
        })
    })

    it('summarizes failed add-on updates without requesting a source refresh', () => {
        const outcome = summarizeLzAddonUpdateJobOutcome({
            id: 'job-2',
            sourceKey: 'landing-zone-next-gen',
            command: 'node scripts/setup_landing_zone.mjs --latest --source landing-zone-next-gen --install',
            state: 'failed',
            startedAt: '2026-06-13T10:00:00.000Z',
            finishedAt: '2026-06-13T10:00:01.000Z',
            pinnedRef: '',
            stdout: '',
            stderr: 'auth failed',
            error: 'auth failed',
        })

        expect(outcome).toEqual({
            kind: 'failed',
            refreshSources: false,
            sourceKey: 'landing-zone-next-gen',
            pinnedRef: '',
            message: 'auth failed',
        })
        expect(describeLzAddonUpdateJob({
            id: 'job-3',
            sourceKey: 'landing-zone-next-gen',
            command: 'command',
            state: 'running',
            startedAt: '2026-06-13T10:00:00.000Z',
            pinnedRef: '',
            stdout: 'checkout\ninstalling',
            stderr: '',
        })).toBe('Running backend update: installing')
    })

    it('normalizes optional GitHub tokens before backend update requests', () => {
        expect(normalizeLzGithubToken(undefined)).toBeUndefined()
        expect(normalizeLzGithubToken('')).toBeUndefined()
        expect(normalizeLzGithubToken('  ghp_token  ')).toBe('ghp_token')
    })
})
