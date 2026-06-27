/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { describe, expect, it } from 'vitest'
import {
    OCD_SOFTWARE_CATALOG,
    findSoftwarePackage,
    searchSoftwareCatalog,
} from '../OcdSoftwareCatalog'

describe('OcdSoftwareCatalog', () => {
    it('seeds a non-trivial catalogue with unique ids', () => {
        expect(OCD_SOFTWARE_CATALOG.length).toBeGreaterThanOrEqual(10)
        const ids = OCD_SOFTWARE_CATALOG.map((p) => p.id)
        expect(new Set(ids).size).toBe(ids.length)
    })

    it('gives every package a concrete Ansible role reference', () => {
        for (const pkg of OCD_SOFTWARE_CATALOG) {
            expect(['galaxy', 'github']).toContain(pkg.ansible.source)
            expect(pkg.ansible.ref.length).toBeGreaterThan(0)
            expect(pkg.ansible.role.length).toBeGreaterThan(0)
            expect(pkg.prerequisites.length).toBeGreaterThan(0)
        }
    })

    it('finds a package by id', () => {
        expect(findSoftwarePackage('nginx')?.name).toBe('NGINX')
        expect(findSoftwarePackage('does-not-exist')).toBeUndefined()
    })

    it('returns the whole catalogue for an empty query', () => {
        expect(searchSoftwareCatalog('')).toHaveLength(OCD_SOFTWARE_CATALOG.length)
        expect(searchSoftwareCatalog('   ')).toHaveLength(OCD_SOFTWARE_CATALOG.length)
    })

    it('searches case-insensitively across name, tags, and category', () => {
        expect(searchSoftwareCatalog('DATABASE').map((p) => p.id)).toEqual(
            expect.arrayContaining(['postgresql', 'mysql', 'redis']),
        )
        expect(searchSoftwareCatalog('monitoring').map((p) => p.id)).toContain('prometheus')
        expect(searchSoftwareCatalog('hashicorp').map((p) => p.id)).toEqual(['vault'])
    })
})
