/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/**
 * Regression test for OCD issue #250:
 *   Cutting/pasting (cloning) a Subnet that contains a DB System used to create
 *   an empty cloned Subnet plus an orphaned DB System copy that was either not
 *   cloned at all or still referenced the ORIGINAL Subnet ocid.
 *
 * OcdDocument.cloneResourceTree now deep-clones the coords sub-tree AND each
 * backing model resource, re-parenting nested children onto the freshly cloned
 * parent.
 *
 * NOTE: vitest is NOT yet installed in packages/react. This file is provided
 * ready-to-run for when a test runner is added. It is import-compatible with
 * vitest (and Jest via the same `describe/it/expect` globals).
 */

import { describe, it, expect } from 'vitest'
import { OcdDocument } from '../OcdDocument'
import { OcdDesign, OciModelResources } from '@ocd/model'

// Helper: build a design containing one VCN -> Subnet -> DB System, wired both
// in the model (resource lists) and in the view (nested coords tree).
function buildDesignWithSubnetAndDbSystem(): OcdDocument {
    const ocdDocument = OcdDocument.new()
    const design: OcdDesign = ocdDocument.design

    // --- Model resources ---
    const compartmentId = design.model.oci.resources.compartment?.[0]?.id ?? 'okit.compartment.root'

    // @ts-ignore - dynamic namespace lookup mirrors OcdDocument.addOciResource
    const subnet = OciModelResources.OciSubnet.newResource('subnet')
    subnet.compartmentId = compartmentId
    // @ts-ignore
    const dbSystem = OciModelResources.OciDbSystem.newResource('db_system')
    dbSystem.compartmentId = compartmentId
    dbSystem.subnetId = subnet.id // DB System parented to the Subnet

    design.model.oci.resources.subnet = [subnet]
    design.model.oci.resources.db_system = [dbSystem]

    // --- View coords (nested: subnet contains db system) ---
    const page = ocdDocument.getActivePage()
    const dbCoords: any = {
        ...OcdDesign.newCoords(),
        id: 'gid-db',
        ocid: dbSystem.id,
        pgid: 'gid-subnet',
        pocid: subnet.id,
        x: 20, y: 20, w: 40, h: 40,
        title: dbSystem.resourceTypeName,
        class: 'oci-db-system',
    }
    const subnetCoords: any = {
        ...OcdDesign.newCoords(),
        id: 'gid-subnet',
        ocid: subnet.id,
        pgid: '',
        pocid: '',
        x: 100, y: 100, w: 400, h: 300,
        title: subnet.resourceTypeName,
        class: 'oci-subnet',
        container: true,
        coords: [dbCoords],
    }
    page.coords = [subnetCoords]
    return ocdDocument
}

describe('OcdDocument.cloneResourceTree (issue #250)', () => {
    it('deep-clones a Subnet containing a DB System without orphaning the DB copy', () => {
        const ocdDocument = buildDesignWithSubnetAndDbSystem()
        const page = ocdDocument.getActivePage()
        const sourceSubnetCoords = page.coords[0]
        const originalSubnet = ocdDocument.getResource(sourceSubnetCoords.ocid)

        const subnetCountBefore = ocdDocument.design.model.oci.resources.subnet.length
        const dbCountBefore = ocdDocument.design.model.oci.resources.db_system.length

        // Act — perform the clone the same way onCloneClick does.
        const newRoot = ocdDocument.cloneResourceTree(sourceSubnetCoords)
        expect(newRoot).toBeDefined()
        if (!newRoot) return
        ocdDocument.setCoordsRelativeToCanvas(newRoot)
        ocdDocument.addCoords(newRoot, page.id, newRoot.pgid)

        // Model counts each grow by exactly one.
        expect(ocdDocument.design.model.oci.resources.subnet.length).toBe(subnetCountBefore + 1)
        expect(ocdDocument.design.model.oci.resources.db_system.length).toBe(dbCountBefore + 1)

        // New root coords references a NEW subnet model resource (not the original).
        const newSubnet = ocdDocument.getResource(newRoot.ocid)
        expect(newSubnet).toBeDefined()
        expect(newSubnet.id).not.toBe(originalSubnet.id)

        // The cloned subnet has exactly one child coord.
        expect(newRoot.coords).toBeDefined()
        expect(newRoot.coords!.length).toBe(1)
        const newChildCoord = newRoot.coords![0]

        // Child coord points to a NEW db_system model resource (not the original).
        const originalDb = ocdDocument.design.model.oci.resources.db_system[0]
        const newDb = ocdDocument.getResource(newChildCoord.ocid)
        expect(newDb).toBeDefined()
        expect(newDb.id).not.toBe(originalDb.id)

        // Child coord pocid === new subnet ocid (re-parented in the view tree).
        expect(newChildCoord.pocid).toBe(newRoot.ocid)
        // Child coord pgid === new subnet coords id.
        expect(newChildCoord.pgid).toBe(newRoot.id)

        // The new DB System model resource is parented to the NEW subnet (subnetId).
        expect(newDb.subnetId).toBe(newRoot.ocid)

        // Every coord in the new tree references an existing model resource.
        const allNewCoords = [newRoot, ...(newRoot.coords ?? [])]
        allNewCoords.forEach((c) => {
            expect(ocdDocument.getResource(c.ocid)).toBeDefined()
        })
    })
})

describe('OcdDocument.clone', () => {
    it('deep-clones design identity for memoized consumers', () => {
        const ocdDocument = OcdDocument.new()
        const clone = OcdDocument.clone(ocdDocument)

        expect(clone).not.toBe(ocdDocument)
        expect(clone.design).not.toBe(ocdDocument.design)
        expect(clone.design.model).not.toBe(ocdDocument.design.model)
        expect(clone.design.view).not.toBe(ocdDocument.design.view)
        expect(clone.design.model.oci.resources).not.toBe(ocdDocument.design.model.oci.resources)
        expect(clone.design.view.pages).not.toBe(ocdDocument.design.view.pages)
    })
})
