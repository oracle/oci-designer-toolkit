/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { describe, expect, it } from 'vitest'
import { resolveShapeSkus, COMPUTE_SHAPE_SKUS, COMPUTE_SHAPE_PART_NUMBERS } from '../OcdComputeShapeSkus'

describe('resolveShapeSkus', () => {
    it('falls back to the E5 mapping for empty or unknown shapes', () => {
        const empty = resolveShapeSkus('')
        const unknown = resolveShapeSkus('VM.Made.Up.Shape')

        expect(empty.familyKey).toBe('fallback')
        expect(empty.alwaysFree).toBe(false)
        expect(empty.ocpuSku.length).toBeGreaterThan(0)
        expect(unknown.familyKey).toBe('fallback')
    })

    it('resolves a Standard E5 Flex shape to the verified standard.e5 family', () => {
        const sku = resolveShapeSkus('VM.Standard.E5.Flex')

        expect(sku.familyKey).toBe('standard.e5')
        expect(sku.alwaysFree).toBe(false)
        // The mapping must reference a real cetools OCPU part number.
        expect(sku.ocpuSku).toMatch(/^B\d+$/)
    })

    it('marks Micro shapes as always free', () => {
        const sku = resolveShapeSkus('VM.Standard.E2.1.Micro')

        expect(sku.alwaysFree).toBe(true)
        expect(sku.familyKey).toBe('always-free')
    })

    it('derives the GPU count from the trailing shape segment', () => {
        const two = resolveShapeSkus('VM.GPU.A10.2')
        const one = resolveShapeSkus('VM.GPU.A10.1')

        expect(two.familyKey).toBe('gpu.a10')
        expect(two.gpuCount).toBe(2)
        expect(one.gpuCount).toBe(1)
    })

    it('classifies bare-metal HPC shapes as an HPC family, not Standard', () => {
        const sku = resolveShapeSkus('BM.HPC2.36')

        expect(sku.familyKey).toBe('hpc')
    })

    it('memoizes results so repeated lookups return the same object', () => {
        const first = resolveShapeSkus('VM.Standard.E4.Flex')
        const second = resolveShapeSkus('VM.Standard.E4.Flex')

        expect(second).toBe(first)
    })

    it('exposes every mapped part number through COMPUTE_SHAPE_PART_NUMBERS', () => {
        const referenced = new Set<string>()
        for (const mapping of Object.values(COMPUTE_SHAPE_SKUS)) {
            if (mapping.ocpuSku) referenced.add(mapping.ocpuSku)
            if (mapping.memSku) referenced.add(mapping.memSku)
        }

        for (const part of referenced) {
            expect(COMPUTE_SHAPE_PART_NUMBERS).toContain(part)
        }
        expect(COMPUTE_SHAPE_PART_NUMBERS.length).toBeGreaterThan(0)
    })
})
