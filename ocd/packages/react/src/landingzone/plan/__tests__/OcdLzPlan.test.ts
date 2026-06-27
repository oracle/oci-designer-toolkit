/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { describe, expect, it } from 'vitest'
import { OcdDesign } from '@ocd/model'
import {
    diffDesigns,
    summarizePlan,
    isVolatileField,
    VOLATILE_FIELDS,
    type PlanEntry,
} from '../OcdLzPlan'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/** Build a minimal but valid OcdDesign with an arbitrary OCI resources map. */
function makeDesign(ociResources: Record<string, unknown[]>): OcdDesign {
    const base = OcdDesign.newDesign()
    return {
        ...base,
        model: {
            ...base.model,
            oci: {
                ...base.model.oci,
                resources: ociResources as Record<string, unknown[]>,
            },
        },
    }
}

/** Minimal OCI resource shape that the diff engine can process. */
function makeResource(
    overrides: Partial<Record<string, unknown>> = {},
): Record<string, unknown> {
    return {
        provider: 'oci',
        locked: false,
        editLocked: false,
        terraformResourceName: 'oci_identity_compartment',
        okitReference: 'okit-test-ref',
        resourceType: 'Compartment',
        resourceTypeName: 'Compartment',
        id: 'okit.compartment.test-id',
        displayName: 'Test Compartment',
        region: '',
        compartmentId: '',
        documentation: '',
        ...overrides,
    }
}

// ---------------------------------------------------------------------------
// isVolatileField
// ---------------------------------------------------------------------------

describe('isVolatileField', () => {
    it('returns true for every field in VOLATILE_FIELDS', () => {
        for (const f of Array.from(VOLATILE_FIELDS)) {
            expect(isVolatileField(f), `expected "${f}" to be volatile`).toBe(true)
        }
    })

    it('returns true for *Id suffix fields (cross-references)', () => {
        expect(isVolatileField('compartmentId')).toBe(true)
        expect(isVolatileField('vcnId')).toBe(true)
        expect(isVolatileField('routeTableId')).toBe(true)
        expect(isVolatileField('subnetIds')).toBe(true)
        expect(isVolatileField('securityListIds')).toBe(true)
    })

    it('returns false for meaningful semantic fields', () => {
        expect(isVolatileField('displayName')).toBe(false)
        expect(isVolatileField('cidrBlock')).toBe(false)
        expect(isVolatileField('dnsLabel')).toBe(false)
        expect(isVolatileField('description')).toBe(false)
        expect(isVolatileField('statements')).toBe(false)
    })
})

// ---------------------------------------------------------------------------
// diffDesigns — no-op
// ---------------------------------------------------------------------------

describe('diffDesigns — no-op', () => {
    it('produces no-op for identical resources', () => {
        const r = makeResource({ displayName: 'My Compartment', description: 'desc' })
        const design = makeDesign({ compartment: [r] })
        const entries = diffDesigns(design, design)
        expect(entries.every((e) => e.action === 'no-op')).toBe(true)
    })

    it('treats a change to only volatile fields (id) as no-op', () => {
        const base = makeDesign({
            compartment: [makeResource({ id: 'okit.compartment.aaa', displayName: 'LZ Root' })],
        })
        const target = makeDesign({
            compartment: [makeResource({ id: 'okit.compartment.bbb', displayName: 'LZ Root' })],
        })
        const entries = diffDesigns(base, target)
        expect(entries).toHaveLength(1)
        expect(entries[0].action).toBe('no-op')
    })

    it('treats a change to compartmentId as no-op (uuid cross-ref)', () => {
        const base = makeDesign({
            compartment: [makeResource({ displayName: 'Child', compartmentId: 'okit.compartment.parent-a' })],
        })
        const target = makeDesign({
            compartment: [makeResource({ displayName: 'Child', compartmentId: 'okit.compartment.parent-b' })],
        })
        const entries = diffDesigns(base, target)
        expect(entries).toHaveLength(1)
        expect(entries[0].action).toBe('no-op')
    })

    it('produces no-op for empty designs (no throw)', () => {
        const empty = makeDesign({})
        const entries = diffDesigns(empty, empty)
        expect(entries).toHaveLength(0)
    })
})

// ---------------------------------------------------------------------------
// diffDesigns — create
// ---------------------------------------------------------------------------

describe('diffDesigns — create', () => {
    it('marks resources present only in target as create', () => {
        const base = makeDesign({})
        const target = makeDesign({
            compartment: [makeResource({ displayName: 'New Compartment' })],
        })
        const entries = diffDesigns(base, target)
        expect(entries).toHaveLength(1)
        expect(entries[0].action).toBe('create')
        expect(entries[0].displayName).toBe('New Compartment')
        expect(entries[0].resourceKey).toBe('compartment')
    })

    it('marks all resources in a new key as create when base lacks that key', () => {
        const base = makeDesign({ compartment: [makeResource({ displayName: 'Root' })] })
        const target = makeDesign({
            compartment: [makeResource({ displayName: 'Root' })],
            vcn: [makeResource({ displayName: 'Prod VCN', resourceType: 'Vcn' })],
        })
        const creates = diffDesigns(base, target).filter((e) => e.action === 'create')
        expect(creates).toHaveLength(1)
        expect(creates[0].resourceKey).toBe('vcn')
    })
})

