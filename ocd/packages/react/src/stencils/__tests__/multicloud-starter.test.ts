/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { describe, it, expect } from 'vitest'
import { validateStencilManifest, manifestToPaletteProvider } from '../OcdStencilRegistry'
import gcpStarter from '../packs/gcp-starter.json'
import azureStarter from '../packs/azure-starter.json'

describe.each([
    { name: 'GCP', pack: gcpStarter, prefix: 'custom-gcp-', count: 9 },
    { name: 'Azure', pack: azureStarter, prefix: 'custom-azure-', count: 12 },
])('$name starter stencil pack', ({ pack, prefix, count }) => {
    it('validates as importable custom stencils with the provider prefix', () => {
        const manifests = validateStencilManifest(pack)
        expect(manifests).toHaveLength(count)
        for (const manifest of manifests) {
            expect(manifest.provider).toBe('custom')
            expect(manifest.class.startsWith(prefix)).toBe(true)
            expect(manifest.title.length).toBeGreaterThan(0)
            expect(manifest.svgIcon.length).toBeGreaterThan(0)
        }
    })

    it('has unique stencil classes', () => {
        const classes = validateStencilManifest(pack).map((m) => m.class)
        expect(new Set(classes).size).toBe(classes.length)
    })

    it('builds a palette provider block', () => {
        const provider = manifestToPaletteProvider(validateStencilManifest(pack))
        expect(provider.provider).toBe('custom')
        expect(provider.groups[0].resources).toHaveLength(count)
    })
})
