/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Realm > Region > Availability Domain > Fault Domain scaffold reconcile.
**
** Builds (and idempotently re-builds) a prebuilt nested-container scaffold on the
** Designer canvas from the persisted Landing Zone wizard config:
**
**     Realm
**       └─ Region
**            ├─ AD-1
**            │    ├─ FD-1
**            │    ├─ FD-2
**            │    └─ FD-3
**            ├─ AD-2 …
**            └─ AD-n …
**
** AD and FD are INFRASTRUCTURE domains, NOT IAM compartments. They are modelled
** here as VIEW-ONLY containers backed by `general.resources.rectangle` resources
** (a pure visual box), never as `OcdCompartment` resources — modelling them as
** compartments would corrupt the IAM hierarchy and the generated Terraform.
**
** Resources keep their existing `availabilityDomain` ('1'|'2'|'3') and
** `faultDomain` ('FAULT-DOMAIN-1..3') string fields; the scaffold visually groups
** them by those values. AD count is region-driven via OcdLzADData.
**
** Idempotency: every scaffold container is matched by its (`scaffold`, `adIndex`,
** `fdIndex`) marker stored under the backing resource's `userDefined`, NOT by the
** resource `id` / `okitReference` (regenerated on every build/clone) nor by
** `displayName` (user-editable). Running `reconcileLzScaffold` twice yields a
** structurally identical design.
**
** Purity: the input design is never mutated. The design is deep-cloned (mirroring
** the OcdResource.cloneResource JSON round-trip) before any change is applied.
*/

import { GeneralModelResources, OcdDesign, OcdViewCoords, OcdViewPage } from '@ocd/model'
import { getAvailabilityDomains } from './OcdLzADData'
import { LandingZoneConfig } from './OcdLzConfig'
import { getLzConfig } from './OcdLzToModel'
import { isLzOriginDesign } from './OcdLzPlacement'
import { cloneDesign } from './OcdLzOverlay'

// ---------------------------------------------------------------------------
// Scaffold marker model (the idempotency key store)
// ---------------------------------------------------------------------------

/** The four scaffold container tiers. */
export type ScaffoldTier = 'realm' | 'region' | 'ad' | 'fd'

/**
 * Marker stamped onto a scaffold container's backing resource under
 * `userDefined`. This is the stable identity used for find-or-create matching.
 */
export interface ScaffoldMarker {
    tier: ScaffoldTier
    /** 1-based Availability Domain index (present for 'ad' and 'fd' tiers). */
    adIndex?: number
    /** 1-based Fault Domain index (present for the 'fd' tier only). */
    fdIndex?: number
}

/** `design.userDefined` is `Record<string, any>`; this is the per-resource key. */
const SCAFFOLD_KEY = 'lzScaffold'

/** View-coord `class` per tier (drives canvas styling; view-only containers). */
const TIER_CLASS: Record<ScaffoldTier, string> = {
    realm: 'ocd-realm',
    region: 'oci-region',
    ad: 'ocd-ad',
    fd: 'ocd-fd',
}

/** General-resource list key the scaffold rectangles live under. */
const RECTANGLE_LIST_KEY = 'rectangle'

// ---------------------------------------------------------------------------
// Geometry (deterministic; relative to parent for nested coords)
// ---------------------------------------------------------------------------

const PADDING = 30
const FD_W = 200
const FD_H = 120
const FD_GAP = 20
const AD_GAP = 40
const TIER_HEADER = 40

// ---------------------------------------------------------------------------
// Pure key / lookup helpers
// ---------------------------------------------------------------------------

/**
 * Stable, human-debuggable string key for a scaffold marker. Identical inputs
 * always yield the same key, which is what makes the reconcile idempotent.
 */
export function scaffoldKey(marker: ScaffoldMarker): string {
    return [marker.tier, marker.adIndex ?? '', marker.fdIndex ?? ''].join(':')
}

/** Read the scaffold marker off a backing resource, or undefined. */
function readMarker(resource: Record<string, unknown>): ScaffoldMarker | undefined {
    const userDefined = resource.userDefined as Record<string, unknown> | undefined
    const marker = userDefined?.[SCAFFOLD_KEY]
    return marker ? (marker as ScaffoldMarker) : undefined
}

/** True when two markers identify the same scaffold container. */
function markersEqual(a: ScaffoldMarker, b: ScaffoldMarker): boolean {
    return scaffoldKey(a) === scaffoldKey(b)
}

