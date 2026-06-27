/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { describe, it, expect } from 'vitest'
import {
    validateStencilManifest,
    manifestToPaletteProvider,
    newCustomResourceInstance,
    svgIconToDataUri,
    hydrateStencilCss,
    CustomStencilManifest,
} from '../OcdStencilRegistry'
import sampleStencil from '../__fixtures__/sample-stencil.json'

const goodManifest: CustomStencilManifest = sampleStencil as CustomStencilManifest

describe('validateStencilManifest', () => {
    it('accepts a single valid manifest object and normalises to an array', () => {
        const result = validateStencilManifest(goodManifest)
        expect(result).toHaveLength(1)
        expect(result[0].class).toBe('custom-acme-widget')
        expect(result[0].properties).toHaveLength(3)
    })

    it('accepts an array of valid manifests', () => {
        const second = { ...goodManifest, class: 'custom-second-widget', title: 'Second' }
        const result = validateStencilManifest([goodManifest, second])
        expect(result).toHaveLength(2)
        expect(result.map((m) => m.class)).toEqual(['custom-acme-widget', 'custom-second-widget'])
    })

    it('rejects a manifest whose class does not start with custom-', () => {
        const bad = { ...goodManifest, class: 'acme-widget' }
        expect(() => validateStencilManifest(bad)).toThrow(/custom-/)
    })

    it('rejects a manifest with a class containing unsafe characters', () => {
        const bad = { ...goodManifest, class: 'custom-bad class{}' }
        expect(() => validateStencilManifest(bad)).toThrow(/Invalid stencil manifest/)
    })

    it('rejects a manifest missing required fields', () => {
        const bad = { provider: 'custom', class: 'custom-x' }
        expect(() => validateStencilManifest(bad)).toThrow(/Invalid stencil manifest/)
    })

    it('rejects an unknown property type', () => {
        const bad = { ...goodManifest, properties: [{ key: 'k', label: 'L', type: 'date' }] }
        expect(() => validateStencilManifest(bad)).toThrow(/Invalid stencil manifest/)
    })

    it('defaults container to false and properties to [] when omitted', () => {
        const minimal = { provider: 'custom', class: 'custom-min', title: 'Min', svgIcon: '<svg/>' }
        const [m] = validateStencilManifest(minimal)
        expect(m.container).toBe(false)
        expect(m.properties).toEqual([])
    })
})

describe('manifestToPaletteProvider', () => {
    it('produces a single custom provider with one group of resources', () => {
        const provider = manifestToPaletteProvider([goodManifest])
        expect(provider.provider).toBe('custom')
        expect(provider.class).toBe('custom-provider')
        expect(provider.groups).toHaveLength(1)
        expect(provider.groups[0].resources).toEqual([
            { title: 'ACME Widget', class: 'custom-acme-widget', container: false },
        ])
    })
})

describe('newCustomResourceInstance', () => {
    it('mints a custom-provider instance with id, class and property defaults', () => {
        const instance = newCustomResourceInstance(goodManifest, 'cmp-123')
        expect(instance.provider).toBe('custom')
        expect(instance.class).toBe('custom-acme-widget')
        expect(instance.resourceType).toBe('custom-acme-widget')
        expect(instance.displayName).toBe('ACME Widget')
        expect(instance.compartmentId).toBe('cmp-123')
        expect(instance.parentId).toBe('')
        expect(instance.id.startsWith('okit.custom.')).toBe(true)
        // Property defaults stored as top-level fields.
        expect((instance as Record<string, unknown>).endpoint).toBe('')
        expect((instance as Record<string, unknown>).replicas).toBe(1)
        expect((instance as Record<string, unknown>).enabled).toBe(true)
    })

    it('seeds type-based defaults when a property declares no default', () => {
        const manifest: CustomStencilManifest = {
            ...goodManifest,
            properties: [
                { key: 'host', label: 'Host', type: 'string' },
                { key: 'count', label: 'Count', type: 'number' },
                { key: 'flag', label: 'Flag', type: 'boolean' },
            ],
        }
        const instance = newCustomResourceInstance(manifest, 'cmp') as Record<string, unknown>
        expect(instance.host).toBe('')
        expect(instance.count).toBe(0)
        expect(instance.flag).toBe(false)
    })

    it('assigns a unique id per instance', () => {
        const a = newCustomResourceInstance(goodManifest, 'cmp')
        const b = newCustomResourceInstance(goodManifest, 'cmp')
        expect(a.id).not.toBe(b.id)
    })
})

describe('svgIconToDataUri', () => {
    it('passes through an existing data-URI unchanged', () => {
        expect(svgIconToDataUri(goodManifest.svgIcon)).toBe(goodManifest.svgIcon)
    })

    it('base64-encodes a raw <svg> string into a data-URI', () => {
        const uri = svgIconToDataUri('<svg xmlns="http://www.w3.org/2000/svg"/>')
        expect(uri.startsWith('data:image/svg+xml;base64,')).toBe(true)
        const decoded = Buffer.from(uri.split(',')[1], 'base64').toString('utf-8')
        expect(decoded).toContain('<svg')
    })
})

describe('hydrateStencilCss', () => {
    it('is a no-op (does not throw) when document is undefined (node env)', () => {
        const design = { userDefined: { customStencils: { 'custom-acme-widget': goodManifest } } } as any
        expect(() => hydrateStencilCss(design)).not.toThrow()
    })

    it('is a no-op when there are no custom stencils', () => {
        const design = { userDefined: {} } as any
        expect(() => hydrateStencilCss(design)).not.toThrow()
    })
})
