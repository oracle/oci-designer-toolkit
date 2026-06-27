/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** W5-E3 measurement harness. `OcdDocument.clone` deep-clones the entire design on
** every state update (the immutability mechanism). Before any structural-sharing
** refactor we measure the actual per-clone cost at realistic design sizes so the
** decision is data-driven (the refactor is high-risk: shared-reference mutation
** bugs). This logs ms/clone; it does not hard-assert timing (avoids CI flakiness).
*/

import { describe, it, expect } from 'vitest'
import { OcdDocument } from '../OcdDocument'
import { OcdDesign, OciModelResources } from '@ocd/model'

function buildDesignWithNResources(n: number): OcdDocument {
    const ocdDocument = OcdDocument.new()
    const design: OcdDesign = ocdDocument.design
    const compartmentId = design.model.oci.resources.compartment?.[0]?.id ?? 'okit.compartment.root'
    const page = ocdDocument.getActivePage()
    const subnets: any[] = []
    const coords: any[] = []
    for (let i = 0; i < n; i += 1) {
        // @ts-ignore - dynamic namespace lookup mirrors OcdDocument.addOciResource
        const subnet = OciModelResources.OciSubnet.newResource(`subnet_${i}`)
        subnet.compartmentId = compartmentId
        subnet.displayName = `subnet-${i}`
        subnets.push(subnet)
        coords.push({
            ...OcdDesign.newCoords(),
            id: `gid-${i}`,
            ocid: subnet.id,
            x: (i % 20) * 50, y: Math.floor(i / 20) * 50, w: 40, h: 40,
            title: subnet.resourceTypeName,
            class: 'oci-subnet',
        })
    }
    design.model.oci.resources.subnet = subnets
    page.coords = coords
    return ocdDocument
}

const median = (xs: number[]): number => {
    const s = [...xs].sort((a, b) => a - b)
    return s[Math.floor(s.length / 2)]
}

describe('OcdDocument.clone cost (W5-E3 benchmark)', () => {
    for (const n of [100, 300, 500]) {
        it(`measures clone cost at ${n} resources`, () => {
            const doc = buildDesignWithNResources(n)
            // Warm up the JIT / native structuredClone path.
            for (let i = 0; i < 5; i += 1) OcdDocument.clone(doc)
            const samples: number[] = []
            for (let i = 0; i < 30; i += 1) {
                const t0 = performance.now()
                OcdDocument.clone(doc)
                samples.push(performance.now() - t0)
            }
            const med = median(samples)
            // eslint-disable-next-line no-console
            console.log(`[W5-E3] clone @ ${n} resources: median ${med.toFixed(3)}ms (min ${Math.min(...samples).toFixed(3)}, max ${Math.max(...samples).toFixed(3)})`)
            // Sanity only: a clone must complete and produce a fresh spine.
            const clone = OcdDocument.clone(doc)
            expect(clone.design).not.toBe(doc.design)
            expect(clone.design.model.oci.resources).not.toBe(doc.design.model.oci.resources)
            expect(med).toBeGreaterThanOrEqual(0)
        })
    }
})
