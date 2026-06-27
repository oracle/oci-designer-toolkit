/*
** Copyright (c) 2026, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { describe, expect, it } from 'vitest'
import { clampDesignerCommandCenterPosition, getDesignerCommandCenterActionMetadata, getDesignerCommandCenterMode } from '../OcdDesigner'

describe('OcdDesigner command center', () => {
    it('uses the start panel for an empty active canvas', () => {
        expect(getDesignerCommandCenterMode(0)).toBe('empty')
    })

    it('uses compact shortcuts once the active canvas has resources', () => {
        expect(getDesignerCommandCenterMode(1)).toBe('compact')
        expect(getDesignerCommandCenterMode(4)).toBe('compact')
    })

    it('keeps a dragged command center inside the visible designer surface', () => {
        const bounds = {
            containerWidth: 300,
            containerHeight: 220,
            panelWidth: 120,
            panelHeight: 80,
            padding: 8,
        }

        expect(clampDesignerCommandCenterPosition({ x: -20, y: 0 }, bounds)).toEqual({ x: 8, y: 8 })
        expect(clampDesignerCommandCenterPosition({ x: 400, y: 300 }, bounds)).toEqual({ x: 172, y: 132 })
        expect(clampDesignerCommandCenterPosition({ x: 100, y: 90 }, bounds)).toEqual({ x: 100, y: 90 })
    })

    it('exposes AI Architect alongside Landing Zone in the shortcut actions', () => {
        const actions = getDesignerCommandCenterActionMetadata()

        expect(actions.map((action) => action.id)).toEqual(expect.arrayContaining(['landing-zone', 'ai-architect']))
        expect(actions.find((action) => action.id === 'ai-architect')).toMatchObject({
            label: 'AI Architect',
            icon: 'AI',
            title: 'Open AI Architect',
            tone: 'primary',
        })
    })
})