// ---------------------------------------------------------------------------
// diffDesigns — delete
// ---------------------------------------------------------------------------

describe('diffDesigns — delete', () => {
    it('marks resources present only in base as delete', () => {
        const base = makeDesign({
            compartment: [makeResource({ displayName: 'Old Compartment' })],
        })
        const target = makeDesign({})
        const entries = diffDesigns(base, target)
        expect(entries).toHaveLength(1)
        expect(entries[0].action).toBe('delete')
        expect(entries[0].displayName).toBe('Old Compartment')
    })

    it('reports delete for all resources when an entire key is removed', () => {
        const r1 = makeResource({ displayName: 'VCN-A', resourceType: 'Vcn' })
        const r2 = makeResource({ displayName: 'VCN-B', resourceType: 'Vcn', id: 'okit.vcn.b' })
        const base = makeDesign({ vcn: [r1, r2] })
        const target = makeDesign({})
        const deletes = diffDesigns(base, target).filter((e) => e.action === 'delete')
        expect(deletes).toHaveLength(2)
    })
})

// ---------------------------------------------------------------------------
// diffDesigns — update
// ---------------------------------------------------------------------------

describe('diffDesigns — update', () => {
    it('marks resources with semantic changes as update with correct field diffs', () => {
        const base = makeDesign({
            compartment: [makeResource({ displayName: 'LZ Root', description: 'old desc' })],
        })
        const target = makeDesign({
            compartment: [makeResource({ displayName: 'LZ Root', description: 'new desc' })],
        })
        const entries = diffDesigns(base, target)
        expect(entries).toHaveLength(1)
        expect(entries[0].action).toBe('update')
        expect(entries[0].changes).toBeDefined()
        const descChange = entries[0].changes!.find((c) => c.field === 'description')
        expect(descChange).toBeDefined()
        expect(descChange!.from).toBe('old desc')
        expect(descChange!.to).toBe('new desc')
    })

    it('includes changed array values in update changes', () => {
        const base = makeDesign({
            policy: [makeResource({ displayName: 'LZ Policy', resourceType: 'Policy', statements: ['allow group A to read all'] })],
        })
        const target = makeDesign({
            policy: [makeResource({ displayName: 'LZ Policy', resourceType: 'Policy', statements: ['allow group A to manage all'] })],
        })
        const entries = diffDesigns(base, target)
        expect(entries[0].action).toBe('update')
        const stmtChange = entries[0].changes!.find((c) => c.field === 'statements')
        expect(stmtChange).toBeDefined()
    })

    it('does NOT include volatile fields in update changes', () => {
        const base = makeDesign({
            compartment: [makeResource({ displayName: 'Root', id: 'okit.compartment.old', description: 'same' })],
        })
        const target = makeDesign({
            compartment: [makeResource({ displayName: 'Root', id: 'okit.compartment.new', description: 'same' })],
        })
        const entries = diffDesigns(base, target)
        expect(entries[0].action).toBe('no-op')
        expect(entries[0].changes).toBeUndefined()
    })
})

// ---------------------------------------------------------------------------
// diffDesigns — fallback to id match
// ---------------------------------------------------------------------------

describe('diffDesigns — id fallback matching', () => {
    it('matches by id when displayName changed', () => {
        const sharedId = 'okit.compartment.stable-id'
        const base = makeDesign({
            compartment: [makeResource({ id: sharedId, displayName: 'Old Name', description: 'x' })],
        })
        const target = makeDesign({
            compartment: [makeResource({ id: sharedId, displayName: 'New Name', description: 'x' })],
        })
        const entries = diffDesigns(base, target)
        // displayName changed → should be update, NOT create+delete pair
        expect(entries).toHaveLength(1)
        expect(entries[0].action).toBe('update')
    })
})

// ---------------------------------------------------------------------------
// diffDesigns — mixed
// ---------------------------------------------------------------------------

