/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/**
 * Turn the per-source update-check results into an actionable "update plan" for
 * the one-click Update button.
 *
 * Why a plan and not a magic in-app apply: the OE jsonnet sources are vendored
 * and bundled at BUILD time (OcdLandingZoneJsonnetSources.ts), so a running
 * app — web or packaged Electron — cannot swap them in at runtime without a
 * re-vendor + rebuild. The honest, cross-platform action is therefore to make
 * that step one click: surface exactly what changed and hand the user the exact
 * command (copied to the clipboard), then re-check.
 *
 * This module is pure so the plan can be unit-tested; the clipboard / refresh
 * side effects live in the UI.
 */

import { LzUpdateStatus } from './OcdLzUpdateCheck'

/** The command that re-vendors the upstream LZ sources at their latest refs. */
export const SETUP_LZ_COMMAND = 'npm run setup-lz:latest'

/** Files whose pinned ref must be bumped to the new SHA after re-vendoring. */
export const LZ_PIN_FILES = [
    'ocd/packages/react/src/landingzone/OcdLzSources.ts',
    'scripts/setup_landing_zone.mjs',
] as const

export interface UpdatePlanItem {
    key: string
    label: string
    repo: string
    /** Current pinned ref ('' when unpinned). */
    fromRef: string
    /** Latest ref available upstream. */
    toRef: string
    /** Short display form of the latest ref. */
    toRefShort: string
    /** GitHub compare (or commits) URL for the change. */
    compareUrl: string
}

export interface UpdatePlan {
    hasUpdates: boolean
    /** Only the sources with an update available. */
    items: UpdatePlanItem[]
    /** The re-vendor command to run in the repo root. */
    command: string
    /** Source files whose pin must be updated to the new ref afterwards. */
    pinFiles: readonly string[]
}

/** Short display form for a ref: first 12 chars of a commit SHA, tags verbatim. */
export function shortRef(ref: string): string {
    if (!ref) return '(unpinned)'
    return ref.length > 12 ? ref.slice(0, 12) : ref
}

/** Build a GitHub compare URL (or a commits URL when there is no pinned base). */
export function compareUrl(repo: string, fromRef: string, toRef: string): string {
    if (fromRef && toRef) return `https://github.com/${repo}/compare/${fromRef}...${toRef}`
    if (toRef) return `https://github.com/${repo}/commits`
    return `https://github.com/${repo}`
}

/** Build the actionable update plan from the update-check statuses. */
export function buildUpdatePlan(statuses: ReadonlyArray<LzUpdateStatus>): UpdatePlan {
    const items: UpdatePlanItem[] = statuses
        .filter((status) => status.updateAvailable)
        .map((status) => ({
            key: status.key,
            label: status.label,
            repo: status.repo,
            fromRef: status.current,
            toRef: status.latest,
            toRefShort: status.latestShort || shortRef(status.latest),
            compareUrl: compareUrl(status.repo, status.current, status.latest),
        }))
    return {
        hasUpdates: items.length > 0,
        items,
        command: SETUP_LZ_COMMAND,
        pinFiles: LZ_PIN_FILES,
    }
}
