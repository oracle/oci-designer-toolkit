/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { describe, expect, it } from 'vitest'
import { OCI_LZ_SOURCES } from '../OcdLzSources'

describe('OCI_LZ_SOURCES', () => {
    it('keeps source keys unique for update checks', () => {
        const keys = OCI_LZ_SOURCES.map((source) => source.key)
        expect(new Set(keys).size).toBe(keys.length)
    })

    it('declares the vendored Operating Entities source setup metadata', () => {
        const source = OCI_LZ_SOURCES.find((entry) => entry.key === 'operating-entities')

        expect(source).toBeDefined()
        expect(source?.kind).toBe('commit')
        expect(source?.pinnedRef).toMatch(/^[0-9a-f]{40}$/)
        expect(source?.setup).toMatchObject({
            cloneSubdir: 'gen',
            localSubdir: 'ocd/packages/react/src/landingzone/oe/gen',
            generatedFile: 'ocd/packages/react/src/landingzone/oe/OcdLandingZoneJsonnetSources.ts',
        })
    })

    it('keeps manifest entries valid for setup/update tooling', () => {
        for (const source of OCI_LZ_SOURCES) {
            expect(source.key).toMatch(/^[a-z0-9-]+$/)
            expect(source.label.length).toBeGreaterThan(0)
            expect(source.repo).toMatch(/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/)
            expect(['commit', 'release']).toContain(source.kind)
            expect(['vendored-jsonnet', 'reference', 'project-addon']).toContain(source.role)

            if (source.pinnedRef) {
                expect(source.pinnedRef).toMatch(source.kind === 'commit' ? /^[0-9a-f]{40}$/ : /^.+$/)
            }

            if (source.role === 'vendored-jsonnet') {
                expect(source.setup).toEqual(expect.objectContaining({
                    cloneSubdir: expect.any(String),
                    localSubdir: expect.any(String),
                    generator: expect.any(String),
                    generatedFile: expect.any(String),
                }))
            }
        }
    })

    it('tracks Landing Zone Next Gen as a project add-on source', () => {
        expect(OCI_LZ_SOURCES).toContainEqual(expect.objectContaining({
            key: 'landing-zone-next-gen',
            repo: 'iwanhoogendoorn/landing-zone-next-gen',
            role: 'project-addon',
            kind: 'commit',
        }))
    })
})