/**
 * Find an existing scaffold rectangle resource matching a marker, or undefined.
 * Pure read over `design.model.general.resources.rectangle`.
 */
export function findScaffoldResource(design: OcdDesign, marker: ScaffoldMarker): Record<string, unknown> | undefined {
    const rectangles = (design.model.general?.resources?.[RECTANGLE_LIST_KEY] ?? []) as Record<string, unknown>[]
    return rectangles.find((rectangle) => {
        const existing = readMarker(rectangle)
        return existing ? markersEqual(existing, marker) : false
    })
}

/**
 * Find an existing scaffold view container coord (searching nested coords) whose
 * backing resource matches a marker, or undefined.
 */
export function findScaffoldContainer(design: OcdDesign, marker: ScaffoldMarker): OcdViewCoords | undefined {
    const resource = findScaffoldResource(design, marker)
    if (!resource) return undefined
    const targetId = resource.id as string
    return findCoordsByOcid(design.view.pages[0]?.coords ?? [], targetId)
}

/** Depth-first search for a coord by its `ocid` (model resource id). */
function findCoordsByOcid(coords: OcdViewCoords[], ocid: string): OcdViewCoords | undefined {
    for (const coord of coords) {
        if (coord.ocid === ocid) return coord
        const child = findCoordsByOcid(coord.coords ?? [], ocid)
        if (child) return child
    }
    return undefined
}

// ---------------------------------------------------------------------------
// Immutable helpers
// ---------------------------------------------------------------------------

/** A label for a scaffold tier (display only; never used for matching). */
function tierLabel(config: LandingZoneConfig, marker: ScaffoldMarker): string {
    switch (marker.tier) {
        case 'realm':
            return `Realm: ${config.realm}`
        case 'region':
            return `Region: ${config.region}`
        case 'ad':
            return `AD-${marker.adIndex}`
        case 'fd':
            return `FD-${marker.fdIndex}`
    }
}

/**
 * Find-or-create the backing rectangle resource for a marker. When it already
 * exists its marker/display fields are refreshed in place (the design here is a
 * mutable clone). Returns the resource id (stable across this reconcile run).
 */
function upsertScaffoldResource(design: OcdDesign, config: LandingZoneConfig, marker: ScaffoldMarker): string {
    if (!design.model.general) design.model.general = { vars: [], resources: {} }
    if (!Array.isArray(design.model.general.resources[RECTANGLE_LIST_KEY])) {
        design.model.general.resources[RECTANGLE_LIST_KEY] = []
    }
    const rectangles = design.model.general.resources[RECTANGLE_LIST_KEY] as Record<string, unknown>[]

    const existing = rectangles.find((rectangle) => {
        const existingMarker = readMarker(rectangle)
        return existingMarker ? markersEqual(existingMarker, marker) : false
    })

    if (existing) {
        // Keep the marker authoritative; refresh the (display-only) label.
        existing.displayName = tierLabel(config, marker)
        const userDefined = (existing.userDefined as Record<string, unknown>) ?? {}
        userDefined[SCAFFOLD_KEY] = marker
        existing.userDefined = userDefined
        return existing.id as string
    }

    const resource = GeneralModelResources.GeneralRectangle.newResource('rectangle') as unknown as Record<string, unknown>
    resource.displayName = tierLabel(config, marker)
    resource.userDefined = { [SCAFFOLD_KEY]: marker }
    rectangles.push(resource)
    return resource.id as string
}

/**
 * Find-or-create the view container coord for a scaffold resource. Existing
 * coords are reused (idempotent); a new coord is built with `container:true` and
 * nested under its parent via pgid/pocid/coords[].
 */
function upsertScaffoldCoord(
    page: OcdViewPage,
    marker: ScaffoldMarker,
    ocid: string,
    parent: OcdViewCoords | undefined,
    geometry: { x: number; y: number; w: number; h: number },
    label: string,
): OcdViewCoords {
    const siblings = parent ? (parent.coords ??= []) : page.coords
    const existing = siblings.find((coord) => coord.ocid === ocid)
    if (existing) {
        existing.x = geometry.x
        existing.y = geometry.y
        existing.w = geometry.w
        existing.h = geometry.h
        existing.title = label
        existing.class = TIER_CLASS[marker.tier]
        existing.container = true
        return existing
    }

    const coord: OcdViewCoords = {
        id: `gid-${ocid}`,
        pgid: parent ? parent.id : '',
        ocid,
        pocid: parent ? parent.ocid : '',
        x: geometry.x,
        y: geometry.y,
        w: geometry.w,
        h: geometry.h,
        title: label,
        class: TIER_CLASS[marker.tier],
        showParentConnection: false,
        showConnections: false,
        container: true,
        coords: [],
    }
    siblings.push(coord)
    return coord
}

