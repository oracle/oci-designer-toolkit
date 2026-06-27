/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { describe, expect, it } from 'vitest'
import { OcdDesign, OcdViewCoords } from '@ocd/model'
import { LandingZoneConfig } from '../OcdLzConfig'
import { buildOcdDesignFromLz, LZ_CONFIG_KEY } from '../OcdLzToModel'
import {
    findScaffoldContainer,
    reconcileLzScaffold,
    addRealmAdFdFrames,
    scaffoldKey,
    ScaffoldMarker,
} from '../OcdLzScaffold'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeConfig(region: string): LandingZoneConfig {
    return {
        region,
        regionShortName: region.slice(0, 3),
        realm: 'oc1',
        hubKind: 'hub_a',
        hubVcn: '10.100.0.0/21',
        environments: [{ name: 'prod', securityZone: true, spokeVcn: '10.0.64.0/21', projects: ['proj1'], platforms: [] }],
    }
}

/** An LZ-origin design (multi-AD region eu-frankfurt-1 => 3 ADs) with config. */
function makeLzDesign(region = 'eu-frankfurt-1'): OcdDesign {
    return buildOcdDesignFromLz([], 'Landing Zone', makeConfig(region)).design
}

/** Count scaffold rectangles by tier via the backing-resource markers. */
function countByTier(design: OcdDesign): Record<string, number> {
    const rectangles = (design.model.general?.resources?.rectangle ?? []) as Record<string, unknown>[]
    const counts: Record<string, number> = {}
    for (const rectangle of rectangles) {
        const marker = (rectangle.userDefined as Record<string, unknown> | undefined)?.lzScaffold as ScaffoldMarker | undefined
        if (marker) counts[marker.tier] = (counts[marker.tier] ?? 0) + 1
    }
    return counts
}

/** Add an OCI resource with its own coord, returning {resource, coord}. */
function addOciResource(
    design: OcdDesign,
    listKey: string,
    fields: Record<string, unknown>,
): { id: string; coord: OcdViewCoords } {
    const id = `ocid-${listKey}-${Object.keys(fields).join('-')}-${Math.random().toString(36).slice(2)}`
    const resource = { id, provider: 'oci', editLocked: false, ...fields }
    const list = (design.model.oci.resources[listKey] ??= [])
    list.push(resource)
    const coord: OcdViewCoords = {
        id: `gid-${id}`,
        pgid: '',
        ocid: id,
        pocid: '',
        x: 0,
        y: 0,
        w: 100,
        h: 100,
        title: '',
        class: 'oci-instance',
        showParentConnection: true,
        showConnections: true,
    }
    design.view.pages[0].coords.push(coord)
    return { id, coord }
}

