/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Dismissible banner shown below the dark header when:
**   (a) one or more pinned LZ upstream sources have a newer commit/release, OR
**   (b) the upstream oracle/oci-designer-toolkit has new commits / model resources
**       beyond the fork's known baseline.
**
** The LZ-data row: summarises updates, links to GitHub, copies the one-click
** `npm run setup-lz:latest` re-vendor command to the clipboard.
**
** The upstream OKIT row: read-only guidance — links to the upstream compare URL,
** surfaces new-resource hints, and explains the curation path (OciResourceMap.ts).
** No automatic regen is triggered.
**
** Self-styled under `.ocd-lzng`.
*/

import React, { useState } from 'react'
import { LzUpdateStatus } from '../OcdLzUpdateCheck'
import { buildUpdatePlan, shortRef as planShortRef } from '../OcdLzUpdatePlan'
import { UpstreamStatus } from '../../upstream/OcdUpstreamCheck'

export interface LzngUpdateBannerProps {
    statuses: LzUpdateStatus[]
    onDismiss: () => void
    /** Opens the full Sources & Updates panel. */
    onOpenPanel: () => void
    /** Re-run the update check after the user applies an update. */
    onRefresh?: () => void
    /**
     * Upstream OKIT feature-availability status.  When provided and
     * `hasNewFeatures` is true, an additional "new upstream features" row is
     * shown beneath the LZ-data row.
     */
    upstreamStatus?: UpstreamStatus | null
    /** When true the upstream features row is rendered. */
    hasNewUpstreamFeatures?: boolean
}

function shortRef(value: string): string {
    return planShortRef(value)
}

/** Copy text to the clipboard, tolerating environments without the async API. */
async function copyToClipboard(text: string): Promise<boolean> {
    try {
        if (navigator?.clipboard?.writeText) {
            await navigator.clipboard.writeText(text)
            return true
        }
    } catch {
        /* fall through to the legacy path */
    }
    try {
        const el = document.createElement('textarea')
        el.value = text
        el.style.position = 'fixed'
        el.style.opacity = '0'
        document.body.appendChild(el)
        el.select()
        const ok = document.execCommand('copy')
        document.body.removeChild(el)
        return ok
    } catch {
        return false
    }
}

