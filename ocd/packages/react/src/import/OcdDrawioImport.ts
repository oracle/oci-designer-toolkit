/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/**
 * Import a draw.io (diagrams.net / mxGraph) diagram and recreate it as an
 * editable OCD design — resources plus their relations.
 *
 * Pipeline (all pure / DOM-free so it unit-tests under node):
 *   1. parseMxCells   — extract <mxCell> vertices and edges from mxGraphModel XML.
 *   2. mxCellToOcdType — map a cell (its shape style + label) to an OCD model
 *                        resource type via keyword heuristics.
 *   3. buildDesignFromDrawio — create OCI model resources (full per-type clients,
 *                        so foreign-key fields exist), nest them by container,
 *                        and wire edges into FK associations.
 *
 * The exact pixel geometry is intentionally NOT preserved: the caller runs the
 * Designer auto-layout, mirroring the Terraform / OKIT import flows. What is
 * preserved is the architecture — which resources exist and how they relate.
 *
 * draw.io's default ".drawio" wraps the model in a deflate+base64 <diagram>
 * payload. We handle the uncompressed ("Editable XML" / "Uncompressed") form
 * directly; a compressed payload is detected and reported so the caller can ask
 * the user to re-export uncompressed.
 */

import { OcdDesign, OciModelResources } from '@ocd/model'
import { connectResources } from '../components/OcdConnect'

/** A parsed draw.io cell (vertex or edge). */
export interface MxCell {
    id: string
    value: string
    style: string
    parent: string
    vertex: boolean
    edge: boolean
    source: string
    target: string
}

export interface DrawioImportResult {
    design: OcdDesign
    counts: Record<string, number>
    topCompartmentIds: string[]
    notes: string[]
}

const attr = (tag: string, name: string): string => {
    const m = new RegExp(`\\b${name}="([^"]*)"`).exec(tag)
    return m ? decodeXmlEntities(m[1]) : ''
}

