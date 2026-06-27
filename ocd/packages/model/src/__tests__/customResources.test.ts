/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { describe, it, expect } from 'vitest'
import { OcdDesign, CustomResource } from '../index.js'

const makeCustomInstance = (id: string): CustomResource => ({
    ...({} as Record<string, any>),
    provider: 'custom',
    locked: false,
    editLocked: false,
    terraformResourceName: '',
    okitReference: `okit-${id}`,
    resourceType: 'custom-acme-widget',
    resourceTypeName: 'ACME Widget',
    id,
    class: 'custom-acme-widget',
    displayName: 'My Widget',
    compartmentId: 'cmp-1',
    parentId: '',
    endpoint: 'https://example.invalid',
    replicas: 3,
    enabled: true,
})

describe('OcdDesign custom provider', () => {
    it('returns custom-model instances from getResources() and finds them by id', () => {
        const design = OcdDesign.newDesign()
        const instance = makeCustomInstance('okit.custom.001')
        design.model.custom = { resources: { 'custom-acme-widget': [instance] }, vars: [] }

        const resources = OcdDesign.getResources(design)
        expect(resources.some((r) => r.id === 'okit.custom.001')).toBe(true)

        const found = OcdDesign.getResource(design, 'okit.custom.001')
        expect(found).toBeDefined()
        expect(found!.provider).toBe('custom')
        expect((found as CustomResource).class).toBe('custom-acme-widget')
    })

    it('exposes custom resource lists via getResourceLists()', () => {
        const design = OcdDesign.newDesign()
        const instance = makeCustomInstance('okit.custom.002')
        design.model.custom = { resources: { 'custom-acme-widget': [instance] }, vars: [] }

        const lists = OcdDesign.getResourceLists(design)
        expect(Object.hasOwn(lists, 'custom-acme-widget')).toBe(true)
        expect(lists['custom-acme-widget']).toHaveLength(1)
    })

    it('returns parentId of empty string for custom resources (non-oci safe path)', () => {
        const design = OcdDesign.newDesign()
        const instance = makeCustomInstance('okit.custom.003')
        design.model.custom = { resources: { 'custom-acme-widget': [instance] }, vars: [] }
        expect(OcdDesign.getResourceParentId(design, 'okit.custom.003')).toBe('')
    })

    it('is a no-op for getResources() when no custom model is present', () => {
        const design = OcdDesign.newDesign()
        expect(OcdDesign.getCustomResources(design)).toEqual([])
        expect(OcdDesign.getCustomResourceLists(design)).toEqual({})
    })
})
