/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import type { LzAddonUpdateJobStatus } from '@ocd/query'
import { OciApiFacade } from '../facade/OciApiFacade'

const DEFAULT_POLL_INTERVAL_MS = 1000
const TERMINAL_STATES = new Set<LzAddonUpdateJobStatus['state']>(['succeeded', 'failed', 'cancelled'])

export interface LzAddonUpdateJobOutcome {
    kind: 'updated' | 'failed'
    refreshSources: boolean
    sourceKey: string
    pinnedRef: string
    message: string
}

const sleep = (durationMs: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, durationMs))

export const normalizeLzGithubToken = (githubToken: string | undefined): string | undefined => {
    const token = githubToken?.trim() ?? ''
    return token === '' ? undefined : token
}

export const latestJobOutputLine = (job: LzAddonUpdateJobStatus): string => {
    const output = `${job.stderr}\n${job.stdout}`
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
    return output[output.length - 1] ?? ''
}

export const describeLzAddonUpdateJob = (job: LzAddonUpdateJobStatus): string => {
    const lastLine = latestJobOutputLine(job)
    if (job.state === 'queued') return 'Queued backend update job.'
    if (job.state === 'running') return lastLine ? `Running backend update: ${lastLine}` : 'Running backend update job.'
    if (job.state === 'succeeded') return `Updated to ${job.pinnedRef ? job.pinnedRef.slice(0, 12) : 'latest'} using ${job.command}`
    if (job.state === 'cancelled') return 'Update job cancelled.'
    return job.error ?? 'Update job failed.'
}

export const summarizeLzAddonUpdateJobOutcome = (job: LzAddonUpdateJobStatus): LzAddonUpdateJobOutcome => ({
    kind: job.state === 'succeeded' ? 'updated' : 'failed',
    refreshSources: job.state === 'succeeded',
    sourceKey: job.sourceKey,
    pinnedRef: job.pinnedRef,
    message: describeLzAddonUpdateJob(job),
})

export const runLandingZoneAddonUpdateJob = async (
    sourceKey: string,
    githubToken: string | undefined,
    onStatus: (status: LzAddonUpdateJobStatus) => void,
    pollIntervalMs = DEFAULT_POLL_INTERVAL_MS,
): Promise<LzAddonUpdateJobStatus> => {
    let status = await OciApiFacade.startLandingZoneAddonUpdateJob(sourceKey, normalizeLzGithubToken(githubToken))
    onStatus(status)
    while (!TERMINAL_STATES.has(status.state)) {
        await sleep(pollIntervalMs)
        status = await OciApiFacade.getLandingZoneAddonUpdateJob(status.id)
        onStatus(status)
    }
    return status
}
