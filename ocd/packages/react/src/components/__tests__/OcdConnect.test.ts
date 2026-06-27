/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { describe, expect, it } from 'vitest'
import { OcdDesign, OciModelResources } from '@ocd/model'
import { canConnectResources, connectResources, resolveConnectionField, toCamel } from '../OcdConnect'

/** Minimal design with a VCN, subnet, route table, and security list. */
function makeDesign(): { design: OcdDesign; ids: Record<string, string> } {
    const design = OcdDesign.newDesign()
    const vcn = OciModelResources.OciVcn.newResource('vcn') as unknown as Record<string, unknown>
    const subnet = OciModelResources.OciSubnet.newResource('subnet') as unknown as Record<string, unknown>
    const routeTable = OciModelResources.OciRouteTable.newResource('route_table') as unknown as Record<string, unknown>
    const securityList = OciModelResources.OciSecurityList.newResource('security_list') as unknown as Record<string, unknown>
    design.model.oci.resources.vcn = [vcn]
    design.model.oci.resources.subnet = [subnet]
    design.model.oci.resources.route_table = [routeTable]
    design.model.oci.resources.security_list = [securityList]
    return {
        design,
        ids: {
            vcn: vcn.id as string,
            subnet: subnet.id as string,
            route_table: routeTable.id as string,
            security_list: securityList.id as string,
        },
    }
}

describe('OcdConnect', () => {
    it('toCamel converts snake_case to camelCase', () => {
        expect(toCamel('route_table')).toBe('routeTable')
        expect(toCamel('vcn')).toBe('vcn')
        expect(toCamel('security_list')).toBe('securityList')
    })

    it('resolves the scalar FK field for a target type', () => {
        const { design } = makeDesign()
        const subnet = design.model.oci.resources.subnet[0] as unknown as Record<string, unknown>
        expect(resolveConnectionField(subnet, 'vcn')).toEqual({ field: 'vcnId', multi: false })
        expect(resolveConnectionField(subnet, 'route_table')).toEqual({ field: 'routeTableId', multi: false })
    })

    it('resolves an array FK field (Ids) when only the plural exists', () => {
        const { design } = makeDesign()
        const subnet = design.model.oci.resources.subnet[0] as unknown as Record<string, unknown>
        expect(resolveConnectionField(subnet, 'security_list')).toEqual({ field: 'securityListIds', multi: true })
    })

    it('connects subnet -> vcn by setting vcnId', () => {
        const { design, ids } = makeDesign()
        const result = connectResources(design, ids.subnet, ids.vcn)
        expect(result.connected).toBe(true)
        expect(result.field).toBe('vcnId')
        expect(result.design.model.oci.resources.subnet[0].vcnId).toBe(ids.vcn)
    })

    it('connects subnet -> security_list by appending to securityListIds (no dup on re-connect)', () => {
        const { design, ids } = makeDesign()
        const once = connectResources(design, ids.subnet, ids.security_list)
        const twice = connectResources(once.design, ids.subnet, ids.security_list)
        expect(twice.design.model.oci.resources.subnet[0].securityListIds).toEqual([ids.security_list])
    })

    it('refuses to connect a resource to itself', () => {
        const { design, ids } = makeDesign()
        const result = connectResources(design, ids.subnet, ids.subnet)
        expect(result.connected).toBe(false)
        expect(result.design).toBe(design)
    })

    it('reports not-connected when the source has no FK for the target type', () => {
        const { design, ids } = makeDesign()
        // A VCN has no subnetId/route_tableId — connecting vcn -> subnet is invalid.
        const result = connectResources(design, ids.vcn, ids.subnet)
        expect(result.connected).toBe(false)
        expect(result.design).toBe(design)
    })

    it('does not mutate the input design', () => {
        const { design, ids } = makeDesign()
        const before = JSON.stringify(design)
        connectResources(design, ids.subnet, ids.vcn)
        expect(JSON.stringify(design)).toBe(before)
    })

    // --- canConnectResources (drop-target validity predicate) ---
    it('canConnectResources is true for a valid source -> target (subnet -> vcn)', () => {
        const { design, ids } = makeDesign()
        expect(canConnectResources(design, ids.subnet, ids.vcn)).toBe(true)
        expect(canConnectResources(design, ids.subnet, ids.route_table)).toBe(true)
    })

    it('canConnectResources is false for an incompatible direction (vcn -> subnet)', () => {
        const { design, ids } = makeDesign()
        expect(canConnectResources(design, ids.vcn, ids.subnet)).toBe(false)
    })

    it('canConnectResources is false for self / missing ids', () => {
        const { design, ids } = makeDesign()
        expect(canConnectResources(design, ids.subnet, ids.subnet)).toBe(false)
        expect(canConnectResources(design, ids.subnet, 'does-not-exist')).toBe(false)
        expect(canConnectResources(design, '', ids.vcn)).toBe(false)
    })

    it('canConnectResources does not mutate the design', () => {
        const { design, ids } = makeDesign()
        const before = JSON.stringify(design)
        canConnectResources(design, ids.subnet, ids.vcn)
        expect(JSON.stringify(design)).toBe(before)
    })
})
