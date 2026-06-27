/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { execFile, spawn, type ChildProcess } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'
import { OcdLogger } from '@ocd/core'
import { pruneJobs } from './OcdBoundedJobStore.js'

const execFileAsync = promisify(execFile)
const logger = OcdLogger.scope('OcdLzAddonUpdater')

export interface LzAddonUpdateResult {
    sourceKey: string
    pinnedRef: string
    command: string
    stdout: string
    stderr: string
}

export interface LzAddonUpdateOptions {
    githubToken?: string
    start?: string
}

export type LzAddonUpdateJobState = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled'

export interface LzAddonUpdateJobStatus extends LzAddonUpdateResult {
    id: string
    state: LzAddonUpdateJobState
    createdAt: string
    startedAt?: string
    finishedAt?: string
    exitCode?: number | null
    error?: string
    stdoutTruncated: boolean
    stderrTruncated: boolean
}

export type LzAddonSourceRole = 'vendored-jsonnet' | 'reference' | 'project-addon' | 'unknown'
export type LzAddonSourceHealthState = 'installed' | 'missing' | 'not-installable'

export interface LzAddonSourceHealth {
    sourceKey: string
    label: string
    repo: string
    role: LzAddonSourceRole
    pinnedRef: string
    localSubdir?: string
    installable: boolean
    installed: boolean
    state: LzAddonSourceHealthState
}

export interface LzSourceManifestEntry {
    key: string
    label: string
    repo: string
    pinnedRef?: string
    role?: string
    setup?: {
        localSubdir?: string
        gitIgnored?: boolean
        install?: {
            mode?: string
        }
    }
}

export interface LzSourcesManifest {
    sources: LzSourceManifestEntry[]
}

const SOURCE_KEY_PATTERN = /^[a-z0-9-]+$/
const MAX_OUTPUT_BYTES = 1024 * 1024
const MAX_JOB_OUTPUT_BYTES = 64 * 1024
const UPDATE_TIMEOUT_MS = 10 * 60 * 1000
// Bounded retention for the in-memory job store: terminal jobs older than the
// TTL are evicted, and the total retained count is capped (oldest terminal jobs
// evicted first). Without this the store grows forever in a long-lived process.
const JOB_RETENTION_TTL_MS = 24 * 60 * 60 * 1000
const JOB_RETENTION_MAX_SIZE = 1000

const TERMINAL_JOB_STATES: ReadonlySet<LzAddonUpdateJobState> = new Set(['succeeded', 'failed', 'cancelled'])

interface StoredLzAddonUpdateJob extends LzAddonUpdateJobStatus {
    repoRoot: string
    githubToken?: string
    child?: ChildProcess
}

const updateJobs = new Map<string, StoredLzAddonUpdateJob>()
let updateQueue: Promise<void> = Promise.resolve()

const isTerminalJob = (job: StoredLzAddonUpdateJob): boolean => TERMINAL_JOB_STATES.has(job.state)

// Terminal-completion time in epoch ms; falls back to createdAt when a terminal
// job has no finishedAt recorded. Returns undefined for non-terminal jobs.
const jobCompletedAtMs = (job: StoredLzAddonUpdateJob): number | undefined => {
    if (!isTerminalJob(job)) return undefined
    const stamp = job.finishedAt ?? job.createdAt
    const parsed = Date.parse(stamp)
    return Number.isNaN(parsed) ? undefined : parsed
}

// Evict stale/over-cap terminal jobs in place. Called on insert and on read.
const evictStaleJobs = (now = Date.now()): void => {
    pruneJobs(updateJobs, {
        now,
        ttlMs: JOB_RETENTION_TTL_MS,
        maxSize: JOB_RETENTION_MAX_SIZE,
        isTerminal: isTerminalJob,
        completedAt: jobCompletedAtMs,
    })
}

const normalizeGithubToken = (token: string | undefined): string => {
    const trimmed = token?.trim() ?? ''
    return /[\r\n]/.test(trimmed) ? '' : trimmed
}

