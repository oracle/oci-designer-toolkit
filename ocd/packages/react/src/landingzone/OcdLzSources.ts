/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Typed wrapper around OcdLzSources.json, the single source of truth for the
** official OCI Landing Zone upstream repositories and project add-ons that this
** fork tracks. The in-app "OCI Landing Zone updates" check and
** scripts/setup_landing_zone.mjs both read this list.
**
** IMPORTANT: the 'operating-entities' pinnedRef below MUST stay in sync with
** the generated OE jsonnet source bundle. When you re-vendor with
** `npm run setup-lz:latest`, update that pinnedRef in OcdLzSources.json to
** the new SHA the script prints.
*/

import lzSourcesManifest from './OcdLzSources.json'

export type LzSourceKind = 'commit' | 'release'
export type LzSourceRole = 'vendored-jsonnet' | 'reference' | 'project-addon' | 'software-addon'

export interface LzSourceSetup {
    cloneSubdir?: string
    localSubdir: string
    generator?: string
    generatedFile?: string
    skipWorktree?: boolean
    gitIgnored?: boolean
    install?: {
        mode: 'git-checkout'
    }
}

export interface LzSource {
    /** Stable identifier used as a key/localStorage discriminator. */
    key: string
    /** Human-friendly label shown in the UI. */
    label: string
    /** GitHub "owner/name" slug. */
    repo: string
    /** 'commit' tracks the default-branch HEAD; 'release' tracks the latest GitHub release tag. */
    kind: LzSourceKind
    /** Pinned commit SHA (kind 'commit') or release tag (kind 'release'). '' = not yet pinned (informational). */
    pinnedRef: string
    /** How the app uses this upstream source. */
    role?: LzSourceRole
    /** Marks the canonical/always-used source for its role (e.g. the LZNG wizard source). */
    default?: boolean
    /** Repo-relative path of the committed, vendored (embedded) copy of this source, if any. */
    embedded?: string
    /** Optional sub-path used to scope a compare URL (reserved; not required by the check). */
    comparePath?: string
    /** Local vendoring instructions for setup_landing_zone.mjs. */
    setup?: LzSourceSetup
}

export const OCI_LZ_SOURCES: LzSource[] = lzSourcesManifest.sources as LzSource[]
