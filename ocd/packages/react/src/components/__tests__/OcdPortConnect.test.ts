/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Unit tests for the hover-port connect ACTION layer (no DOM). These exercise the
** pure helpers that back the always-available drag-to-connect UX in OcdCanvas /
** OcdResourceSvg: beginPortConnect (start a drag from a source resource) and
** completePortConnect (wire source -> target on release, delegating the FK write
** to connectResources). The DOM drag plumbing is intentionally thin and not
** covered here.
*/

import { describe, expect, it } from 'vitest'
import { OcdDesign, OciModelResources } from '@ocd/model'
import {
    beginPortConnect,
    completePortConnect,
    idlePortConnect,
} from '../OcdConnect'

/** Minimal design with a VCN, subnet, and route table (mirrors OcdConnect.test). */
function makeDesign(): { design: OcdDesign; ids: Record<string, string> } {
    const design = OcdDesign.newDesign()
    const vcn = OciModelResources.OciVcn.newResource('vcn') as unknown as Record<string, unknown>
    const subnet = OciModelResources.OciSubnet.newResource('subnet') as unknown as Record<string, unknown>
    const routeTable = OciModelResources.OciRouteTable.newResource('route_table') as unknown as Record<string, unknown>
    design.model.oci.resources.vcn = [vcn]
    design.model.oci.resources.subnet = [subnet]
    design.model.oci.resources.route_table = [routeTable]
    return {
        design,
        ids: {
            vcn: vcn.id as string,
            subnet: subnet.id as string,
            route_table: routeTable.id as string,
        },
    }
}

describe('OcdPortConnect', () => {
    it('idlePortConnect is inactive with no source', () => {
        const state = idlePortConnect()
        expect(state.active).toBe(false)
        expect(state.sourceModelId).toBe('')
        expect(state.sourceCoordsId).toBe('')
    })

    it('beginPortConnect activates with the source coords/model ids', () => {
        const state = beginPortConnect({ id: 'coords-1', ocid: 'model-1' })
        expect(state.active).toBe(true)
        expect(state.sourceModelId).toBe('model-1')
        expect(state.sourceCoordsId).toBe('coords-1')
    })

    it('completePortConnect wires a valid source -> target via connectResources', () => {
        const { design, ids } = makeDesign()
        const state = beginPortConnect({ id: 'subnet-coords', ocid: ids.subnet })
        const result = completePortConnect(design, state, ids.vcn)
        expect(result.connected).toBe(true)
        expect(result.field).toBe('vcnId')
        // The source subnet now references the target VCN by FK.
        expect(result.design.model.oci.resources.subnet[0].vcnId).toBe(ids.vcn)
        // Original design is untouched (immutable connect).
        expect(design.model.oci.resources.subnet[0].vcnId).not.toBe(ids.vcn)
    })

    it('completePortConnect leaves the design unchanged for an incompatible pair', () => {
        const { design, ids } = makeDesign()
        // A VCN has no subnetId — connecting vcn -> subnet is invalid.
        const state = beginPortConnect({ id: 'vcn-coords', ocid: ids.vcn })
        const result = completePortConnect(design, state, ids.subnet)
        expect(result.connected).toBe(false)
        expect(result.design).toBe(design)
    })

    it('completePortConnect cancels cleanly with no target (release over empty space)', () => {
        const { design, ids } = makeDesign()
        const state = beginPortConnect({ id: 'subnet-coords', ocid: ids.subnet })
        const result = completePortConnect(design, state, undefined)
        expect(result.connected).toBe(false)
        expect(result.design).toBe(design)
    })

    it('completePortConnect is a no-op when the drag is inactive', () => {
        const { design, ids } = makeDesign()
        const result = completePortConnect(design, idlePortConnect(), ids.vcn)
        expect(result.connected).toBe(false)
        expect(result.design).toBe(design)
    })
})