// ---------------------------------------------------------------------------
// Resource placement
// ---------------------------------------------------------------------------

/** True when a resource carries a usable availability domain token. */
function adTokenOf(resource: Record<string, unknown>): string | undefined {
    const token = resource.availabilityDomain
    return typeof token === 'string' && token.length > 0 ? token : undefined
}

/** True when a resource carries a usable fault domain token. */
function fdTokenOf(resource: Record<string, unknown>): string | undefined {
    const token = resource.faultDomain
    return typeof token === 'string' && token.length > 0 ? token : undefined
}

// ---------------------------------------------------------------------------
// Reconcile (public, pure, immutable)
// ---------------------------------------------------------------------------

/**
 * Idempotently reconcile the Realm > Region > AD > FD scaffold of an LZ-origin
 * design against its persisted wizard config.
 *
 * - Returns the design UNCHANGED (same reference) when it is not LZ-origin or has
 *   no persisted config.
 * - Otherwise returns a NEW design (the input is never mutated) with the scaffold
 *   containers upserted and AD/FD/region-scoped resources visually grouped under
 *   the matching container.
 * - Running it twice yields a structurally identical design.
 */
export function reconcileLzScaffold(design: OcdDesign): OcdDesign {
    const config = getLzConfig(design)
    if (!config || !isLzOriginDesign(design)) return design
    return buildScaffold(design, config)
}

/**
 * Add the Realm > Region > AD > FD frames to ANY design (not just LZ-origin),
 * with an explicit region/realm. Idempotent like the reconcile (re-apply is a
 * no-op). Powers the designer 'Add Frames' action.
 */
export function addRealmAdFdFrames(design: OcdDesign, region = 'us-ashburn-1', realm = 'oc1'): OcdDesign {
    const config: LandingZoneConfig = {
        region,
        regionShortName: region.slice(0, 3),
        realm,
        hubKind: 'hub_a',
        hubVcn: '',
        environments: [],
    }
    return buildScaffold(design, config)
}

function buildScaffold(design: OcdDesign, config: LandingZoneConfig): OcdDesign {
    const next = cloneDesign(design)
    const page = next.view.pages[0]
    if (!page) return design
    if (!Array.isArray(page.coords)) page.coords = []

    const availabilityDomains = getAvailabilityDomains(config.region)

    // --- Realm container ---
    const realmMarker: ScaffoldMarker = { tier: 'realm' }
    const realmId = upsertScaffoldResource(next, config, realmMarker)
    const realmHeight = TIER_HEADER * 2 + availabilityDomains.length * (FD_H + TIER_HEADER + AD_GAP) + PADDING
    const realmWidth = PADDING * 4 + 3 * (FD_W + FD_GAP) + TIER_HEADER * 2
    const realmCoord = upsertScaffoldCoord(
        page,
        realmMarker,
        realmId,
        undefined,
        { x: PADDING, y: PADDING, w: realmWidth, h: realmHeight },
        tierLabel(config, realmMarker),
    )

    // --- Region container (single region per config) ---
    const regionMarker: ScaffoldMarker = { tier: 'region' }
    const regionId = upsertScaffoldResource(next, config, regionMarker)
    const regionCoord = upsertScaffoldCoord(
        page,
        regionMarker,
        regionId,
        realmCoord,
        { x: PADDING, y: TIER_HEADER, w: realmWidth - PADDING * 2, h: realmHeight - TIER_HEADER - PADDING },
        tierLabel(config, regionMarker),
    )

    // Index of FD coord by (adIndex, fdToken) so resources can be re-parented.
    const fdCoordByKey = new Map<string, OcdViewCoords>()
    const adCoordByToken = new Map<string, OcdViewCoords>()

    availabilityDomains.forEach((ad, adPos) => {
        const adMarker: ScaffoldMarker = { tier: 'ad', adIndex: ad.index }
        const adResourceId = upsertScaffoldResource(next, config, adMarker)
        const adY = TIER_HEADER + adPos * (FD_H + TIER_HEADER + AD_GAP)
        const adWidth = PADDING + 3 * (FD_W + FD_GAP)
        const adHeight = TIER_HEADER + FD_H + PADDING
        const adCoord = upsertScaffoldCoord(
            page,
            adMarker,
            adResourceId,
            regionCoord,
            { x: PADDING, y: adY, w: adWidth, h: adHeight },
            tierLabel(config, adMarker),
        )
        adCoordByToken.set(ad.token, adCoord)

        ad.faultDomains.forEach((fd, fdPos) => {
            const fdMarker: ScaffoldMarker = { tier: 'fd', adIndex: ad.index, fdIndex: fd.index }
            const fdResourceId = upsertScaffoldResource(next, config, fdMarker)
            const fdX = PADDING + fdPos * (FD_W + FD_GAP)
            const fdCoord = upsertScaffoldCoord(
                page,
                fdMarker,
                fdResourceId,
                adCoord,
                { x: fdX, y: TIER_HEADER, w: FD_W, h: FD_H },
                tierLabel(config, fdMarker),
            )
            fdCoordByKey.set(`${ad.token}:${fd.token}`, fdCoord)
        })
    })

    placeScopedResources(next, page, regionCoord, adCoordByToken, fdCoordByKey)

    return next
}

