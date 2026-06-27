/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Upstream OKIT (oracle/oci-designer-toolkit) feature-availability check.
**
** Queries the public GitHub API to determine whether the upstream project has
** moved ahead of the fork's known baseline (OCTO_BASELINE_REF). Reports the
** latest commit/tag on the upstream default branch and hints at new resources by
** diffing the upstream OciResourceMap.ts text against a known-good resource count
** (OCTO_BASELINE_RESOURCE_COUNT).
**
** Network policy — identical to OcdLzUpdateCheck:
**   - UNAUTHENTICATED public GitHub REST / raw content APIs only.
**   - 8s AbortController timeout per request.
**   - NEVER throws to callers: failures are captured in the returned status.
**   - Results cached in-memory + localStorage (key 'ocd.upstream.check') for ~6h
**     to stay comfortably under the 60 req/hr unauthenticated rate limit.
**     Pass { force: true } to bypass the cache.
**
** Curation note: new upstream resources are surfaced as HINTS only.  This fork
** uses an explicit allow-list (OciResourceMap.ts) rather than a blind schema
** regen — see docs/oci-lz-designer-roadmap.md Phase A2.  The UI guidance
** points the developer to the right file to extend, it does not auto-regen.
*/

/** GitHub "owner/name" slug of the upstream project. */
export const UPSTREAM_REPO = 'oracle/oci-designer-toolkit'

/**
 * The fork's known baseline commit SHA for the upstream repo. Keep this in
 * sync when you manually cherry-pick upstream changes into the fork.
 * '' = not yet baselined (will always report behind).
 */
export const OCTO_BASELINE_REF: string = ''

/**
 * Number of Terraform resource entries in OciResourceMap.ts at the baseline.
 * Used to estimate whether upstream has added new resource types without
 * downloading the full file.  Update when you re-baseline.
 *
 * Current value = count of `"oci_*": "name"` lines in this fork's
 * `ocd/packages/codegen/src/importer/data/OciResourceMap.ts` (249 after the
 * ADM + AI catalog batch, 2026-06). This uses the same simple line-pattern
 * count as parseResourceMap, including data-map entries. Re-derive with:
 *   grep -cE '^\s*"oci_[^"]+"\s*:\s*"[^"]+"' ocd/packages/codegen/src/importer/data/OciResourceMap.ts
 */
export const OCTO_BASELINE_RESOURCE_COUNT = 249

/** Raw-content URL for the upstream resource map — used for resource hints. */
const UPSTREAM_RESOURCE_MAP_RAW_URL =
    `https://raw.githubusercontent.com/${UPSTREAM_REPO}/main/ocd/packages/codegen/src/importer/data/OciResourceMap.ts`

/** GitHub API: latest commits on the default branch. */
const UPSTREAM_COMMITS_URL =
    `https://api.github.com/repos/${UPSTREAM_REPO}/commits?per_page=1`

/** GitHub API: latest release. */
const UPSTREAM_RELEASES_URL =
    `https://api.github.com/repos/${UPSTREAM_REPO}/releases/latest`

/** GitHub compare URL between two refs (or the commits list when base is unknown). */
function buildCompareUrl(base: string, head: string): string {
    if (base && head) {
        return `https://github.com/${UPSTREAM_REPO}/compare/${base}...${head}`
    }
    return `https://github.com/${UPSTREAM_REPO}/commits`
}

const CACHE_KEY = 'ocd.upstream.check'
const CACHE_TTL_MS = 6 * 60 * 60 * 1000 // 6 hours — one poll per working session
const REQUEST_TIMEOUT_MS = 8000
const GITHUB_ACCEPT = 'application/vnd.github+json'

/** An individual "new resource hint" extracted from the upstream resource map. */
export interface ResourceHint {
    /** Terraform resource type, e.g. 'oci_core_instance'. */
    terraformType: string
    /** Short OCD model name, e.g. 'instance'. */
    ocdName: string
}