// Defense-in-depth: child git/node processes should not inherit the full parent
// environment (which may contain unrelated secrets). Copy only the variables the
// child actually needs, plus GITHUB_TOKEN when present. Exact env names are kept;
// prefix families (GIT_*) are matched dynamically.
const CHILD_ENV_ALLOWLIST: ReadonlySet<string> = new Set([
    'PATH',
    'HOME',
    'HOMEPATH',
    'USERPROFILE',
    'SystemRoot',
    'TMPDIR',
    'TEMP',
    'TMP',
    'LANG',
    'LC_ALL',
    'HTTP_PROXY',
    'HTTPS_PROXY',
    'NO_PROXY',
    'http_proxy',
    'https_proxy',
    'no_proxy',
    'SSL_CERT_FILE',
    'SSL_CERT_DIR',
    'NODE_EXTRA_CA_CERTS',
])

const isAllowedChildEnvKey = (key: string): boolean => CHILD_ENV_ALLOWLIST.has(key) || key.startsWith('GIT_')

export const buildChildEnv = (
    parentEnv: NodeJS.ProcessEnv,
    githubToken: string | undefined,
): NodeJS.ProcessEnv => {
    const childEnv: NodeJS.ProcessEnv = {}
    for (const [key, value] of Object.entries(parentEnv)) {
        if (value !== undefined && isAllowedChildEnvKey(key)) childEnv[key] = value
    }
    const token = normalizeGithubToken(githubToken)
    if (token) childEnv.GITHUB_TOKEN = token
    return childEnv
}

const childEnvWithGitHubToken = (githubToken: string | undefined): NodeJS.ProcessEnv =>
    buildChildEnv(process.env, githubToken)

const redactToken = (value: string, githubToken: string | undefined): string => {
    const token = normalizeGithubToken(githubToken)
    return token ? value.split(token).join('<GITHUB_TOKEN>') : value
}

const commandForSource = (sourceKey: string): string =>
    `node scripts/setup_landing_zone.mjs --latest --source ${sourceKey} --install`

const appendCappedOutput = (
    current: string,
    chunk: string,
    githubToken: string | undefined,
): { value: string; truncated: boolean } => {
    const combined = `${current}${redactToken(chunk, githubToken)}`
    if (Buffer.byteLength(combined, 'utf-8') <= MAX_JOB_OUTPUT_BYTES) return { value: combined, truncated: false }
    const buffer = Buffer.from(combined, 'utf-8')
    return {
        value: `[output truncated to last ${MAX_JOB_OUTPUT_BYTES} bytes]\n${buffer.subarray(buffer.length - MAX_JOB_OUTPUT_BYTES).toString('utf-8')}`,
        truncated: true,
    }
}

const publicJobStatus = (job: StoredLzAddonUpdateJob): LzAddonUpdateJobStatus => ({
    id: job.id,
    sourceKey: job.sourceKey,
    pinnedRef: job.pinnedRef,
    command: job.command,
    stdout: job.stdout,
    stderr: job.stderr,
    state: job.state,
    createdAt: job.createdAt,
    ...(job.startedAt ? { startedAt: job.startedAt } : {}),
    ...(job.finishedAt ? { finishedAt: job.finishedAt } : {}),
    ...(job.exitCode !== undefined ? { exitCode: job.exitCode } : {}),
    ...(job.error ? { error: job.error } : {}),
    stdoutTruncated: job.stdoutTruncated,
    stderrTruncated: job.stderrTruncated,
})

export function findLandingZoneRepoRoot(start = process.cwd()): string {
    let current = path.resolve(start)
    while (current !== path.dirname(current)) {
        if (existsSync(path.join(current, 'scripts', 'setup_landing_zone.mjs'))) return current
        current = path.dirname(current)
    }
    throw new Error('Could not locate repository root for Landing Zone add-on update.')
}

