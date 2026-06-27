/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** "Sources & Updates" card. Lists every tracked upstream OCI Landing Zone source
** grouped by role (vendored jsonnet → project add-on → reference) with its repo
** link, pinned (current) ref, latest ref, a status badge (up to date / update
** available / unpinned / private or unreachable / check failed), the
** release/commit date, and a refresh button. Self-styled under `.ocd-lzng`.
*/

import React, { useMemo, useState } from 'react'
import { buildProjectAddonDescriptors, canUpdateSourceFromBackend } from '../OcdLzAddonManager'
import { LzUpdateStatus } from '../OcdLzUpdateCheck'
import { LzSourceRole, OCI_LZ_SOURCES } from '../OcdLzSources'
import { describeLzAddonUpdateJob, runLandingZoneAddonUpdateJob, summarizeLzAddonUpdateJobOutcome } from '../OcdLzUpdateJobClient'

export interface LzngSourcesPanelProps {
    statuses: LzUpdateStatus[]
    loading: boolean
    onRefresh: () => void
    githubToken?: string
    githubTokenConfigured?: boolean
    onGithubTokenChange?: (token: string) => void
    onSourceUpdated?: (sourceKey: string, pinnedRef: string) => void
    /** Optional close handler when rendered as a dismissible card. */
    onClose?: () => void
}

type BadgeKind = 'ok' | 'update' | 'unpinned' | 'unavailable' | 'error'

interface Badge {
    kind: BadgeKind
    text: string
}

function deriveBadge(status: LzUpdateStatus): Badge {
    if (status.unavailable) return { kind: 'unavailable', text: 'Private or unreachable — skipped' }
    if (status.error) return { kind: 'error', text: 'Check failed' }
    if (status.current === '') return { kind: 'unpinned', text: 'Unpinned' }
    if (status.updateAvailable) return { kind: 'update', text: 'Update available' }
    return { kind: 'ok', text: 'Up to date' }
}

/** Display order + labels for the role groups. */
const ROLE_ORDER: LzSourceRole[] = ['vendored-jsonnet', 'project-addon', 'software-addon', 'reference']

const ROLE_LABELS: Record<LzSourceRole, string> = {
    'vendored-jsonnet': 'Vendored jsonnet',
    'project-addon': 'Project add-ons',
    'software-addon': 'Software add-ons',
    'reference': 'Reference',
}

/**
 * Role for a status row. Falls back to the manifest (by key) for legacy cached
 * statuses that predate the `role` field, then to 'reference'.
 */
function resolveRole(status: LzUpdateStatus): LzSourceRole {
    return status.role ?? OCI_LZ_SOURCES.find((source) => source.key === status.key)?.role ?? 'reference'
}

function shortRef(value: string): string {
    if (!value) return '—'
    return value.length > 12 ? value.slice(0, 12) : value
}

function formatDate(iso: string): string {
    if (!iso) return '—'
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return '—'
    return date.toISOString().slice(0, 10)
}

