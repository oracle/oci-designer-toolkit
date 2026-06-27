/*
** Copyright (c) 2020, 2026, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
    getOciStencil,
    getOciStencilPath,
    getOciStencilUrl,
    ociStencilById,
    ociStencilClassNames,
    ociStencilCollections,
    ociStencilCssVariables,
    ociStencils,
} from '../OcdOciStencils'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const reactRoot = path.resolve(__dirname, '../../..')
const desktopRoot = path.resolve(reactRoot, '../desktop')
const stencilCss = fs.readFileSync(path.join(reactRoot, 'src/css/oci-stencils.css'), 'utf8')

describe('OCI stencil catalog', () => {
    it('keeps the imported General and Services/Product stencil counts stable', () => {
        const counts = ociStencils.reduce<Record<string, number>>(
            (acc, stencil) => ({ ...acc, [stencil.collection]: (acc[stencil.collection] ?? 0) + 1 }),
            {},
        )

        expect(ociStencilCollections.map((collection) => collection.id)).toEqual(['general', 'services-products'])
        expect(ociStencils).toHaveLength(368)
        expect(counts).toEqual({
            general: 110,
            'services-products': 258,
        })
    })

    it('defines stable ids, CSS variables, and class names for every stencil', () => {
        const ids = new Set(ociStencils.map((stencil) => stencil.id))

        expect(ids.size).toBe(ociStencils.length)
        for (const stencil of ociStencils) {
            expect(stencil.className).toBe(`ocd-oci-stencil-${stencil.id}`)
            expect(stencil.cssVariable).toBe(`--ocd-oci-stencil-${stencil.id}`)
            expect(stencil.path).toBe(`oci-stencils/${stencil.collection}/${stencil.id}.svg`)
            expect(ociStencilById[stencil.id]).toBe(stencil)
            expect(ociStencilClassNames[stencil.id]).toBe(stencil.className)
            expect(ociStencilCssVariables[stencil.id]).toBe(stencil.cssVariable)
            expect(getOciStencil(stencil.id)).toBe(stencil)
            expect(getOciStencilPath(stencil.id)).toBe(stencil.path)
            expect(stencilCss).toContain(`${stencil.cssVariable}:`)
            expect(stencilCss).toContain(`.${stencil.className} {`)
        }
    })

    it('mirrors every generated SVG into the React and desktop public asset roots', () => {
        for (const stencil of ociStencils) {
            const reactAsset = path.join(reactRoot, 'public', stencil.path)
            const desktopAsset = path.join(desktopRoot, 'public', stencil.path)

            expect(fs.existsSync(reactAsset), `${stencil.id} missing from React public assets`).toBe(true)
            expect(fs.existsSync(desktopAsset), `${stencil.id} missing from desktop public assets`).toBe(true)
            expect(fs.readFileSync(reactAsset, 'utf8')).toMatch(/<svg[\s>]/)
            expect(fs.readFileSync(desktopAsset, 'utf8')).toMatch(/<svg[\s>]/)
        }
    })

    it('resolves browser-safe URLs without requiring a DOM', () => {
        expect(getOciStencilUrl('services-products-database', 'https://example.test/oci-designer-toolkit/'))
            .toBe('https://example.test/oci-designer-toolkit/oci-stencils/services-products/services-products-database.svg')
        expect(getOciStencilUrl('missing-stencil', 'https://example.test/')).toBeUndefined()
    })
})
