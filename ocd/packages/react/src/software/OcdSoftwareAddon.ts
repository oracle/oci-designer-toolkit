/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Software add-on sources (blueprint phase 4). A registered `software-addon`
** GitHub source (see OcdLzSources / setup_landing_zone.mjs) ships a descriptor
** manifest (`ocd-software.json`) declaring the packages it can install. This
** module parses that descriptor into validated catalogue entries.
**
** The manifest is UNTRUSTED third-party input, so every field is distrusted:
** malformed packages are dropped with a reported error (never silently), and
** every id is namespaced as `<sourceKey>:<id>` so an add-on can never shadow a
** seed package (e.g. 'docker') or another add-on's entry.
*/

import {
    AnsibleSource,
    OcdSoftwarePackage,
    OcdSoftwarePrerequisite,
} from './OcdSoftwareCatalog'

/** Shape a software-addon repo ships (array or `{ packages: [...] }`). */
export type SoftwareAddonManifest = unknown

export interface SoftwareAddonParseResult {
    packages: OcdSoftwarePackage[]
    errors: string[]
}

/** Defensive cap so a hostile manifest cannot flood the catalogue. */
const MAX_ADDON_PACKAGES = 200

const ID_RE = /^[a-z0-9][a-z0-9_-]*$/i
const CATEGORIES = new Set<OcdSoftwarePackage['category']>([
    'runtime', 'web', 'database', 'observability', 'ci-cd', 'messaging', 'security',
])
const SOURCES = new Set<AnsibleSource>(['galaxy', 'github'])

const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0

const asStringArray = (value: unknown): string[] =>
    Array.isArray(value) ? value.filter(isNonEmptyString).map((s) => s.trim()) : []

const asPorts = (value: unknown): number[] =>
    Array.isArray(value)
        ? value
              .map((p) => Number(p))
              .filter((p) => Number.isInteger(p) && p >= 1 && p <= 65535)
        : []

function parsePrerequisite(raw: unknown): OcdSoftwarePrerequisite | null {
    if (!raw || typeof raw !== 'object') return null
    const r = raw as Record<string, unknown>
    if (!isNonEmptyString(r.tool)) return null
    const prereq: OcdSoftwarePrerequisite = { tool: r.tool.trim() }
    if (isNonEmptyString(r.minVersion)) prereq.minVersion = r.minVersion.trim()
    const ports = asPorts(r.ports)
    if (ports.length) prereq.ports = ports
    const os = asStringArray(r.os)
    if (os.length) prereq.os = os
    return prereq
}

function parsePackage(raw: unknown, sourceKey: string, errors: string[]): OcdSoftwarePackage | null {
    if (!raw || typeof raw !== 'object') {
        errors.push(`${sourceKey}: skipped a package that is not an object`)
        return null
    }
    const r = raw as Record<string, unknown>
    const reject = (why: string): null => {
        errors.push(`${sourceKey}: skipped package '${isNonEmptyString(r.id) ? r.id : '<no id>'}' — ${why}`)
        return null
    }

    if (!isNonEmptyString(r.id) || !ID_RE.test(r.id)) return reject('missing or invalid id')
    if (!isNonEmptyString(r.name)) return reject('missing name')

    const ansible = r.ansible as Record<string, unknown> | undefined
    if (!ansible || !SOURCES.has(ansible.source as AnsibleSource)) return reject("ansible.source must be 'galaxy' or 'github'")
    if (!isNonEmptyString(ansible.ref)) return reject('missing ansible.ref')
    if (!isNonEmptyString(ansible.role)) return reject('missing ansible.role')

    const prerequisites = Array.isArray(r.prerequisites)
        ? r.prerequisites.map(parsePrerequisite).filter((p): p is OcdSoftwarePrerequisite => p !== null)
        : []

    const category = CATEGORIES.has(r.category as OcdSoftwarePackage['category'])
        ? (r.category as OcdSoftwarePackage['category'])
        : 'runtime'

    const pkg: OcdSoftwarePackage = {
        id: `${sourceKey}:${r.id.trim()}`,
        name: r.name.trim(),
        vendor: isNonEmptyString(r.vendor) ? r.vendor.trim() : 'Community',
        category,
        tags: asStringArray(r.tags),
        description: isNonEmptyString(r.description) ? r.description.trim() : '',
        prerequisites,
        ansible: {
            source: ansible.source as AnsibleSource,
            ref: (ansible.ref as string).trim(),
            role: (ansible.role as string).trim(),
        },
        addonSource: sourceKey,
    }
    if (r.defaultVars && typeof r.defaultVars === 'object' && !Array.isArray(r.defaultVars)) {
        pkg.defaultVars = r.defaultVars as Record<string, unknown>
    }
    return pkg
}

/**
 * Parse a software-addon descriptor into validated, namespaced catalogue
 * entries. Accepts a JSON string or a parsed value; an array or a
 * `{ packages: [...] }` envelope. Never throws — returns dropped-entry reasons
 * in `errors` so the caller can surface them.
 */
export function parseSoftwareAddonManifest(manifest: SoftwareAddonManifest, sourceKey: string): SoftwareAddonParseResult {
    const errors: string[] = []
    if (!isNonEmptyString(sourceKey) || !ID_RE.test(sourceKey)) {
        return { packages: [], errors: [`invalid add-on source key '${String(sourceKey)}'`] }
    }

    let value: unknown = manifest
    if (typeof manifest === 'string') {
        try {
            value = JSON.parse(manifest)
        } catch {
            return { packages: [], errors: [`${sourceKey}: manifest is not valid JSON`] }
        }
    }

    const rawList = Array.isArray(value)
        ? value
        : value && typeof value === 'object' && Array.isArray((value as Record<string, unknown>).packages)
          ? ((value as Record<string, unknown>).packages as unknown[])
          : null
    if (!rawList) return { packages: [], errors: [`${sourceKey}: manifest must be an array or { packages: [...] }`] }

    if (rawList.length > MAX_ADDON_PACKAGES) {
        errors.push(`${sourceKey}: manifest lists ${rawList.length} packages; only the first ${MAX_ADDON_PACKAGES} are used`)
    }

    const seen = new Set<string>()
    const packages: OcdSoftwarePackage[] = []
    for (const raw of rawList.slice(0, MAX_ADDON_PACKAGES)) {
        const pkg = parsePackage(raw, sourceKey, errors)
        if (!pkg) continue
        if (seen.has(pkg.id)) {
            errors.push(`${sourceKey}: duplicate package id '${pkg.id}' ignored`)
            continue
        }
        seen.add(pkg.id)
        packages.push(pkg)
    }
    return { packages, errors }
}