function decodeXmlEntities(s: string): string {
    return s
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&#10;/g, ' ')
        .replace(/&#xa;/gi, ' ')
}

/** True when the content is a compressed draw.io file we cannot inflate here. */
export function isCompressedDrawio(content: string): boolean {
    return /<diagram[^>]*>[^<]/.test(content) && !/<mxGraphModel/.test(content)
}

/**
 * Extract every <mxCell> from an mxGraphModel XML string. Tolerant of attribute
 * order and self-closing or geometry-wrapped cells.
 */
// Reject pathologically large inputs before regex scanning. Real draw.io
// diagrams are well under this; the cap bounds worst-case parse time and memory.
export const MAX_DRAWIO_INPUT_BYTES = 10 * 1024 * 1024 // 10 MiB

// Secondary cap on the number of cells extracted. A crafted payload can stay
// under the byte cap yet carry an enormous count of tiny <mxCell> tags; bailing
// here bounds the downstream per-cell work (resource creation, FK wiring).
export const MAX_DRAWIO_CELLS = 10000

export function parseMxCells(xml: string): MxCell[] {
    if (xml.length > MAX_DRAWIO_INPUT_BYTES) {
        throw new Error(`draw.io input exceeds the ${MAX_DRAWIO_INPUT_BYTES}-byte limit`)
    }
    const cells: MxCell[] = []
    // We only ever read the cell's TAG ATTRIBUTES (match[1]); the element body is
    // never used. Match the opening tag alone (`[^>]` bounded, no lazy dot-all),
    // which removes the catastrophic-backtracking risk of scanning for a possibly
    // missing `</mxCell>` on adversarial input.
    const cellRe = /<mxCell\b([^>]*?)\/?>/g
    let match: RegExpExecArray | null
    while ((match = cellRe.exec(xml)) !== null) {
        const tag = match[1]
        const id = attr(tag, 'id')
        if (!id) continue
        if (cells.length >= MAX_DRAWIO_CELLS) {
            throw new Error(`draw.io input exceeds the ${MAX_DRAWIO_CELLS}-cell limit`)
        }
        cells.push({
            id,
            value: attr(tag, 'value'),
            style: attr(tag, 'style'),
            parent: attr(tag, 'parent'),
            vertex: attr(tag, 'vertex') === '1',
            edge: attr(tag, 'edge') === '1',
            source: attr(tag, 'source'),
            target: attr(tag, 'target'),
        })
    }
    return cells
}

/**
 * Keyword → OCD model type map, MOST SPECIFIC FIRST (e.g. "autonomous database"
 * must beat "database"; "internet gateway" must beat "gateway"). Matched against
 * the cell label and the shape style token combined.
 */
const TYPE_MATCHERS: ReadonlyArray<readonly [RegExp, string]> = [
    [/autonomous/, 'autonomous_database'],
    [/\boke\b|kubernetes|container engine/, 'oke_cluster'],
    [/dynamic\s*group/, 'dynamic_group'],
    [/network\s*security\s*group|\bnsg\b/, 'network_security_group'],
    [/security\s*list/, 'security_list'],
    [/route\s*table/, 'route_table'],
    [/internet\s*gateway|\bigw\b/, 'internet_gateway'],
    [/nat\s*gateway|\bnat\b/, 'nat_gateway'],
    [/service\s*gateway|\bsgw\b/, 'service_gateway'],
    [/local\s*peering|\blpg\b/, 'local_peering_gateway'],
    [/dynamic\s*routing|\bdrg\b/, 'drg'],
    [/load\s*balancer|\blbaas\b/, 'load_balancer'],
    [/mysql/, 'mysql_db_system'],
    [/\bdatabase\b|\bdb\s*system\b|\badb\b/, 'db_system'],
    [/object\s*storage|\bbucket\b/, 'bucket'],
    [/file\s*system|\bfss\b/, 'file_system'],
    [/block\s*volume/, 'block_volume'],
    [/\bsubnet\b/, 'subnet'],
    [/virtual\s*cloud\s*network|\bvcn\b/, 'vcn'],
    [/\bcompartment\b/, 'compartment'],
    [/\bpolicy\b/, 'policy'],
    [/\bgroup\b/, 'group'],
    [/compute|\binstance\b|virtual\s*machine|\bvm\b/, 'instance'],
]

/** Resolve a cell to an OCD model resource type, or undefined if unrecognised. */
export function mxCellToOcdType(cell: Pick<MxCell, 'value' | 'style'>): string | undefined {
    const haystack = `${cell.value} ${cell.style}`.toLowerCase()
    for (const [re, type] of TYPE_MATCHERS) {
        if (re.test(haystack)) return type
    }
    return undefined
}

/** OCD model type ('oke_cluster') -> OciModelResources client key ('OciOkeCluster'). */
function clientKeyFor(ocdModelType: string): string {
    return 'Oci' + ocdModelType.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('')
}

/** Create a fully-populated model resource of `type`, or undefined if unknown. */
function newResourceOfType(ocdModelType: string): Record<string, unknown> | undefined {
    const client = (OciModelResources as Record<string, { newResource: (t?: string) => unknown }>)[clientKeyFor(ocdModelType)]
    if (!client || typeof client.newResource !== 'function') return undefined
    return client.newResource(ocdModelType) as Record<string, unknown>
}

/**
 * Build an OCD design from draw.io XML. Throws if the content is a compressed
 * draw.io payload or contains no recognisable OCI resources.
 */
export function buildDesignFromDrawio(xml: string, title = 'Imported draw.io'): DrawioImportResult {
    if (isCompressedDrawio(xml)) {
        throw new Error('This .drawio file is compressed. Re-export it from draw.io as "Editable / Uncompressed XML" and try again.')
    }
    const cells = parseMxCells(xml)
    const vertices = cells.filter((c) => c.vertex)
    const edges = cells.filter((c) => c.edge)

    const design = OcdDesign.newDesign()
    design.model.oci.resources = {}
    design.metadata.title = title
    if (design.view.pages[0]) {
        design.view.pages[0].title = title
        design.view.pages[0].layers = []
        design.view.pages[0].coords = []
        design.view.pages[0].connectors = []
    }

    const counts: Record<string, number> = {}
    const notes: string[] = []
    const topCompartmentIds: string[] = []
    // cellId -> created resource { modelId, type }
    const created = new Map<string, { modelId: string; type: string }>()

    const push = (type: string, resource: Record<string, unknown>): void => {
        if (!Object.hasOwn(design.model.oci.resources, type)) design.model.oci.resources[type] = []
        ;(design.model.oci.resources[type] as Record<string, unknown>[]).push(resource)
        counts[type] = (counts[type] ?? 0) + 1
    }

    // Always provide a root compartment so every resource has a parent layer.
    const root = newResourceOfType('compartment') as Record<string, unknown>
    root.displayName = title
    push('compartment', root)
    const rootId = root.id as string
    topCompartmentIds.push(rootId)

    // Pass 1: compartments (so children can reference them).
    for (const cell of vertices) {
        const type = mxCellToOcdType(cell)
        if (type !== 'compartment') continue
        const resource = newResourceOfType('compartment') as Record<string, unknown>
        if (cell.value) resource.displayName = cell.value
        resource.compartmentId = rootId
        push('compartment', resource)
        created.set(cell.id, { modelId: resource.id as string, type: 'compartment' })
    }

    // Resolve the nearest ancestor compartment model id for a cell (walks parents).
    const compartmentForCell = (cell: MxCell): string => {
        let parentId = cell.parent
        const guard = new Set<string>()
        while (parentId && !guard.has(parentId)) {
            guard.add(parentId)
            const createdParent = created.get(parentId)
            if (createdParent?.type === 'compartment') return createdParent.modelId
            const parentCell = vertices.find((v) => v.id === parentId)
            if (!parentCell) break
            parentId = parentCell.parent
        }
        return rootId
    }

    // Pass 2: every other recognised resource.
    for (const cell of vertices) {
        const type = mxCellToOcdType(cell)
        if (!type || type === 'compartment') continue
        const resource = newResourceOfType(type)
        if (!resource) {
            notes.push(`Skipped "${cell.value || cell.id}": no OCD model type for "${type}".`)
            continue
        }
        if (cell.value) resource.displayName = cell.value
        resource.compartmentId = compartmentForCell(cell)
        push(type, resource)
        created.set(cell.id, { modelId: resource.id as string, type })
    }

    if (created.size === 0) {
        throw new Error('No recognisable OCI resources were found in the draw.io diagram.')
    }

    // Wire relations: explicit edges first, then container nesting (subnet in vcn, …).
    let connections = 0
    const tryConnect = (aCellId: string, bCellId: string): boolean => {
        const a = created.get(aCellId)
        const b = created.get(bCellId)
        if (!a || !b || a.modelId === b.modelId) return false
        // FK direction is unknown in draw.io, so try both ways.
        let result = connectResources(design, a.modelId, b.modelId)
        if (!result.connected) result = connectResources(design, b.modelId, a.modelId)
        if (result.connected) {
            design.model = result.design.model
            connections += 1
            return true
        }
        return false
    }

    for (const e of edges) tryConnect(e.source, e.target)
    // Containment-as-relation: a vertex inside a non-compartment vertex (e.g. a
    // subnet drawn inside a VCN) becomes an FK link too.
    for (const cell of vertices) {
        const child = created.get(cell.id)
        const parent = created.get(cell.parent)
        if (child && parent && parent.type !== 'compartment') tryConnect(cell.id, cell.parent)
    }

    notes.push(`Imported ${created.size} resource(s) and ${connections} relation(s) from the draw.io diagram.`)
    return { design, counts, topCompartmentIds, notes }
}