export function loadLandingZoneSourcesManifest(repoRoot: string): LzSourcesManifest {
    const manifestFile = path.join(repoRoot, 'ocd', 'packages', 'react', 'src', 'landingzone', 'OcdLzSources.json')
    const manifest = JSON.parse(readFileSync(manifestFile, 'utf-8')) as LzSourcesManifest
    if (!manifest || !Array.isArray(manifest.sources)) {
        throw new Error('Landing Zone sources manifest is invalid.')
    }
    return manifest
}

const normalizeRole = (role: string | undefined): LzAddonSourceRole =>
    role === 'vendored-jsonnet' || role === 'reference' || role === 'project-addon' ? role : 'unknown'

const isInstallableProjectAddon = (source: LzSourceManifestEntry): boolean =>
    source.role === 'project-addon' && source.setup?.install?.mode === 'git-checkout' && Boolean(source.setup.localSubdir)

function assertProjectAddonSource(sourceKey: string, manifest: LzSourcesManifest): LzSourceManifestEntry {
    if (!SOURCE_KEY_PATTERN.test(sourceKey)) {
        throw new Error('Invalid Landing Zone add-on source key.')
    }
    const source = manifest.sources.find((entry) => entry.key === sourceKey)
    if (!source) {
        throw new Error(`Unknown Landing Zone add-on source '${sourceKey}'.`)
    }
    if (source.role !== 'project-addon') {
        throw new Error(`Landing Zone source '${sourceKey}' is not a project add-on.`)
    }
    if (!isInstallableProjectAddon(source)) {
        throw new Error(`Landing Zone project add-on '${sourceKey}' is not installable.`)
    }
    return source
}

export function listLandingZoneAddonHealth(start = process.cwd()): LzAddonSourceHealth[] {
    const repoRoot = findLandingZoneRepoRoot(start)
    const manifest = loadLandingZoneSourcesManifest(repoRoot)
    return manifest.sources.map((source) => {
        const installable = isInstallableProjectAddon(source)
        const localSubdir = source.setup?.localSubdir
        const installed = installable && localSubdir ? existsSync(path.join(repoRoot, localSubdir)) : false
        return {
            sourceKey: source.key,
            label: source.label,
            repo: source.repo,
            role: normalizeRole(source.role),
            pinnedRef: source.pinnedRef ?? '',
            ...(localSubdir ? { localSubdir } : {}),
            installable,
            installed,
            state: installable ? (installed ? 'installed' : 'missing') : 'not-installable',
        }
    })
}

function createValidatedUpdateJob(sourceKey: string, options: LzAddonUpdateOptions = {}): StoredLzAddonUpdateJob {
    const repoRoot = findLandingZoneRepoRoot(options.start)
    const manifest = loadLandingZoneSourcesManifest(repoRoot)
    assertProjectAddonSource(sourceKey, manifest)
    return {
        id: randomUUID(),
        sourceKey,
        pinnedRef: '',
        command: commandForSource(sourceKey),
        stdout: '',
        stderr: '',
        state: 'queued',
        createdAt: new Date().toISOString(),
        stdoutTruncated: false,
        stderrTruncated: false,
        repoRoot,
        githubToken: normalizeGithubToken(options.githubToken) || undefined,
    }
}

