/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { describe, expect, it } from 'vitest'
import {
    isLzOriginDesign,
    categorizeLzResource,
    resolveLzPlacement,
    LzCompartmentLike,
} from '../OcdLzPlacement'

// ---------------------------------------------------------------------------
// isLzOriginDesign
// ---------------------------------------------------------------------------
describe('isLzOriginDesign', () => {
    it('returns true when userDefined.lzOrigin is true', () => {
        expect(isLzOriginDesign({ userDefined: { lzOrigin: true } })).toBe(true)
    })

    it('returns false when the flag is missing', () => {
        expect(isLzOriginDesign({ userDefined: {} })).toBe(false)
    })

    it('returns false for null / undefined input', () => {
        expect(isLzOriginDesign(null)).toBe(false)
        expect(isLzOriginDesign(undefined)).toBe(false)
    })

    it('returns false when userDefined is absent', () => {
        expect(isLzOriginDesign({})).toBe(false)
    })
})

// ---------------------------------------------------------------------------
// categorizeLzResource
// ---------------------------------------------------------------------------
describe('categorizeLzResource', () => {
    it('classifies VCN as network', () => {
        expect(categorizeLzResource('vcn')).toBe('network')
    })

    it('classifies subnet as network', () => {
        expect(categorizeLzResource('subnet')).toBe('network')
    })

    it('classifies internet_gateway as network', () => {
        expect(categorizeLzResource('internet_gateway')).toBe('network')
    })

    it('classifies drg as network', () => {
        expect(categorizeLzResource('drg')).toBe('network')
    })

    it('classifies group as iam', () => {
        expect(categorizeLzResource('group')).toBe('iam')
    })

    it('classifies policy as iam', () => {
        expect(categorizeLzResource('policy')).toBe('iam')
    })

    it('classifies dynamic_group as iam', () => {
        expect(categorizeLzResource('dynamic_group')).toBe('iam')
    })

    it('classifies compartment as other (not placed into a sub-compartment)', () => {
        expect(categorizeLzResource('compartment')).toBe('other')
    })

    it('classifies non-LZ resources (Compute, OKE, DB) as workload', () => {
        expect(categorizeLzResource('instance')).toBe('workload')
        expect(categorizeLzResource('oke_cluster')).toBe('workload')
        expect(categorizeLzResource('autonomous_database')).toBe('workload')
        expect(categorizeLzResource('db_system')).toBe('workload')
        expect(categorizeLzResource('completely_unknown')).toBe('workload')
    })
})

// ---------------------------------------------------------------------------
// resolveLzPlacement
// ---------------------------------------------------------------------------
describe('resolveLzPlacement', () => {
    const rootCmp: LzCompartmentLike = { id: 'cmp-root', displayName: 'cmp-landingzone' }
    const networkCmp: LzCompartmentLike = { id: 'cmp-net', displayName: 'cmp-lz-prod-network' }
    const securityCmp: LzCompartmentLike = { id: 'cmp-sec', displayName: 'cmp-lz-prod-security' }
    const workloadCmp: LzCompartmentLike = { id: 'cmp-wrk', displayName: 'cmp-lz-prod-workload' }

    const allCompartments = [rootCmp, networkCmp, securityCmp, workloadCmp]

    it('places a VCN stencil in the network compartment', () => {
        expect(resolveLzPlacement('vcn', allCompartments)).toBe('cmp-net')
    })

    it('places a subnet stencil in the network compartment', () => {
        expect(resolveLzPlacement('subnet', allCompartments)).toBe('cmp-net')
    })

    it('places a group stencil in the security compartment', () => {
        expect(resolveLzPlacement('group', allCompartments)).toBe('cmp-sec')
    })

    it('places a policy stencil in the security compartment', () => {
        expect(resolveLzPlacement('policy', allCompartments)).toBe('cmp-sec')
    })

    it('places a compartment stencil in the fallback (root) compartment', () => {
        expect(resolveLzPlacement('compartment', allCompartments)).toBe('cmp-root')
    })

    it('places non-LZ workload resources (Compute/OKE/DB) in the workload compartment', () => {
        expect(resolveLzPlacement('instance', allCompartments)).toBe('cmp-wrk')
        expect(resolveLzPlacement('oke_cluster', allCompartments)).toBe('cmp-wrk')
        expect(resolveLzPlacement('autonomous_database', allCompartments)).toBe('cmp-wrk')
    })

    it('falls back to root for a workload resource when no workload compartment exists', () => {
        const cmps = [rootCmp, networkCmp, securityCmp]
        expect(resolveLzPlacement('instance', cmps)).toBe('cmp-root')
    })

    it('falls back to root when no network compartment is present', () => {
        const cmps = [rootCmp, securityCmp, workloadCmp]
        expect(resolveLzPlacement('vcn', cmps)).toBe('cmp-root')
    })

    it('falls back to root when no security/iam compartment is present', () => {
        const cmps = [rootCmp, networkCmp, workloadCmp]
        expect(resolveLzPlacement('policy', cmps)).toBe('cmp-root')
    })

    it('returns empty string when the compartment list is empty', () => {
        expect(resolveLzPlacement('vcn', [])).toBe('')
    })

    it('accepts a compartment named "iam" for IAM resources', () => {
        const iamCmp: LzCompartmentLike = { id: 'cmp-iam', displayName: 'cmp-lz-iam' }
        const cmps = [rootCmp, iamCmp]
        expect(resolveLzPlacement('group', cmps)).toBe('cmp-iam')
    })

    it('is case-insensitive for compartment name matching', () => {
        const upper: LzCompartmentLike = { id: 'cmp-NET', displayName: 'CMP-LZ-NETWORK' }
        expect(resolveLzPlacement('vcn', [rootCmp, upper])).toBe('cmp-NET')
    })
})