export function LzngSourcesPanel({
    statuses,
    loading,
    onRefresh,
    githubToken = '',
    githubTokenConfigured = false,
    onGithubTokenChange,
    onSourceUpdated,
    onClose,
}: LzngSourcesPanelProps): JSX.Element {
    const projectAddons = useMemo(() => buildProjectAddonDescriptors(OCI_LZ_SOURCES, statuses), [statuses])
    const sourceByKey = useMemo(() => new Map(OCI_LZ_SOURCES.map((source) => [source.key, source])), [])
    const [updatingKey, setUpdatingKey] = useState<string>('')
    const [tokenDraft, setTokenDraft] = useState('')
    const [sourceMessage, setSourceMessage] = useState<Record<string, { kind: 'ok' | 'error'; text: string }>>({})
    const unavailablePrivateSources = statuses.filter((status) => status.unavailable && resolveRole(status) === 'project-addon')
    const updateSource = async (sourceKey: string) => {
        setUpdatingKey(sourceKey)
        setSourceMessage((messages) => ({ ...messages, [sourceKey]: { kind: 'ok', text: 'Queued backend update job…' } }))
        try {
            const result = await runLandingZoneAddonUpdateJob(sourceKey, githubToken, (job) => {
                setSourceMessage((messages) => ({
                    ...messages,
                    [sourceKey]: {
                        kind: job.state === 'failed' || job.state === 'cancelled' ? 'error' : 'ok',
                        text: describeLzAddonUpdateJob(job),
                    },
                }))
            })
            if (result.state !== 'succeeded') throw new Error(result.error ?? describeLzAddonUpdateJob(result))
            const outcome = summarizeLzAddonUpdateJobOutcome(result)
            setSourceMessage((messages) => ({
                ...messages,
                [sourceKey]: { kind: 'ok', text: outcome.message },
            }))
            if (outcome.refreshSources) onSourceUpdated?.(outcome.sourceKey, outcome.pinnedRef)
        } catch (err: unknown) {
            setSourceMessage((messages) => ({
                ...messages,
                [sourceKey]: { kind: 'error', text: err instanceof Error ? err.message : 'Update failed.' },
            }))
        } finally {
            setUpdatingKey('')
        }
    }
    return (
        <section className='ocd-lzng-card ocd-lzng-sources-card'>
            <div className='ocd-lzng-card-head'>
                <h2 className='ocd-lzng-card-title'>Sources &amp; Updates</h2>
                <div className='ocd-lzng-sources-head-actions'>
                    <button type='button' className='ocd-lzng-btn' disabled={loading} onClick={onRefresh}>
                        {loading ? 'Checking…' : 'Refresh'}
                    </button>
                    {onClose && (
                        <button
                            type='button'
                            className='ocd-lzng-btn'
                            aria-label='Close sources and updates panel'
                            onClick={onClose}
                        >
                            Close
                        </button>
                    )}
                </div>
            </div>
            <div className='ocd-lzng-card-body'>
                <p className='ocd-lzng-sources-intro'>
                    Tracked official OCI Landing Zone repositories and the versions this build pins.
                </p>
                {unavailablePrivateSources.length > 0 && onGithubTokenChange && (
                    <div className='ocd-lzng-github-login'>
                        <div>
                            <strong>Private GitHub sources</strong>
                            <span>
                                {githubTokenConfigured
                                    ? 'GitHub token is active for this session.'
                                    : 'Add a GitHub token to check private project add-ons and run authenticated updates.'}
                            </span>
                        </div>
                        <label>
                            <span>GitHub token</span>
                            <input
                                autoComplete='off'
                                onChange={(event) => setTokenDraft(event.target.value)}
                                placeholder={githubTokenConfigured ? 'Token active' : 'ghp_…'}
                                type='password'
                                value={tokenDraft}
                            />
                        </label>
                        <button
                            type='button'
                            className='ocd-lzng-btn'
                            disabled={tokenDraft.trim() === ''}
                            onClick={() => {
                                onGithubTokenChange(tokenDraft.trim())
                                setTokenDraft('')
                            }}
                        >
                            Use token
                        </button>
                        {githubTokenConfigured && (
                            <button
                                type='button'
                                className='ocd-lzng-btn'
                                onClick={() => onGithubTokenChange('')}
                            >
                                Clear
                            </button>
                        )}
                    </div>
                )}
                {projectAddons.length > 0 && (
                    <div className='ocd-lzng-addon-manager'>
                        <div className='ocd-lzng-addon-manager-head'>
                            <h3>Project add-on manager</h3>
                            <span>Local checkouts are stored under <code>external/lz-addons/</code>.</span>
                        </div>
                        {projectAddons.map((addon) => {
                            const message = sourceMessage[addon.key]
                            return (
                                <div className='ocd-lzng-addon-row' key={addon.key}>
                                    <div>
                                        <strong>{addon.label}</strong>
                                        <dl className='ocd-lzng-addon-meta'>
                                            <div>
                                                <dt>Local path</dt>
                                                <dd><code>{addon.localSubdir}</code></dd>
                                            </div>
                                            <div>
                                                <dt>Command</dt>
                                                <dd><code>{addon.updateCommand}</code></dd>
                                            </div>
                                        </dl>
                                        {message && (
                                            <p className={`ocd-lzng-addon-message ocd-lzng-addon-message-${message.kind}`}>
                                                {message.text}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        type='button'
                                        className='ocd-lzng-btn'
                                        disabled={loading || updatingKey !== ''}
                                        onClick={() => updateSource(addon.key)}
                                    >
                                        {updatingKey === addon.key ? 'Updating…' : addon.updateAvailable ? 'Update add-on' : 'Install / refresh'}
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                )}
                <ul className='ocd-lzng-sources-list'>
                    {statuses.length === 0 && !loading && (
                        <li className='ocd-lzng-placeholder'>No sources tracked.</li>
                    )}
                    {ROLE_ORDER.map((role) => {
                        const grouped = statuses.filter((status) => resolveRole(status) === role)
                        if (grouped.length === 0) return null
                        return (
                            <React.Fragment key={role}>
                                <li className='ocd-lzng-source-role-group'>{ROLE_LABELS[role]}</li>
                                {grouped.map((status) => {
                                    const badge = deriveBadge(status)
                                    const source = sourceByKey.get(status.key)
                                    const canUpdate = canUpdateSourceFromBackend(source)
                                    const message = sourceMessage[status.key]
                                    return (
                                        <li className='ocd-lzng-source-row' key={status.key}>
                                            <div className='ocd-lzng-source-head'>
                                                <div className='ocd-lzng-source-title'>
                                                    <span className='ocd-lzng-source-label'>{status.label}</span>
                                                    {message && (
                                                        <span className={`ocd-lzng-source-message ocd-lzng-source-message-${message.kind}`}>
                                                            {message.text}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className='ocd-lzng-source-row-actions'>
                                                    <span className={`ocd-lzng-badge ocd-lzng-badge-${badge.kind}`}>{badge.text}</span>
                                                    {canUpdate && (
                                                        <button
                                                            type='button'
                                                            className='ocd-lzng-btn ocd-lzng-source-update-btn'
                                                            disabled={loading || updatingKey !== ''}
                                                            onClick={() => updateSource(status.key)}
                                                        >
                                                            {updatingKey === status.key ? 'Updating…' : status.updateAvailable ? 'Update now' : 'Refresh checkout'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <a
                                                className='ocd-lzng-source-repo'
                                                href={`https://github.com/${status.repo}`}
                                                target='_blank'
                                                rel='noreferrer'
                                            >
                                                {status.repo} ↗
                                            </a>
                                            <dl className='ocd-lzng-source-meta'>
                                                <div>
                                                    <dt>Pinned</dt>
                                                    <dd>
                                                        <code>{shortRef(status.current)}</code>
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt>Latest</dt>
                                                    <dd>
                                                        {status.unavailable ? (
                                                            <span className='ocd-lzng-source-unavailable'>skipped</span>
                                                        ) : status.error ? (
                                                            <span className='ocd-lzng-source-unavailable'>check unavailable</span>
                                                        ) : (
                                                            <a href={status.url} target='_blank' rel='noreferrer'>
                                                                <code>{status.latestShort || shortRef(status.latest)}</code> ↗
                                                            </a>
                                                        )}
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt>{status.kind === 'release' ? 'Released' : 'Committed'}</dt>
                                                    <dd>{formatDate(status.date)}</dd>
                                                </div>
                                            </dl>
                                        </li>
                                    )
                                })}
                            </React.Fragment>
                        )
                    })}
                </ul>
            </div>
        </section>
    )
}