/** Depth-first lookup of a coord by its ocid. */
function findCoord(coords: OcdViewCoords[], ocid: string): OcdViewCoords | undefined {
    for (const coord of coords) {
        if (coord.ocid === ocid) return coord
        const child = findCoord(coord.coords ?? [], ocid)
        if (child) return child
    }
    return undefined
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('OcdLzScaffold — container scaffolding', () => {
    it('builds 1 realm, 1 region, 3 ADs, 9 FDs for a 3-AD region', () => {
        const design = reconcileLzScaffold(makeLzDesign('eu-frankfurt-1'))
        const counts = countByTier(design)

        expect(counts.realm).toBe(1)
        expect(counts.region).toBe(1)
        expect(counts.ad).toBe(3)
        expect(counts.fd).toBe(9)
    })

    it('builds 1 realm, 1 region, 1 AD, 3 FDs for a single-AD region', () => {
        const design = reconcileLzScaffold(makeLzDesign('me-jeddah-1'))
        const counts = countByTier(design)

        expect(counts.realm).toBe(1)
        expect(counts.region).toBe(1)
        expect(counts.ad).toBe(1)
        expect(counts.fd).toBe(3)
    })

    it('nests Realm > Region > AD > FD as view containers', () => {
        const design = reconcileLzScaffold(makeLzDesign('eu-frankfurt-1'))

        const realm = findScaffoldContainer(design, { tier: 'realm' })
        const region = findScaffoldContainer(design, { tier: 'region' })
        const ad1 = findScaffoldContainer(design, { tier: 'ad', adIndex: 1 })
        const fd1 = findScaffoldContainer(design, { tier: 'fd', adIndex: 1, fdIndex: 1 })

        expect(realm?.container).toBe(true)
        expect(region?.pgid).toBe(realm?.id)
        expect(ad1?.pgid).toBe(region?.id)
        expect(fd1?.pgid).toBe(ad1?.id)
    })
})

describe('OcdLzScaffold — resource placement', () => {
    it('places a resource under the FD container matching its faultDomain', () => {
        const base = makeLzDesign('eu-frankfurt-1')
        const { id } = addOciResource(base, 'instance', { availabilityDomain: '2', faultDomain: 'FAULT-DOMAIN-3' })

        const design = reconcileLzScaffold(base)
        const fd = findScaffoldContainer(design, { tier: 'fd', adIndex: 2, fdIndex: 3 })
        const placed = findCoord(fd?.coords ?? [], id)

        expect(placed).toBeDefined()
        expect(placed?.pgid).toBe(fd?.id)
    })

    it('places an AD-only (no FD) resource under the AD container', () => {
        const base = makeLzDesign('eu-frankfurt-1')
        const { id } = addOciResource(base, 'file_system', { availabilityDomain: '1' })

        const design = reconcileLzScaffold(base)
        const ad = findScaffoldContainer(design, { tier: 'ad', adIndex: 1 })
        const placed = findCoord(ad?.coords ?? [], id)

        expect(placed).toBeDefined()
        expect(placed?.pgid).toBe(ad?.id)
    })

    it('places a regional (no AD/FD) resource under the region container', () => {
        const base = makeLzDesign('eu-frankfurt-1')
        const { id } = addOciResource(base, 'vcn', {})

        const design = reconcileLzScaffold(base)
        const region = findScaffoldContainer(design, { tier: 'region' })
        const placed = findCoord(region?.coords ?? [], id)

        expect(placed).toBeDefined()
        expect(placed?.pgid).toBe(region?.id)
    })

    it('does not move a resource the user locked (editLocked)', () => {
        const base = makeLzDesign('eu-frankfurt-1')
        const { id, coord } = addOciResource(base, 'instance', {
            availabilityDomain: '1',
            faultDomain: 'FAULT-DOMAIN-1',
            editLocked: true,
        })
        const originalPgid = coord.pgid

        const design = reconcileLzScaffold(base)
        const placed = findCoord(design.view.pages[0].coords, id)
        const fd = findScaffoldContainer(design, { tier: 'fd', adIndex: 1, fdIndex: 1 })

        expect(placed?.pgid).toBe(originalPgid)
        expect(findCoord(fd?.coords ?? [], id)).toBeUndefined()
    })
})

describe('OcdLzScaffold — idempotency and purity', () => {
    it('reconciling twice yields a structurally identical design', () => {
        const once = reconcileLzScaffold(makeLzDesign('eu-frankfurt-1'))
        const twice = reconcileLzScaffold(once)

        expect(twice).toEqual(once)
    })

    it('does not duplicate scaffold containers on re-apply', () => {
        const once = reconcileLzScaffold(makeLzDesign('eu-frankfurt-1'))
        const twice = reconcileLzScaffold(once)

        expect(countByTier(twice)).toEqual(countByTier(once))
        expect(countByTier(twice).fd).toBe(9)
    })

    it('does not mutate the input design (immutable)', () => {
        const input = makeLzDesign('eu-frankfurt-1')
        const before = JSON.stringify(input)

        reconcileLzScaffold(input)

        expect(JSON.stringify(input)).toBe(before)
    })

    it('returns the same reference unchanged for a non-LZ design', () => {
        const plain = OcdDesign.newDesign()
        const result = reconcileLzScaffold(plain)

        expect(result).toBe(plain)
    })

    it('returns the design unchanged when LZ-origin but no config persisted', () => {
        const design = makeLzDesign('eu-frankfurt-1')
        delete design.userDefined[LZ_CONFIG_KEY]

        expect(reconcileLzScaffold(design)).toBe(design)
    })

    it('addRealmAdFdFrames builds frames on ANY design (no LZ origin needed)', () => {
        const plain = OcdDesign.newDesign()
        const result = addRealmAdFdFrames(plain, 'us-ashburn-1') // 3-AD region

        const counts = countByTier(result)
        expect(counts.realm).toBe(1)
        expect(counts.region).toBe(1)
        expect(counts.ad).toBe(3)
        expect(counts.fd).toBe(9)
        // Idempotent: re-applying yields the same structure.
        expect(JSON.stringify(addRealmAdFdFrames(result, 'us-ashburn-1'))).toBe(JSON.stringify(result))
    })
})

describe('OcdLzScaffold — scaffoldKey', () => {
    it('produces stable, distinct keys per marker identity', () => {
        const a: ScaffoldMarker = { tier: 'fd', adIndex: 2, fdIndex: 3 }
        const b: ScaffoldMarker = { tier: 'fd', adIndex: 2, fdIndex: 3 }
        const c: ScaffoldMarker = { tier: 'fd', adIndex: 1, fdIndex: 3 }

        expect(scaffoldKey(a)).toBe(scaffoldKey(b))
        expect(scaffoldKey(a)).not.toBe(scaffoldKey(c))
    })
})
