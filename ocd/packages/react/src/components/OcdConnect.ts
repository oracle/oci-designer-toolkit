/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Drag-to-connect helper. OCI resource associations are derived from foreign-key
** fields (e.g. a Subnet's `vcnId` / `routeTableId`). "Connecting" entity A to
** entity B therefore means setting the FK field on A that references B's type —
** the association line then renders automatically (coords default
** `showConnections = true`).
**
** Pure: connectResources returns a NEW design; the input is not mutated. The
** field resolver is the only domain logic — it maps a target resource type
** (snake_case, e.g. 'route_table') to the camelCase FK field on the source
** ('routeTableId' scalar, or 'routeTableIds' array).
*/

import { OcdDesign } from '@ocd/model'

/** snake_case -> camelCase ('route_table' -> 'routeTable'). */
export function toCamel(snake: string): string {
    return snake.replace(/_([a-z])/g, (_m, c: string) => c.toUpperCase())
}

interface ConnectionField {
    field: string
    multi: boolean
}

/**
 * Resolve the FK field on `source` that references a resource of `targetType`.
 * Prefers a scalar `<camelTarget>Id`, then an array `<camelTarget>Ids`. Returns
 * undefined when the source has no field for that target type.
 */
export function resolveConnectionField(source: Record<string, unknown>, targetType: string): ConnectionField | undefined {
    const camel = toCamel(targetType)
    const scalar = `${camel}Id`
    const multi = `${camel}Ids`
    if (scalar in source) return { field: scalar, multi: false }
    if (multi in source) return { field: multi, multi: true }
    return undefined
}

function findResource(design: OcdDesign, modelId: string): { resource: Record<string, unknown>; type: string } | undefined {
    const providers = ['oci', 'azure', 'google'] as const
    for (const provider of providers) {
        const resources = (design.model?.[provider]?.resources ?? {}) as Record<string, Record<string, unknown>[]>
        for (const [type, list] of Object.entries(resources)) {
            if (!Array.isArray(list)) continue
            const resource = list.find((r) => r.id === modelId)
            if (resource) return { resource, type }
        }
    }
    return undefined
}

export interface ConnectResult {
    design: OcdDesign
    connected: boolean
    field?: string
    /** Reason a connection could not be made (when connected is false). */
    reason?: string
}

/**
 * Read-only predicate: would connecting `source` -> `target` succeed?
 *
 * True when source and target are distinct existing resources and the source has
 * an FK field referencing the target's type. Used for the draw.io-style live
 * drop-target highlight during a connect drag (no clone, no mutation).
 */
export function canConnectResources(design: OcdDesign, sourceModelId: string, targetModelId: string): boolean {
    if (!sourceModelId || !targetModelId || sourceModelId === targetModelId) return false
    const source = findResource(design, sourceModelId)
    const target = findResource(design, targetModelId)
    if (!source || !target) return false
    return resolveConnectionField(source.resource, target.type) !== undefined
}

/**
 * Connect source -> target by setting the source's FK field for the target's
 * type. Pure (clones the design). Returns connected=false (and the original
 * design) when no FK field exists for that target type, or on self-connect.
 */
export function connectResources(design: OcdDesign, sourceModelId: string, targetModelId: string): ConnectResult {
    if (sourceModelId === targetModelId) {
        return { design, connected: false, reason: 'Cannot connect a resource to itself.' }
    }
    const next = JSON.parse(JSON.stringify(design)) as OcdDesign
    const source = findResource(next, sourceModelId)
    const target = findResource(next, targetModelId)
    if (!source || !target) {
        return { design, connected: false, reason: 'Source or target resource not found.' }
    }
    const connection = resolveConnectionField(source.resource, target.type)
    if (!connection) {
        return { design, connected: false, reason: `No connection: a ${source.type} has no ${toCamel(target.type)}Id field.` }
    }
    if (connection.multi) {
        const current = Array.isArray(source.resource[connection.field]) ? (source.resource[connection.field] as string[]) : []
        if (!current.includes(targetModelId)) current.push(targetModelId)
        source.resource[connection.field] = current
    } else {
        source.resource[connection.field] = targetModelId
    }
    return { design: next, connected: true, field: connection.field }
}

/*
** Hover-port connect (always-available drag-to-connect).
**
** These pure helpers model the lifecycle of a connection drag that starts from a
** resource's hover "port" (no connect-mode toggle required). The UI in OcdCanvas
** holds a PortConnectState and the transient cursor points; the logic that
** decides whether a release wires an association lives here so it can be unit
** tested without a DOM. The actual FK write reuses connectResources above — the
** authoritative connect action — so semantics never diverge from the toggle path.
*/

export interface PortConnectState {
    /** A port-connect drag is in progress. */
    active: boolean
    /** modelId (ocid) of the resource the drag started from. */
    sourceModelId: string
    /** coords id of the source (used for the source-side anchor / self-guard). */
    sourceCoordsId: string
}

/** Idle (no port connection in progress). */
export const idlePortConnect = (): PortConnectState => ({ active: false, sourceModelId: '', sourceCoordsId: '' })

/** Begin a port connect from a source resource's coords. Pure: returns new state. */
export function beginPortConnect(source: { id: string; ocid: string }): PortConnectState {
    return { active: true, sourceModelId: source.ocid, sourceCoordsId: source.id }
}

/**
 * Complete a port connect by wiring source -> target. Delegates to
 * connectResources (the FK write). Returns connected=false with the original
 * design when the drag is inactive, there is no target (released over empty
 * space), or the pair is incompatible / self.
 */
export function completePortConnect(design: OcdDesign, state: PortConnectState, targetModelId?: string): ConnectResult {
    if (!state.active || !state.sourceModelId || !targetModelId) {
        return { design, connected: false, reason: 'No active port connection or drop target.' }
    }
    return connectResources(design, state.sourceModelId, targetModelId)
}