describe('diffDesigns — mixed scenario', () => {
    it('handles a realistic LZ re-import with create/update/delete/no-op in one call', () => {
        const base = makeDesign({
            compartment: [
                makeResource({ displayName: 'LZ Root', description: 'Root' }),
                makeResource({ displayName: 'Network', description: 'Net', id: 'okit.compartment.net' }),
                makeResource({ displayName: 'Security', description: 'Sec', id: 'okit.compartment.sec' }),
            ],
        })
        const target = makeDesign({
            compartment: [
                makeResource({ displayName: 'LZ Root', description: 'Root' }),          // no-op
                makeResource({ displayName: 'Network', description: 'Updated Net' }),    // update
                makeResource({ displayName: 'Logging', description: 'New', id: 'okit.compartment.log' }), // create
                // Security deleted
            ],
        })
        const entries = diffDesigns(base, target)
        const byAction = (a: string) => entries.filter((e) => e.action === a)
        expect(byAction('create')).toHaveLength(1)
        expect(byAction('update')).toHaveLength(1)
        expect(byAction('delete')).toHaveLength(1)
        expect(byAction('no-op')).toHaveLength(1)
    })
})

// ---------------------------------------------------------------------------
// diffDesigns — deterministic ordering
// ---------------------------------------------------------------------------

describe('diffDesigns — ordering', () => {
    it('returns entries in create → update → delete → no-op order', () => {
        const base = makeDesign({
            compartment: [
                makeResource({ displayName: 'Keep', description: 'same' }),
                makeResource({ displayName: 'Change', description: 'old', id: 'okit.compartment.c' }),
                makeResource({ displayName: 'Gone', id: 'okit.compartment.g' }),
            ],
        })
        const target = makeDesign({
            compartment: [
                makeResource({ displayName: 'Keep', description: 'same' }),
                makeResource({ displayName: 'Change', description: 'new', id: 'okit.compartment.c' }),
                makeResource({ displayName: 'New', id: 'okit.compartment.n' }),
            ],
        })
        const entries = diffDesigns(base, target)
        const actions = entries.map((e) => e.action)
        const actionOrder = { create: 0, update: 1, delete: 2, 'no-op': 3 }
        for (let i = 0; i < actions.length - 1; i++) {
            expect(actionOrder[actions[i]]).toBeLessThanOrEqual(actionOrder[actions[i + 1]])
        }
    })
})

// ---------------------------------------------------------------------------
// diffDesigns — partial / undefined-safe designs
// ---------------------------------------------------------------------------

describe('diffDesigns — graceful with partial designs', () => {
    it('does not throw when OCI resources object is empty on both sides', () => {
        const a = makeDesign({})
        const b = makeDesign({})
        expect(() => diffDesigns(a, b)).not.toThrow()
        expect(diffDesigns(a, b)).toHaveLength(0)
    })

    it('handles a design with multiple resource types without throwing', () => {
        const r = makeResource({ displayName: 'My VCN', resourceType: 'Vcn' })
        const base = makeDesign({ compartment: [makeResource()], vcn: [r] })
        const target = makeDesign({ compartment: [makeResource()], vcn: [] })
        expect(() => diffDesigns(base, target)).not.toThrow()
        const deletes = diffDesigns(base, target).filter((e) => e.action === 'delete')
        expect(deletes).toHaveLength(1)
        expect(deletes[0].resourceKey).toBe('vcn')
    })
})

// ---------------------------------------------------------------------------
// summarizePlan
// ---------------------------------------------------------------------------

describe('summarizePlan', () => {
    it('returns zero counts for empty array', () => {
        const s = summarizePlan([])
        expect(s).toEqual({ create: 0, update: 0, delete: 0, noop: 0, total: 0 })
    })

    it('counts each action correctly', () => {
        const entries: PlanEntry[] = [
            { action: 'create', resourceKey: 'compartment', resourceId: 'a', displayName: 'A', resourceType: 'Compartment' },
            { action: 'create', resourceKey: 'compartment', resourceId: 'b', displayName: 'B', resourceType: 'Compartment' },
            { action: 'update', resourceKey: 'vcn', resourceId: 'c', displayName: 'C', resourceType: 'Vcn', changes: [{ field: 'cidrBlock', from: '10.0.0.0/16', to: '10.1.0.0/16' }] },
            { action: 'delete', resourceKey: 'compartment', resourceId: 'd', displayName: 'D', resourceType: 'Compartment' },
            { action: 'no-op', resourceKey: 'compartment', resourceId: 'e', displayName: 'E', resourceType: 'Compartment' },
        ]
        const s = summarizePlan(entries)
        expect(s.create).toBe(2)
        expect(s.update).toBe(1)
        expect(s.delete).toBe(1)
        expect(s.noop).toBe(1)
        expect(s.total).toBe(5)
    })

    it('matches the summary from a full diffDesigns call', () => {
        const base = makeDesign({ compartment: [makeResource({ displayName: 'Old' })] })
        const target = makeDesign({ compartment: [makeResource({ displayName: 'New' })] })
        const entries = diffDesigns(base, target)
        const s = summarizePlan(entries)
        expect(s.total).toBe(entries.length)
        expect(s.create + s.update + s.delete + s.noop).toBe(s.total)
    })
})