/**
 * The upstream feature-availability status object returned to callers.
 *
 * Shape contract (do not change field names; the UI and hook depend on them):
 *   latestUpstreamRef   — latest commit SHA on upstream default branch ('' when unknown)
 *   latestUpstreamTag   — latest release tag ('' when none / errored)
 *   baselineRef         — value of OCTO_BASELINE_REF this build was compared against
 *   behindBy            — estimated commit distance; -1 = unknown; 0 = up to date
 *   upstreamResourceCount — resource count inferred from upstream map; -1 = unknown
 *   newResourceHints    — resources present upstream but NOT in the local allow-list
 *   compareUrl          — GitHub compare/commits URL for manual review
 *   checkedAt           — ISO timestamp of this result
 *   error               — set when any part of the check failed (UI degrades gracefully)
 */
export interface UpstreamStatus {
    latestUpstreamRef: string
    latestUpstreamTag: string
    baselineRef: string
    behindBy: number
    upstreamResourceCount: number
    newResourceHints: ResourceHint[]
    compareUrl: string
    checkedAt: string
    error?: string
}

interface CacheEnvelope {
    timestamp: number
    status: UpstreamStatus
}

export interface UpstreamCheckOptions {
    force?: boolean
}

let memoryCache: CacheEnvelope | null = null

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function isFresh(envelope: CacheEnvelope | null): envelope is CacheEnvelope {
    return !!envelope && Date.now() - envelope.timestamp < CACHE_TTL_MS
}

function readLocalStorageCache(): CacheEnvelope | null {
    try {
        if (typeof localStorage === 'undefined') return null
        const raw = localStorage.getItem(CACHE_KEY)
        if (!raw) return null
        const parsed = JSON.parse(raw) as CacheEnvelope
        if (
            !parsed ||
            typeof parsed.timestamp !== 'number' ||
            typeof parsed.status !== 'object' ||
            parsed.status === null
        ) {
            return null
        }
        return parsed
    } catch {
        return null
    }
}

function writeCache(envelope: CacheEnvelope): void {
    memoryCache = envelope
    try {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(CACHE_KEY, JSON.stringify(envelope))
        }
    } catch {
        // localStorage full / unavailable — in-memory cache still applies.
    }
}

async function fetchJson(url: string): Promise<unknown> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: { Accept: GITHUB_ACCEPT },
            signal: controller.signal,
        })
        if (response.status === 403 || response.status === 429) {
            throw new Error('GitHub API rate limit reached — upstream check unavailable.')
        }
        if (!response.ok) {
            throw new Error(`GitHub API responded ${response.status}.`)
        }
        return (await response.json()) as unknown
    } finally {
        clearTimeout(timer)
    }
}

async function fetchText(url: string): Promise<string> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    try {
        const response = await fetch(url, {
            method: 'GET',
            signal: controller.signal,
        })
        if (!response.ok) {
            throw new Error(`Raw content fetch responded ${response.status}.`)
        }
        return await response.text()
    } finally {
        clearTimeout(timer)
    }
}

/**
 * Parses resource-map TS source text and returns the Terraform → OCD name
 * pairs it contains.  Relies only on the stable `"oci_*": "name"` line pattern
 * (not an AST), so it degrades gracefully on comment-only or whitespace-only
 * lines.
 */
