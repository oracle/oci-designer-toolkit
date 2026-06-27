/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { describe, expect, it } from 'vitest'
import { OcdViewCoords } from '@ocd/model'
import { ArchitectureRelationGraph } from '../../architecture-agent/OcdArchitectureAgent'
import { buildRelationInspectionRows, buildRelationOverlayConnectors, calculateSvgHeight, calculateSvgWidth, compactRelationConnectorLabel } from '../OcdCanvas'

const coords = (overrides: Partial<OcdViewCoords>): OcdViewCoords => ({
    id: 'coords',
    pgid: '',
    ocid: 'resource',
    pocid: '',
    x: 0,
    y: 0,
    w: 32,
    h: 32,
    title: 'Resource',
    class: 'oci-resource',
    showParentConnection: false,
    showConnections: false,
    ...overrides,
})

describe('OcdCanvas derived data helpers', () => {
    it('uses container dimensions when the container has default details style', () => {
        expect(calculateSvgWidth([
            coords({ x: 100, y: 50, w: 300, h: 250, container: true, detailsStyle: 'default' }),
        ])).toBe(500)

        expect(calculateSvgHeight([
            coords({ x: 100, y: 50, w: 300, h: 250, container: true, detailsStyle: 'default' }),
        ])).toBe(400)
    })

    it('uses fixed resource dimensions for detailed and simple non-container resources', () => {
        expect(calculateSvgWidth([
            coords({ x: 20, detailsStyle: 'detailed' }),
            coords({ x: 300, detailsStyle: 'simple' }),
        ])).toBe(440)

        expect(calculateSvgHeight([
            coords({ y: 20, detailsStyle: 'detailed' }),
            coords({ y: 300, detailsStyle: 'simple' }),
        ])).toBe(440)
    })

    it('derives visible parent and association overlay connectors from a relation graph', () => {
        const graph: ArchitectureRelationGraph = {
            nodes: [],
            edges: [
                { id: 'parent:subnet:vcn', kind: 'parent', sourceId: 'subnet', targetId: 'vcn', label: 'contained by' },
                { id: 'association:instance:subnet', kind: 'association', sourceId: 'instance', targetId: 'subnet', label: 'references subnetId' },
            ],
        }

        const result = buildRelationOverlayConnectors(graph, [
            coords({ id: 'vcn-coords', ocid: 'vcn' }),
            coords({ id: 'subnet-coords', ocid: 'subnet' }),
            coords({ id: 'instance-coords', ocid: 'instance' }),
        ], ['vcn', 'subnet', 'instance'])

        expect(result.parentConnectors).toEqual([{
            startCoordsId: 'vcn-coords',
            endCoordsId: 'subnet-coords',
            label: 'contains',
            kind: 'parent',
        }])
        expect(result.associationConnectors).toEqual([{
            startCoordsId: 'instance-coords',
            endCoordsId: 'subnet-coords',
            label: 'subnetId',
            kind: 'association',
        }])
        expect(result.hiddenEdgeCount).toBe(0)
    })

    it('counts relation graph edges hidden by the active page or layer visibility', () => {
        const graph: ArchitectureRelationGraph = {
            nodes: [],
            edges: [
                { id: 'association:instance:missing', kind: 'association', sourceId: 'instance', targetId: 'missing', label: 'missing target' },
            ],
        }

        const result = buildRelationOverlayConnectors(graph, [
            coords({ id: 'instance-coords', ocid: 'instance' }),
        ], ['instance'])

        expect(result.parentConnectors).toEqual([])
        expect(result.associationConnectors).toEqual([])
        expect(result.hiddenEdgeCount).toBe(1)
    })

    it('preserves distinct labels for duplicate relation connectors between the same resources', () => {
        const graph: ArchitectureRelationGraph = {
            nodes: [],
            edges: [
                { id: 'association:route-table:drg:one', kind: 'association', sourceId: 'route-table', targetId: 'drg', label: 'references drgId' },
                { id: 'association:route-table:drg:two', kind: 'association', sourceId: 'route-table', targetId: 'drg', label: 'routes traffic to DRG' },
                { id: 'association:route-table:drg:duplicate', kind: 'association', sourceId: 'route-table', targetId: 'drg', label: 'references drgId' },
            ],
        }

        const result = buildRelationOverlayConnectors(graph, [
            coords({ id: 'route-table-coords', ocid: 'route-table' }),
            coords({ id: 'drg-coords', ocid: 'drg' }),
        ], ['route-table', 'drg'])

        expect(result.associationConnectors).toEqual([{
            startCoordsId: 'route-table-coords',
            endCoordsId: 'drg-coords',
            label: 'drgId; routes traffic to DRG',
            kind: 'association',
        }])
    })

    it('compacts verbose relation labels for canvas display', () => {
        expect(compactRelationConnectorLabel('parent', 'Private subnet contained by App VCN')).toBe('contains')
        expect(compactRelationConnectorLabel('association', 'OKE Cluster references options.serviceLbSubnetIds')).toBe('serviceLbSubnetIds')
        expect(compactRelationConnectorLabel('association', 'Function references config.subnetIds[0]')).toBe('subnetIds')
    })

    it('builds relation inspector rows with display names and visibility state', () => {
        const graph: ArchitectureRelationGraph = {
            nodes: [
                { id: 'instance', provider: 'oci', resourceType: 'instance', resourceTypeName: 'Instance', displayName: 'App Instance' },
                { id: 'subnet', provider: 'oci', resourceType: 'subnet', resourceTypeName: 'Subnet', displayName: 'App Subnet' },
                { id: 'drg', provider: 'oci', resourceType: 'drg', resourceTypeName: 'DRG', displayName: 'Hub DRG' },
            ],
            edges: [
                { id: 'association:instance:subnet', kind: 'association', sourceId: 'instance', targetId: 'subnet', label: 'references subnetId' },
                { id: 'association:instance:drg', kind: 'association', sourceId: 'instance', targetId: 'drg', label: 'routes to DRG' },
            ],
        }

        expect(buildRelationInspectionRows(graph, [
            coords({ id: 'instance-coords', ocid: 'instance' }),
            coords({ id: 'subnet-coords', ocid: 'subnet' }),
        ], ['instance', 'subnet'])).toEqual([
            {
                id: 'association:instance:subnet',
                kind: 'association',
                label: 'references subnetId',
                sourceName: 'App Instance',
                targetName: 'App Subnet',
                visible: true,
            },
            {
                id: 'association:instance:drg',
                kind: 'association',
                label: 'routes to DRG',
                sourceName: 'App Instance',
                targetName: 'Hub DRG',
                visible: false,
            },
        ])
    })
})