/**
 * Re-parent existing model-resource coords under the matching scaffold container
 * by their availabilityDomain / faultDomain tokens. Resources the user manually
 * locked (`editLocked === true`) are left where they are.
 */
function placeScopedResources(
    design: OcdDesign,
    page: OcdViewPage,
    regionCoord: OcdViewCoords,
    adCoordByToken: Map<string, OcdViewCoords>,
    fdCoordByKey: Map<string, OcdViewCoords>,
): void {
    // Resource id -> (adToken, fdToken) lookup across every OCI model resource.
    const ociResources = (design.model.oci?.resources ?? {}) as Record<string, Record<string, unknown>[]>
    const scopeById = new Map<string, { ad?: string; fd?: string; locked: boolean }>()
    for (const list of Object.values(ociResources)) {
        if (!Array.isArray(list)) continue
        for (const resource of list) {
            const id = resource.id as string | undefined
            if (!id) continue
            scopeById.set(id, {
                ad: adTokenOf(resource),
                fd: fdTokenOf(resource),
                locked: resource.editLocked === true,
            })
        }
    }

    // Collect every existing coord that maps to a scoped, non-scaffold resource.
    const allCoords = flattenCoords(page.coords)
    for (const coord of allCoords) {
        const scope = scopeById.get(coord.ocid)
        if (!scope || scope.locked) continue

        let target: OcdViewCoords | undefined
        if (scope.ad && scope.fd) target = fdCoordByKey.get(`${scope.ad}:${scope.fd}`)
        if (!target && scope.ad) target = adCoordByToken.get(scope.ad)
        if (!target) target = regionCoord
        if (!target || target.id === coord.pgid) continue

        reparentCoord(page, coord, target)
    }
}

/** Flatten a coords tree into a single array (parents before children). */
function flattenCoords(coords: OcdViewCoords[]): OcdViewCoords[] {
    return coords.reduce<OcdViewCoords[]>((acc, coord) => [...acc, coord, ...flattenCoords(coord.coords ?? [])], [])
}

/** Detach a coord from its current parent and nest it under `target`. */
function reparentCoord(page: OcdViewPage, coord: OcdViewCoords, target: OcdViewCoords): void {
    // Remove from old location (top-level or nested).
    page.coords = page.coords.filter((c) => c !== coord)
    removeFromTree(page.coords, coord)
    // Attach under the target container.
    coord.pgid = target.id
    coord.pocid = target.ocid
    target.coords ??= []
    if (!target.coords.includes(coord)) target.coords.push(coord)
}

/** Recursively remove a coord from every `coords[]` array in the tree. */
function removeFromTree(coords: OcdViewCoords[], target: OcdViewCoords): void {
    for (const coord of coords) {
        if (coord.coords) {
            coord.coords = coord.coords.filter((c) => c !== target)
            removeFromTree(coord.coords, target)
        }
    }
}
