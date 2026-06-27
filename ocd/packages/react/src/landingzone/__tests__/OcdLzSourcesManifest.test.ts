/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Structural validation of the OcdLzSources.json manifest (via the typed
** OCI_LZ_SOURCES wrapper). Catches malformed entries before they reach the
** update check or scripts/setup_landing_zone.mjs: duplicate keys, unknown
** roles/kinds, bad repo slugs, malformed pins, and vendored sources missing
** their setup metadata.
*/

import { describe, expect, it } from 'vitest'
import { OCI_LZ_SOURCES } from '../OcdLzSources'

const VALID_ROLES = ['vendored-jsonnet', 'project-addon', 'reference']
const VALID_KINDS = ['commit', 'release']
/** GitHub "owner/name" slug. */
const REPO_SLUG = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/
const FULL_SHA = /^[0-9a-f]{40}$/
const EXTERNAL_ADDON_SUBDIR = /^external\/lz-addons\/[a-z0-9-]+$/

describe('OcdLzSources manifest', () => {
    it('has at least one source', () => {
        expect(OCI_LZ_SOURCES.length).toBeGreaterThan(0)
    })

    it('keeps source keys unique', () => {
        const keys = OCI_LZ_SOURCES.map((source) => source.key)
        expect(new Set(keys).size).toBe(keys.length)
    })

    it('only uses known roles (or leaves role undefined)', () => {
        for (const source of OCI_LZ_SOURCES) {
            if (source.role !== undefined) {
                expect(VALID_ROLES, `source '${source.key}' role`).toContain(source.role)
            }
        }
    })

    it('only uses known kinds', () => {
        for (const source of OCI_LZ_SOURCES) {
            expect(VALID_KINDS, `source '${source.key}' kind`).toContain(source.kind)
        }
    })

    it('gives every vendored-jsonnet source complete setup metadata', () => {
        const vendored = OCI_LZ_SOURCES.filter((source) => source.role === 'vendored-jsonnet')
        expect(vendored.length).toBeGreaterThan(0)
        for (const source of vendored) {
            expect(source.setup, `source '${source.key}' setup`).toBeDefined()
            const setup = source.setup!
            for (const field of ['cloneSubdir', 'localSubdir', 'generator', 'generatedFile'] as const) {
                expect(typeof setup[field], `source '${source.key}' setup.${field}`).toBe('string')
                expect(setup[field].length, `source '${source.key}' setup.${field} non-empty`).toBeGreaterThan(0)
            }
        }
    })

    it('gives every project add-on a git-ignored external checkout target', () => {
        const projectAddons = OCI_LZ_SOURCES.filter((source) => source.role === 'project-addon')
        expect(projectAddons.length).toBeGreaterThan(0)
        for (const source of projectAddons) {
            expect(source.setup, `source '${source.key}' setup`).toBeDefined()
            expect(source.setup?.localSubdir, `source '${source.key}' setup.localSubdir`).toMatch(EXTERNAL_ADDON_SUBDIR)
            expect(source.setup?.gitIgnored, `source '${source.key}' setup.gitIgnored`).toBe(true)
            expect(source.setup?.install?.mode, `source '${source.key}' setup.install.mode`).toBe('git-checkout')
        }
    })

    it('uses valid GitHub owner/name repo slugs', () => {
        for (const source of OCI_LZ_SOURCES) {
            expect(source.repo, `source '${source.key}' repo`).toMatch(REPO_SLUG)
        }
    })

    it("pins commit sources to '' or a full 40-hex sha", () => {
        for (const source of OCI_LZ_SOURCES) {
            if (source.kind !== 'commit') continue
            const valid = source.pinnedRef === '' || FULL_SHA.test(source.pinnedRef)
            expect(valid, `source '${source.key}' pinnedRef '${source.pinnedRef}'`).toBe(true)
        }
    })
})
