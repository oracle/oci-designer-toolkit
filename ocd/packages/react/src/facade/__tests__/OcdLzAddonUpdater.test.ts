import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
    getLandingZoneAddonUpdateJob,
    listLandingZoneAddonHealth,
    startLandingZoneAddonUpdateJob,
    updateLandingZoneAddon,
    type LzAddonUpdateJobStatus,
} from '../../../../query/src/OcdLzAddonUpdater'

const writeFixtureRepo = (script = ''): string => {
    const repoRoot = mkdtempSync(path.join(tmpdir(), 'ocd-lz-health-'))
    mkdirSync(path.join(repoRoot, 'scripts'), { recursive: true })
    mkdirSync(path.join(repoRoot, 'ocd', 'packages', 'react', 'src', 'landingzone'), { recursive: true })
    mkdirSync(path.join(repoRoot, 'external', 'addons', 'installed-addon'), { recursive: true })
    writeFileSync(path.join(repoRoot, 'scripts', 'setup_landing_zone.mjs'), script)
    writeFileSync(path.join(repoRoot, 'ocd', 'packages', 'react', 'src', 'landingzone', 'OcdLzSources.json'), JSON.stringify({
        sources: [
            {
                key: 'installed-addon',
                label: 'Installed Add-on',
                repo: 'example/installed-addon',
                pinnedRef: 'abc123',
                role: 'project-addon',
                setup: {
                    localSubdir: 'external/addons/installed-addon',
                    install: { mode: 'git-checkout' },
                },
            },
            {
                key: 'missing-addon',
                label: 'Missing Add-on',
                repo: 'example/missing-addon',
                pinnedRef: 'def456',
                role: 'project-addon',
                setup: {
                    localSubdir: 'external/addons/missing-addon',
                    install: { mode: 'git-checkout' },
                },
            },
            {
                key: 'reference-only',
                label: 'Reference Only',
                repo: 'example/reference-only',
                pinnedRef: '',
                role: 'reference',
            },
        ],
    }))
    return repoRoot
}

describe('listLandingZoneAddonHealth', () => {
    it('reports coarse project add-on source health without absolute local paths', () => {
        const repoRoot = writeFixtureRepo()

        const health = listLandingZoneAddonHealth(repoRoot)

        expect(health).toEqual([
            {
                sourceKey: 'installed-addon',
                label: 'Installed Add-on',
                repo: 'example/installed-addon',
                role: 'project-addon',
                pinnedRef: 'abc123',
                localSubdir: 'external/addons/installed-addon',
                installable: true,
                installed: true,
                state: 'installed',
            },
            {
                sourceKey: 'missing-addon',
                label: 'Missing Add-on',
                repo: 'example/missing-addon',
                role: 'project-addon',
                pinnedRef: 'def456',
                localSubdir: 'external/addons/missing-addon',
                installable: true,
                installed: false,
                state: 'missing',
            },
            {
                sourceKey: 'reference-only',
                label: 'Reference Only',
                repo: 'example/reference-only',
                role: 'reference',
                pinnedRef: '',
                installable: false,
                installed: false,
                state: 'not-installable',
            },
        ])
        expect(health.map((source) => source.localSubdir).filter(Boolean).join('\n')).not.toContain(repoRoot)
    })

    it('returns refreshed pins after an authenticated add-on update without leaking the token', async () => {
        const repoRoot = writeFixtureRepo(`
            import { readFileSync, writeFileSync } from 'node:fs'
            import path from 'node:path'
            import { fileURLToPath } from 'node:url'

            const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
            const manifestFile = path.join(repoRoot, 'ocd', 'packages', 'react', 'src', 'landingzone', 'OcdLzSources.json')
            const manifest = JSON.parse(readFileSync(manifestFile, 'utf-8'))
            manifest.sources = manifest.sources.map((source) => source.key === 'installed-addon'
                ? { ...source, pinnedRef: 'new-private-pin' }
                : source)
            writeFileSync(manifestFile, JSON.stringify(manifest, null, 2))
            console.log('token=' + process.env.GITHUB_TOKEN)
        `)

        const result = await updateLandingZoneAddon('installed-addon', { githubToken: 'ghp_secret_token', start: repoRoot })

        expect(result.pinnedRef).toBe('new-private-pin')
        expect(result.stdout).toContain('<GITHUB_TOKEN>')
        expect(result.stdout).not.toContain('ghp_secret_token')
        expect(listLandingZoneAddonHealth(repoRoot).find((source) => source.sourceKey === 'installed-addon')?.pinnedRef).toBe('new-private-pin')
    })

    it('runs add-on update jobs with capped redacted status output and refreshed pins', async () => {
        const repoRoot = writeFixtureRepo(`
            import { readFileSync, writeFileSync } from 'node:fs'
            import path from 'node:path'
            import { fileURLToPath } from 'node:url'

            const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
            const manifestFile = path.join(repoRoot, 'ocd', 'packages', 'react', 'src', 'landingzone', 'OcdLzSources.json')
            const manifest = JSON.parse(readFileSync(manifestFile, 'utf-8'))
            manifest.sources = manifest.sources.map((source) => source.key === 'installed-addon'
                ? { ...source, pinnedRef: 'job-private-pin' }
                : source)
            writeFileSync(manifestFile, JSON.stringify(manifest, null, 2))
            console.log('job token=' + process.env.GITHUB_TOKEN)
            console.error('job completed')
        `)

        const started = startLandingZoneAddonUpdateJob('installed-addon', { githubToken: 'ghp_job_secret', start: repoRoot })
        expect(started).toMatchObject({ sourceKey: 'installed-addon', state: 'queued' })

        const completed = await waitForTerminalJob(started.id)

        expect(completed).toMatchObject({
            state: 'succeeded',
            sourceKey: 'installed-addon',
            pinnedRef: 'job-private-pin',
            exitCode: 0,
        })
        expect(completed.stdout).toContain('<GITHUB_TOKEN>')
        expect(completed.stdout).not.toContain('ghp_job_secret')
        expect(completed.stderr).toContain('job completed')
    })

    it('validates source keys before enqueueing update jobs', () => {
        const repoRoot = writeFixtureRepo()

        expect(() => startLandingZoneAddonUpdateJob('../bad', { start: repoRoot })).toThrow('Invalid Landing Zone add-on source key.')
        expect(() => startLandingZoneAddonUpdateJob('reference-only', { start: repoRoot })).toThrow("Landing Zone source 'reference-only' is not a project add-on.")
    })
})

const waitForTerminalJob = async (jobId: string): Promise<LzAddonUpdateJobStatus> => {
    for (let i = 0; i < 50; i += 1) {
        const job = getLandingZoneAddonUpdateJob(jobId)
        if (job.state === 'succeeded' || job.state === 'failed' || job.state === 'cancelled') return job
        await new Promise((resolve) => setTimeout(resolve, 50))
    }
    return getLandingZoneAddonUpdateJob(jobId)
}
