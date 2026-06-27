/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { describe, expect, it } from 'vitest'
import { OcdDesign, OcdViewCoords } from '@ocd/model'
import { OcdDocument } from '../OcdDocument'

const makeCoords = (overrides: Partial<OcdViewCoords>): OcdViewCoords => ({
    ...OcdDesign.newCoords(),
    w: 32,
    h: 32,
    title: 'Resource',
    class: 'oci-resource',
    ...overrides,
})

describe('OcdDocument frame containment', () => {
    it('attaches page-level resources that are fully inside a frame', () => {
        const ocdDocument = OcdDocument.new()
        const page = ocdDocument.getActivePage()
        const frame = makeCoords({
            id: 'gid-frame',
            ocid: 'frame-resource',
            x: 100,
            y: 100,
            w: 300,
            h: 240,
            class: 'oci-compartment',
            container: true,
        })
        const child = makeCoords({
            id: 'gid-child',
            ocid: 'child-resource',
            x: 150,
            y: 170,
        })
        page.coords = [frame, child]

        const attached = ocdDocument.attachContainedCoordsToFrame(frame, page.id)

        expect(attached).toBe(1)
        expect(page.coords.map((coords) => coords.id)).toEqual(['gid-frame'])
        expect(frame.coords?.map((coords) => coords.id)).toEqual(['gid-child'])
        expect(frame.coords?.[0]).toMatchObject({
            id: 'gid-child',
            pgid: 'gid-frame',
            pocid: 'frame-resource',
            x: 50,
            y: 70,
        })
    })

    it('does not attach resources that only partially overlap the frame', () => {
        const ocdDocument = OcdDocument.new()
        const page = ocdDocument.getActivePage()
        const frame = makeCoords({
            id: 'gid-frame',
            ocid: 'frame-resource',
            x: 100,
            y: 100,
            w: 180,
            h: 160,
            container: true,
        })
        const partialOverlap = makeCoords({
            id: 'gid-partial',
            ocid: 'partial-resource',
            x: 260,
            y: 240,
            w: 80,
            h: 80,
        })
        page.coords = [frame, partialOverlap]

        const attached = ocdDocument.attachContainedCoordsToFrame(frame, page.id)

        expect(attached).toBe(0)
        expect(page.coords.map((coords) => coords.id)).toEqual(['gid-frame', 'gid-partial'])
        expect(frame.coords).toBeUndefined()
    })

    it('clamps container resize to keep child resources inside the frame', () => {
        const ocdDocument = OcdDocument.new()
        const frame = makeCoords({
            id: 'gid-frame',
            ocid: 'frame-resource',
            x: 100,
            y: 100,
            w: 360,
            h: 300,
            container: true,
            coords: [
                makeCoords({
                    id: 'gid-child',
                    ocid: 'child-resource',
                    pgid: 'gid-frame',
                    pocid: 'frame-resource',
                    x: 260,
                    y: 210,
                    w: 48,
                    h: 48,
                }),
            ],
        })
        const proposed = {
            ...frame,
            x: 260,
            y: 240,
            w: 100,
            h: 80,
        }

        const constrained = ocdDocument.constrainContainerResize(frame, proposed)

        expect(constrained.w).toBeGreaterThanOrEqual(340)
        expect(constrained.h).toBeGreaterThanOrEqual(290)
        expect(constrained.x + constrained.w).toBe(frame.x + frame.w)
        expect(constrained.y + constrained.h).toBe(frame.y + frame.h)
    })
})