async function runUpdateJob(jobId: string): Promise<void> {
    const job = updateJobs.get(jobId)
    if (!job || job.state === 'cancelled') return
    const script = path.join(job.repoRoot, 'scripts', 'setup_landing_zone.mjs')
    const args = [script, '--latest', '--source', job.sourceKey, '--install']
    job.state = 'running'
    job.startedAt = new Date().toISOString()
    await new Promise<void>((resolve) => {
        const child = spawn(process.execPath, args, {
            cwd: job.repoRoot,
            env: childEnvWithGitHubToken(job.githubToken),
            stdio: ['ignore', 'pipe', 'pipe'],
        })
        job.child = child
        const timeout = setTimeout(() => {
            if (job.state === 'running') {
                job.error = `Update timed out after ${Math.round(UPDATE_TIMEOUT_MS / 1000)} seconds.`
                job.state = 'failed'
                child.kill('SIGTERM')
            }
        }, UPDATE_TIMEOUT_MS)
        child.stdout.on('data', (data: Buffer) => {
            const next = appendCappedOutput(job.stdout, data.toString('utf-8'), job.githubToken)
            job.stdout = next.value
            job.stdoutTruncated = job.stdoutTruncated || next.truncated
        })
        child.stderr.on('data', (data: Buffer) => {
            const next = appendCappedOutput(job.stderr, data.toString('utf-8'), job.githubToken)
            job.stderr = next.value
            job.stderrTruncated = job.stderrTruncated || next.truncated
        })
        child.on('error', (reason) => {
            job.error = reason.message
            job.state = 'failed'
        })
        child.on('close', (code) => {
            clearTimeout(timeout)
            job.child = undefined
            job.exitCode = code
            job.finishedAt = new Date().toISOString()
            if (job.state !== 'cancelled' && job.state !== 'failed') {
                if (code === 0) {
                    const refreshedManifest = loadLandingZoneSourcesManifest(job.repoRoot)
                    const refreshedSource = refreshedManifest.sources.find((source) => source.key === job.sourceKey)
                    job.pinnedRef = refreshedSource?.pinnedRef ?? ''
                    job.state = 'succeeded'
                } else {
                    job.state = 'failed'
                    job.error = `Update command exited with code ${code ?? 'unknown'}.`
                }
            }
            resolve()
        })
    })
}

export function startLandingZoneAddonUpdateJob(sourceKey: string, options: LzAddonUpdateOptions = {}): LzAddonUpdateJobStatus {
    const job = createValidatedUpdateJob(sourceKey, options)
    updateJobs.set(job.id, job)
    evictStaleJobs()
    updateQueue = updateQueue
        .catch((reason: unknown) => {
            logger.error('Landing Zone add-on update job failed', reason)
            return undefined
        })
        .then(() => runUpdateJob(job.id))
    return publicJobStatus(job)
}

export function getLandingZoneAddonUpdateJob(jobId: string): LzAddonUpdateJobStatus {
    evictStaleJobs()
    const job = updateJobs.get(jobId)
    if (!job) throw new Error('Unknown Landing Zone add-on update job.')
    return publicJobStatus(job)
}

export function cancelLandingZoneAddonUpdateJob(jobId: string): LzAddonUpdateJobStatus {
    const job = updateJobs.get(jobId)
    if (!job) throw new Error('Unknown Landing Zone add-on update job.')
    if (job.state === 'queued') {
        job.state = 'cancelled'
        job.finishedAt = new Date().toISOString()
    } else if (job.state === 'running') {
        job.state = 'cancelled'
        job.finishedAt = new Date().toISOString()
        job.child?.kill('SIGTERM')
    }
    return publicJobStatus(job)
}

export async function updateLandingZoneAddon(sourceKey: string, options: LzAddonUpdateOptions = {}): Promise<LzAddonUpdateResult> {
    const repoRoot = findLandingZoneRepoRoot(options.start)
    const manifest = loadLandingZoneSourcesManifest(repoRoot)
    assertProjectAddonSource(sourceKey, manifest)
    const script = path.join(repoRoot, 'scripts', 'setup_landing_zone.mjs')
    const args = [script, '--latest', '--source', sourceKey, '--install']
    const { stdout, stderr } = await execFileAsync(process.execPath, args, {
        cwd: repoRoot,
        timeout: UPDATE_TIMEOUT_MS,
        maxBuffer: MAX_OUTPUT_BYTES,
        env: childEnvWithGitHubToken(options.githubToken),
    })
    const refreshedManifest = loadLandingZoneSourcesManifest(repoRoot)
    const refreshedSource = refreshedManifest.sources.find((source) => source.key === sourceKey)
    return {
        sourceKey,
        pinnedRef: refreshedSource?.pinnedRef ?? '',
        command: commandForSource(sourceKey),
        stdout: redactToken(stdout, options.githubToken),
        stderr: redactToken(stderr, options.githubToken),
    }
}
