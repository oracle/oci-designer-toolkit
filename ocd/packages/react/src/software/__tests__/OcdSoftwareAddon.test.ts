/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { describe, expect, it } from 'vitest'
import { parseSoftwareAddonManifest } from '../OcdSoftwareAddon'
import { buildSoftwareCatalog, findSoftwarePackage, searchSoftwareCatalog, OCD_SOFTWARE_CATALOG } from '../OcdSoftwareCatalog'

const validPackage = {
    id: 'caddy',
    name: 'Caddy',
    vendor: 'Caddy',
    category: 'web',
    tags: ['web', 'tls'],
    description: 'Automatic-HTTPS web server.',
    prerequisites: [{ tool: 'caddy', ports: [80, 443, 'nope', 70000] }],
    ansible: { source: 'galaxy', ref: 'nvjacobo.caddy', role: 'nvjacobo.caddy' },
    defaultVars: { caddy_systemd_capabilities: true },
}

describe('parseSoftwareAddonManifest', () => {
    it('namespaces ids with the source key so add-ons cannot shadow seed packages', () => {
        const { packages, errors } = parseSoftwareAddonManifest({ packages: [validPackage] }, 'myaddon')
        expect(errors).toEqual([])
        expect(packages).toHaveLength(1)
        expect(packages[0].id).toBe('myaddon:caddy')
        expect(packages[0].addonSource).toBe('myaddon')
    })

    it('coerces ports — drops non-numeric and out-of-range values', () => {
        const { packages } = parseSoftwareAddonManifest([validPackage], 'a')
        expect(packages[0].prerequisites[0].ports).toEqual([80, 443])
    })

    it('accepts a bare array as well as a { packages } envelope', () => {
        expect(parseSoftwareAddonManifest([validPackage], 'a').packages).toHaveLength(1)
        expect(parseSoftwareAddonManifest({ packages: [validPackage] }, 'a').packages).toHaveLength(1)
    })

    it('parses a JSON string manifest', () => {
        const { packages } = parseSoftwareAddonManifest(JSON.stringify([validPackage]), 'a')
        expect(packages[0].name).toBe('Caddy')
    })

    it('drops malformed packages with a reported reason, keeping valid ones', () => {
        const { packages, errors } = parseSoftwareAddonManifest(
            [
                validPackage,
                { id: 'no-name', ansible: { source: 'galaxy', ref: 'x', role: 'x' } },
                { id: 'bad-ansible', name: 'X', ansible: { source: 'svn', ref: 'x', role: 'x' } },
                { name: 'no id' },
            ],
            'a',
        )
        expect(packages.map((p) => p.id)).toEqual(['a:caddy'])
        expect(errors).toHaveLength(3)
        expect(errors.join(' ')).toMatch(/missing name|ansible.source|missing or invalid id/)
    })

    it('defaults an unknown category to runtime rather than rejecting', () => {
        const { packages } = parseSoftwareAddonManifest([{ ...validPackage, category: 'nonsense' }], 'a')
        expect(packages[0].category).toBe('runtime')
    })

    it('rejects an invalid source key and bad JSON without throwing', () => {
        expect(parseSoftwareAddonManifest([validPackage], 'bad key!').packages).toEqual([])
        expect(parseSoftwareAddonManifest('{ not json', 'a').errors[0]).toMatch(/not valid JSON/)
        expect(parseSoftwareAddonManifest({ nope: true }, 'a').errors[0]).toMatch(/array or/)
    })

    it('ignores duplicate ids within one manifest', () => {
        const { packages, errors } = parseSoftwareAddonManifest([validPackage, validPackage], 'a')
        expect(packages).toHaveLength(1)
        expect(errors.join(' ')).toMatch(/duplicate/)
    })
})

describe('buildSoftwareCatalog', () => {
    it('returns the seed catalogue unchanged with no add-ons', () => {
        expect(buildSoftwareCatalog()).toHaveLength(OCD_SOFTWARE_CATALOG.length)
    })

    it('appends add-on packages and makes them searchable', () => {
        const { packages } = parseSoftwareAddonManifest([validPackage], 'myaddon')
        const catalog = buildSoftwareCatalog(packages)
        expect(catalog).toHaveLength(OCD_SOFTWARE_CATALOG.length + 1)
        expect(findSoftwarePackage('myaddon:caddy', catalog)?.name).toBe('Caddy')
        expect(searchSoftwareCatalog('tls', catalog).map((p) => p.id)).toContain('myaddon:caddy')
    })

    it('lets a seed package win over an add-on with the same (namespaced) id', () => {
        const fakeSeedCollision = { ...OCD_SOFTWARE_CATALOG[0] } // already a seed id
        const catalog = buildSoftwareCatalog([fakeSeedCollision])
        expect(catalog).toHaveLength(OCD_SOFTWARE_CATALOG.length)
    })
})
