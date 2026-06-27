import { describe, expect, it } from 'vitest'
import { buildConnectorPath } from '../OcdResourceSvg'

describe('OcdResourceSvg connector path routing', () => {
    it('routes horizontally separated resources from right edge to left edge', () => {
        expect(buildConnectorPath(
            { x: 0, y: 0, w: 40, h: 40 },
            { x: 180, y: 20, w: 40, h: 40 },
        )).toEqual({
            d: 'M 40 20 C 110 20, 110 40, 180 40',
            labelX: 110,
            labelY: 30,
        })
    })

    it('routes vertically stacked resources from bottom edge to top edge', () => {
        expect(buildConnectorPath(
            { x: 100, y: 0, w: 40, h: 40 },
            { x: 110, y: 180, w: 40, h: 40 },
            12,
        )).toEqual({
            d: 'M 120 40 C 120 110, 130 110, 130 180',
            labelX: 125,
            labelY: 122,
        })
    })

    it('uses the nearest side when connecting a frame to a contained resource', () => {
        expect(buildConnectorPath(
            { x: 0, y: 0, w: 300, h: 260 },
            { x: 210, y: 80, w: 40, h: 40 },
        )).toEqual({
            d: 'M 300 130 C 345 130, 165 100, 210 100',
            labelX: 255,
            labelY: 115,
        })
    })
})