function parseResourceMap(source: string): ResourceHint[] {
    const hints: ResourceHint[] = []
    // Match: optional whitespace, "oci_resource_type": "ocd_name",
    const line = /^\s*"(oci_[^"]+)"\s*:\s*"([^"]+)"/
    for (const raw of source.split('\n')) {
        const m = line.exec(raw)
        if (m) {
            hints.push({ terraformType: m[1], ocdName: m[2] })
        }
    }
    return hints
}

/**
 * Builds a set of Terraform types already in the local allow-list so we can
 * diff against upstream.  Imported lazily (dynamic import would require
 * bundler config changes) — instead we embed the local resource count as a
 * compile-time constant (OCTO_BASELINE_RESOURCE_COUNT) and compare numerically.
 * For a richer diff we'd need the local list available at runtime; the hint
 * approach provides a good-enough signal without importing the codegen package.
 */
function computeNewResourceHints(
    upstreamHints: ResourceHint[],
    baselineCount: number,
): ResourceHint[] {
    if (upstreamHints.length <= baselineCount) return []
    // Return entries beyond the baseline count as a conservative approximation.
    // These are the most recently added resources in the upstream map (assuming
    // append-only growth).  This avoids a runtime import of the codegen package.
    return upstreamHints.slice(baselineCount)
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Check the upstream oracle/oci-designer-toolkit for new activity and model
 * resources not yet in this fork.  Never throws — failures are captured in the
 * returned status.  Results are cached for ~6h.
 */
export async function checkUpstream(
    options: UpstreamCheckOptions = {},
): Promise<UpstreamStatus> {
    if (!options.force) {
        const cached = memoryCache ?? readLocalStorageCache()
        if (isFresh(cached)) {
            memoryCache = cached
            return cached.status
        }
    }

    const checkedAt = new Date().toISOString()

    // --- Fetch latest commit ------------------------------------------------
    let latestUpstreamRef = ''
    let behindBy = -1
    try {
        const commits = (await fetchJson(UPSTREAM_COMMITS_URL)) as Array<{
            sha?: string
            html_url?: string
        }>
        const head = Array.isArray(commits) && commits.length > 0 ? commits[0] : undefined
        if (head && typeof head.sha === 'string') {
            latestUpstreamRef = head.sha
        }
        // Determine behindBy: 0 when baseline matches, 1+ = we know we're behind,
        // -1 = unknown (no baseline or error).
        if (OCTO_BASELINE_REF && latestUpstreamRef) {
            const shortBase = OCTO_BASELINE_REF.slice(0, 12)
            const shortHead = latestUpstreamRef.slice(0, 12)
            behindBy = shortBase === shortHead ? 0 : 1
        }
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Commit fetch failed.'
        console.warn(`[upstream-check] Commit fetch failed: ${msg}`)
        const errorStatus: UpstreamStatus = {
            latestUpstreamRef: '',
            latestUpstreamTag: '',
            baselineRef: OCTO_BASELINE_REF,
            behindBy: -1,
            upstreamResourceCount: -1,
            newResourceHints: [],
            compareUrl: `https://github.com/${UPSTREAM_REPO}`,
            checkedAt,
            error: msg,
        }
        writeCache({ timestamp: Date.now(), status: errorStatus })
        return errorStatus
    }

    // --- Fetch latest release tag (best-effort; not fatal) ------------------
    let latestUpstreamTag = ''
    try {
        const release = (await fetchJson(UPSTREAM_RELEASES_URL)) as {
            tag_name?: string
        }
        if (typeof release.tag_name === 'string') {
            latestUpstreamTag = release.tag_name
        }
    } catch {
        // Release fetch failure is non-fatal — we still have the commit info.
    }

    // --- Fetch upstream resource map (best-effort; non-fatal) ---------------
    let upstreamResourceCount = -1
    let newResourceHints: ResourceHint[] = []
    try {
        const mapSource = await fetchText(UPSTREAM_RESOURCE_MAP_RAW_URL)
        const upstreamHints = parseResourceMap(mapSource)
        upstreamResourceCount = upstreamHints.length
        newResourceHints = computeNewResourceHints(upstreamHints, OCTO_BASELINE_RESOURCE_COUNT)
    } catch {
        // Resource map fetch failure degrades gracefully; upstreamResourceCount stays -1.
    }

    const compareUrl = buildCompareUrl(OCTO_BASELINE_REF, latestUpstreamRef)

    const status: UpstreamStatus = {
        latestUpstreamRef,
        latestUpstreamTag,
        baselineRef: OCTO_BASELINE_REF,
        behindBy,
        upstreamResourceCount,
        newResourceHints,
        compareUrl,
        checkedAt,
    }

    writeCache({ timestamp: Date.now(), status })
    return status
}

/** Timestamp (ms) of the most recent cached upstream check, or null if none. */
export function getUpstreamLastCheckedAt(): number | null {
    const cached = memoryCache ?? readLocalStorageCache()
    return cached ? cached.timestamp : null
}

/** Invalidate in-memory cache (does NOT touch localStorage). */
export function invalidateUpstreamCache(): void {
    memoryCache = null
}
