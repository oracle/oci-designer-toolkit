/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { describe, expect, it } from 'vitest'
import {
    parseMxCells,
    mxCellToOcdType,
    isCompressedDrawio,
    buildDesignFromDrawio,
    MAX_DRAWIO_CELLS,
} from '../OcdDrawioImport'

const DRAWIO_XML = `<mxGraphModel dx="800" dy="600" grid="1">
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="cmp" value="Shared Compartment" style="rounded=1;dashed=1;" vertex="1" parent="1"><mxGeometry x="40" y="40" width="420" height="320" as="geometry"/></mxCell>
    <mxCell id="vcn1" value="Prod VCN" style="shape=mxgraph.oci.networking.virtual_cloud_network;" vertex="1" parent="cmp"><mxGeometry x="20" y="40" width="180" height="160" as="geometry"/></mxCell>
    <mxCell id="sub1" value="App Subnet" style="shape=subnet;whiteSpace=wrap;" vertex="1" parent="vcn1"><mxGeometry x="10" y="40" width="140" height="40" as="geometry"/></mxCell>
    <mxCell id="vm1" value="App Instance" style="shape=mxgraph.oci.compute.instance;" vertex="1" parent="cmp"><mxGeometry x="240" y="40" width="140" height="40" as="geometry"/></mxCell>
    <mxCell id="e1" style="endArrow=none;" edge="1" parent="1" source="sub1" target="vcn1"><mxGeometry relative="1" as="geometry"/></mxCell>
  </root>
</mxGraphModel>`

describe('parseMxCells', () => {
    it('extracts vertices and edges with their attributes', () => {
        const cells = parseMxCells(DRAWIO_XML)
        const vertices = cells.filter((c) => c.vertex)
        const edges = cells.filter((c) => c.edge)
        expect(vertices.map((v) => v.id)).toEqual(['cmp', 'vcn1', 'sub1', 'vm1'])
        expect(edges).toHaveLength(1)
        expect(edges[0]).toMatchObject({ source: 'sub1', target: 'vcn1' })
        expect(vertices.find((v) => v.id === 'sub1')?.parent).toBe('vcn1')
    })

    it('decodes XML entities in labels', () => {
        const cells = parseMxCells('<root><mxCell id="x" value="A &amp; B&#10;line2" vertex="1" parent="1"/></root>')
        expect(cells[0].value).toBe('A & B line2')
    })

    it('parses an unclosed <mxCell> tag in bounded time (no ReDoS backtracking)', () => {
        // A `<mxCell>` whose `</mxCell>` never arrives, followed by a large body —
        // the previous lazy dot-all body match would backtrack catastrophically.
        const malicious = `<root><mxCell id="open" value="x" vertex="1" parent="1">${'a'.repeat(200_000)}`
        const start = performance.now()
        const cells = parseMxCells(malicious)
        expect(performance.now() - start).toBeLessThan(500)
        expect(cells.map((c) => c.id)).toEqual(['open']) // opening tag still extracted
    })

    it('rejects inputs over the size cap', () => {
        const huge = 'a'.repeat(10 * 1024 * 1024 + 1)
        expect(() => parseMxCells(huge)).toThrow(/exceeds/)
    })

    it('bails when the cell count exceeds the limit', () => {
        // Stays well under the byte cap but carries more than MAX_DRAWIO_CELLS
        // tiny <mxCell> tags — the secondary cap must stop the scan.
        const cell = '<mxCell id="c" vertex="1" parent="1"/>'
        const flood = `<root>${cell.repeat(MAX_DRAWIO_CELLS + 1)}</root>`
        expect(() => parseMxCells(flood)).toThrow(new RegExp(`${MAX_DRAWIO_CELLS}-cell`))
    })

    it('accepts a diagram exactly at the cell limit', () => {
        const cell = '<mxCell id="c" vertex="1" parent="1"/>'
        const atLimit = `<root>${cell.repeat(MAX_DRAWIO_CELLS)}</root>`
        expect(parseMxCells(atLimit)).toHaveLength(MAX_DRAWIO_CELLS)
    })
})

describe('mxCellToOcdType', () => {
    it('maps OCI shapes/labels to model types (specific beats generic)', () => {
        expect(mxCellToOcdType({ value: 'Prod VCN', style: '' })).toBe('vcn')
        expect(mxCellToOcdType({ value: 'App Subnet', style: '' })).toBe('subnet')
        expect(mxCellToOcdType({ value: 'Shared Compartment', style: '' })).toBe('compartment')
        expect(mxCellToOcdType({ value: 'App Instance', style: 'shape=compute' })).toBe('instance')
        expect(mxCellToOcdType({ value: 'ADW', style: 'shape=autonomous database' })).toBe('autonomous_database')
        expect(mxCellToOcdType({ value: 'Prod OKE Cluster', style: '' })).toBe('oke_cluster')
        expect(mxCellToOcdType({ value: 'Internet Gateway', style: '' })).toBe('internet_gateway')
    })

    it('returns undefined for unrecognised cells', () => {
        expect(mxCellToOcdType({ value: 'Some Note', style: 'text;' })).toBeUndefined()
    })
})

describe('isCompressedDrawio', () => {
    it('detects a compressed <diagram> payload', () => {
        expect(isCompressedDrawio('<mxfile><diagram id="x">7Vpdc5s4FP01ftyMA==</diagram></mxfile>')).toBe(true)
    })
    it('is false for uncompressed mxGraphModel xml', () => {
        expect(isCompressedDrawio(DRAWIO_XML)).toBe(false)
    })
})

describe('buildDesignFromDrawio', () => {
    it('recreates resources and the subnet -> vcn relation', () => {
        const { design, counts } = buildDesignFromDrawio(DRAWIO_XML, 'From draw.io')
        expect(design.metadata.title).toBe('From draw.io')
        // root compartment + the "Shared Compartment" cell
        expect(counts.compartment).toBe(2)
        expect(counts.vcn).toBe(1)
        expect(counts.subnet).toBe(1)
        expect(counts.instance).toBe(1)
        const vcn = design.model.oci.resources.vcn[0]
        const subnet = design.model.oci.resources.subnet[0]
        // The edge sub1 -> vcn1 wired the subnet's vcnId FK.
        expect(subnet.vcnId).toBe(vcn.id)
        // The instance landed in the mapped compartment (not the root).
        const sharedCmp = design.model.oci.resources.compartment.find((c: { displayName: string }) => c.displayName === 'Shared Compartment')
        expect(design.model.oci.resources.instance[0].compartmentId).toBe(sharedCmp.id)
    })

    it('throws on a compressed .drawio file', () => {
        expect(() => buildDesignFromDrawio('<mxfile><diagram>7VpAbc==</diagram></mxfile>')).toThrow(/compressed/i)
    })

    it('throws when no OCI resources are recognised', () => {
        const xml = '<mxGraphModel><root><mxCell id="n" value="just a note" style="text" vertex="1" parent="1"/></root></mxGraphModel>'
        expect(() => buildDesignFromDrawio(xml)).toThrow(/No recognisable OCI resources/)
    })
})