export function LzngUpdateBanner({
    statuses,
    onDismiss,
    onOpenPanel,
    onRefresh,
    upstreamStatus,
    hasNewUpstreamFeatures,
}: LzngUpdateBannerProps): JSX.Element | null {
    const [showHow, setShowHow] = useState(false)
    const [updateState, setUpdateState] = useState<'idle' | 'copied' | 'failed'>('idle')
    const [showUpstreamHow, setShowUpstreamHow] = useState(false)
    const [upstreamCopyState, setUpstreamCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')

    // Unavailable (private/unreachable) sources can never surface in the banner.
    const available = statuses.filter((status) => status.updateAvailable && !status.unavailable)
    const showUpstreamRow = !!hasNewUpstreamFeatures && !!upstreamStatus && !upstreamStatus.error

    // Render nothing when there are no LZ updates AND no upstream features to surface.
    if (available.length === 0 && !showUpstreamRow) return null

    // LZ-data row variables (only used when available.length > 0).
    const primary = available.length > 0 ? available[0] : null
    const extra = available.length - 1
    const plan = buildUpdatePlan(statuses)

    const onUpdateNow = async (): Promise<void> => {
        const ok = await copyToClipboard(plan.command)
        setUpdateState(ok ? 'copied' : 'failed')
        setShowHow(true)
        onRefresh?.()
    }

    // Upstream curation guidance command — copy-to-clipboard path.
    const upstreamCurationCommand =
        'npm run setup-lz:latest  # or: npm run compile && npm run generate'

    const onCopyUpstreamGuidance = async (): Promise<void> => {
        const ok = await copyToClipboard(upstreamCurationCommand)
        setUpstreamCopyState(ok ? 'copied' : 'failed')
        setShowUpstreamHow(true)
    }

    return (
        <div className='ocd-lzng-update-banner' role='status' aria-live='polite'>

            {/* ------------------------------------------------------------------ */}
            {/* Row 1 — LZ data updates (only when at least one source is behind). */}
            {/* ------------------------------------------------------------------ */}
            {primary !== null && (
                <>
                    <div className='ocd-lzng-update-banner-main'>
                        <span className='ocd-lzng-update-banner-dot' aria-hidden />
                        <div className='ocd-lzng-update-banner-text'>
                            <strong>OCI Landing Zone updates available</strong>
                            {' — '}
                            {primary.label}{' '}
                            <code>{shortRef(primary.current)}</code>
                            {' → '}
                            <code>{primary.latestShort || shortRef(primary.latest)}</code>
                            {extra > 0 && <span className='ocd-lzng-update-banner-more'> (+{extra} more)</span>}
                            {showHow && (
                                <div className='ocd-lzng-update-banner-how'>
                                    {updateState === 'copied' && (
                                        <p className='ocd-lzng-update-copied'>✓ Copied <code>{plan.command}</code> to the clipboard.</p>
                                    )}
                                    {updateState === 'failed' && (
                                        <p className='ocd-lzng-update-copied'>Run this command in the repo root:</p>
                                    )}
                                    <p>
                                        Run <code>{plan.command}</code> to re-vendor the sources at the latest version, rebuild,
                                        then bump the pinned ref in{' '}
                                        {plan.pinFiles.map((file, i) => (
                                            <React.Fragment key={file}>
                                                {i > 0 && ' and '}
                                                <code>{file.split('/').pop()}</code>
                                            </React.Fragment>
                                        ))}{' '}
                                        to the SHA the script prints.
                                    </p>
                                    {plan.items.length > 0 && (
                                        <ul className='ocd-lzng-update-changes'>
                                            {plan.items.map((item) => (
                                                <li key={item.key}>
                                                    {item.label}: <code>{shortRef(item.fromRef)}</code> → <code>{item.toRefShort}</code>{' '}
                                                    <a href={item.compareUrl} target='_blank' rel='noreferrer'>compare ↗</a>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className='ocd-lzng-update-banner-actions'>
                        <button
                            type='button'
                            className='ocd-lzng-btn ocd-lzng-btn-primary'
                            onClick={onUpdateNow}
                            title='Copy the re-vendor command and show exactly what changed'
                        >
                            {updateState === 'copied' ? '✓ Command copied' : 'Update now'}
                        </button>
                        <a
                            className='ocd-lzng-btn'
                            href={primary.url}
                            target='_blank'
                            rel='noreferrer'
                        >
                            View {primary.kind === 'release' ? 'release' : 'commit'} ↗
                        </a>
                        <button
                            type='button'
                            className='ocd-lzng-btn'
                            aria-expanded={showHow}
                            onClick={() => setShowHow((value) => !value)}
                        >
                            Details
                        </button>
                        <button type='button' className='ocd-lzng-btn' onClick={onOpenPanel}>
                            Sources &amp; Updates
                        </button>
                    </div>
                </>
            )}

            {/* ------------------------------------------------------------------ */}
            {/* Row 2 — Upstream OKIT feature guidance (read-only; no auto-regen). */}
            {/* ------------------------------------------------------------------ */}
            {showUpstreamRow && upstreamStatus && (
                <>
                    <div className='ocd-lzng-update-banner-main ocd-lzng-update-banner-upstream'>
                        <span className='ocd-lzng-update-banner-dot ocd-lzng-update-banner-dot-upstream' aria-hidden />
                        <div className='ocd-lzng-update-banner-text'>
                            <strong>OCTO: new upstream OKIT features available</strong>
                            {upstreamStatus.latestUpstreamRef && (
                                <>{' — '}<code>{upstreamStatus.latestUpstreamRef.slice(0, 12)}</code></>
                            )}
                            {upstreamStatus.latestUpstreamTag && (
                                <>{' ('}<code>{upstreamStatus.latestUpstreamTag}</code>{')'}</>
                            )}
                            {upstreamStatus.newResourceHints.length > 0 && (
                                <span className='ocd-lzng-update-banner-more'>
                                    {' '}· {upstreamStatus.newResourceHints.length} new resource type{upstreamStatus.newResourceHints.length !== 1 ? 's' : ''}
                                </span>
                            )}
                            {showUpstreamHow && (
                                <div className='ocd-lzng-update-banner-how'>
                                    {upstreamCopyState === 'copied' && (
                                        <p className='ocd-lzng-update-copied'>✓ Copied curation command to the clipboard.</p>
                                    )}
                                    <p>
                                        This fork uses a curated allow-list, not a blind schema regen.
                                        To incorporate upstream model changes:
                                    </p>
                                    <ol className='ocd-lzng-update-changes'>
                                        <li>
                                            Review what changed:{' '}
                                            <a href={upstreamStatus.compareUrl} target='_blank' rel='noreferrer'>
                                                upstream compare ↗
                                            </a>
                                        </li>
                                        <li>
                                            Cherry-pick or manually add new Terraform types to{' '}
                                            <code>ocd/packages/codegen/src/importer/data/OciResourceMap.ts</code>
                                            {' '}with curated <code>resourceAttributes</code>.
                                        </li>
                                        <li>
                                            Regenerate the model: <code>{upstreamCurationCommand}</code>
                                        </li>
                                        <li>
                                            Update <code>OCTO_BASELINE_REF</code> and{' '}
                                            <code>OCTO_BASELINE_RESOURCE_COUNT</code> in{' '}
                                            <code>ocd/packages/react/src/upstream/OcdUpstreamCheck.ts</code>
                                            {' '}to the new SHA / resource count.
                                        </li>
                                    </ol>
                                    {upstreamStatus.newResourceHints.length > 0 && (
                                        <>
                                            <p>New resource hints from upstream (not yet in allow-list):</p>
                                            <ul className='ocd-lzng-update-changes'>
                                                {upstreamStatus.newResourceHints.slice(0, 10).map((hint) => (
                                                    <li key={hint.terraformType}>
                                                        <code>{hint.terraformType}</code>
                                                        {' → '}<code>{hint.ocdName}</code>
                                                    </li>
                                                ))}
                                                {upstreamStatus.newResourceHints.length > 10 && (
                                                    <li>…and {upstreamStatus.newResourceHints.length - 10} more</li>
                                                )}
                                            </ul>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className='ocd-lzng-update-banner-actions'>
                        <button
                            type='button'
                            className='ocd-lzng-btn ocd-lzng-btn-primary'
                            onClick={onCopyUpstreamGuidance}
                            title='Copy the curation command and show the guided update path'
                        >
                            {upstreamCopyState === 'copied' ? '✓ Command copied' : 'Curation guide'}
                        </button>
                        <a
                            className='ocd-lzng-btn'
                            href={upstreamStatus.compareUrl}
                            target='_blank'
                            rel='noreferrer'
                        >
                            Compare upstream ↗
                        </a>
                        <button
                            type='button'
                            className='ocd-lzng-btn'
                            aria-expanded={showUpstreamHow}
                            onClick={() => setShowUpstreamHow((v) => !v)}
                        >
                            Details
                        </button>
                    </div>
                </>
            )}

            {/* Shared dismiss button — always visible. */}
            <div className='ocd-lzng-update-banner-actions ocd-lzng-update-banner-dismiss-row'>
                <button
                    type='button'
                    className='ocd-lzng-update-banner-dismiss'
                    aria-label='Dismiss update notice'
                    onClick={onDismiss}
                >
                    ✕
                </button>
            </div>
        </div>
    )
}
