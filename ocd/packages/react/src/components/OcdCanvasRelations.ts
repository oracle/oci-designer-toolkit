/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Relation-overlay graph logic extracted from OcdCanvas.
**
** Holds the pure helpers that translate an ArchitectureRelationGraph into the
** parent / association overlay connectors rendered on the canvas, plus the
** inspection rows shown in the relation details panel. Also exposes a
** useArchitectureRelation hook that wires these helpers together with the
** legacy parent/association connectors for the canvas component.
**
** Pure code movement from OcdCanvas.tsx — no behavioural changes.
*/

import { useMemo } from 'react'
import { OcdViewConnector, OcdViewCoords, OcdViewPage } from '@ocd/model'
import {
    buildArchitectureRelationGraph,
    type ArchitectureRelationGraph,
    type ArchitectureRelationKind,
} from '../architecture-agent/OcdArchitectureAgent'
import { OcdDocument } from './OcdDocument'

export interface OcdRelationOverlayConnectors {
    parentConnectors: OcdRelationOverlayConnector[]
    associationConnectors: OcdRelationOverlayConnector[]
    hiddenEdgeCount: number
}

export interface OcdRelationOverlayConnector extends OcdViewConnector {
    label: string
    kind: ArchitectureRelationKind
}

export interface OcdRelationInspectionRow {
    id: string
    kind: ArchitectureRelationKind
    label: string
    sourceName: string
    targetName: string
    visible: boolean
}

export type OcdDisplayConnector = OcdViewConnector & { label?: string }

const connectorKey = (connector: OcdViewConnector): string => `${connector.startCoordsId}:${connector.endCoordsId}`

const compactReferencePath = (label: string): string => {
    const referenceMatch = label.match(/\breferences\s+(.+)$/)
    const rawPath = referenceMatch?.[1]?.trim() ?? label.trim()
    const pathSegments = rawPath.split('.').filter((segment) => segment.trim() !== '')
    const lastSegment = pathSegments[pathSegments.length - 1] ?? rawPath
    return lastSegment.replace(/\[\d+\]/g, '')
}

export const compactRelationConnectorLabel = (kind: ArchitectureRelationKind, label: string): string => {
    if (kind === 'parent') return 'contains'
    return compactReferencePath(label)
}

export const mergeConnectorLabels = (existingLabel = '', incomingLabel = ''): string | undefined => {
    const labels = [...existingLabel.split(';'), ...incomingLabel.split(';')]
        .map((label) => label.trim())
        .filter((label) => label.length > 0)
    const uniqueLabels = [...new Set(labels)]
    return uniqueLabels.length > 0 ? uniqueLabels.join('; ') : undefined
}

export const addUniqueConnector = <T extends OcdDisplayConnector>(connectors: T[], connector: T): T[] => {
    const existingConnector = connectors.find((existing) => connectorKey(existing) === connectorKey(connector))
    if (!existingConnector) return [...connectors, connector]
    const mergedLabel = mergeConnectorLabels(existingConnector.label, connector.label)
    if (mergedLabel === existingConnector.label) return connectors
    return connectors.map((existing) => connectorKey(existing) === connectorKey(connector)
        ? { ...existing, label: mergedLabel }
        : existing)
}

export const mergeConnectors = (...connectorGroups: OcdDisplayConnector[][]): OcdDisplayConnector[] =>
    connectorGroups.flat().reduce((connectors, connector) => addUniqueConnector(connectors, connector), [] as OcdDisplayConnector[])

export const buildRelationOverlayConnectors = (
    graph: ArchitectureRelationGraph,
    pageCoords: OcdViewCoords[],
    visibleResourceIds: readonly string[],
): OcdRelationOverlayConnectors => {
    const visibleIds = new Set(visibleResourceIds)
    const coordsByResourceId = new Map<string, OcdViewCoords>()
    pageCoords
        .filter((coords) => visibleIds.has(coords.ocid))
        .forEach((coords) => {
            if (!coordsByResourceId.has(coords.ocid)) coordsByResourceId.set(coords.ocid, coords)
        })
    return graph.edges.reduce((result, edge) => {
        const sourceCoords = coordsByResourceId.get(edge.sourceId)
        const targetCoords = coordsByResourceId.get(edge.targetId)
        if (!sourceCoords || !targetCoords || sourceCoords.id === targetCoords.id) {
            return { ...result, hiddenEdgeCount: result.hiddenEdgeCount + 1 }
        }
        if (edge.kind === 'parent') {
            return {
                ...result,
                parentConnectors: addUniqueConnector(result.parentConnectors, {
                    startCoordsId: targetCoords.id,
                    endCoordsId: sourceCoords.id,
                    label: compactRelationConnectorLabel(edge.kind, edge.label),
                    kind: edge.kind,
                }),
            }
        }
        return {
            ...result,
            associationConnectors: addUniqueConnector(result.associationConnectors, {
                startCoordsId: sourceCoords.id,
                endCoordsId: targetCoords.id,
                label: compactRelationConnectorLabel(edge.kind, edge.label),
                kind: edge.kind,
            }),
        }
    }, { parentConnectors: [], associationConnectors: [], hiddenEdgeCount: 0 } as OcdRelationOverlayConnectors)
}

export const buildRelationInspectionRows = (
    graph: ArchitectureRelationGraph,
    pageCoords: OcdViewCoords[],
    visibleResourceIds: readonly string[],
): OcdRelationInspectionRow[] => {
    const visibleIds = new Set(visibleResourceIds)
    const visibleCoordsResourceIds = new Set(pageCoords
        .filter((coords) => visibleIds.has(coords.ocid))
        .map((coords) => coords.ocid))
    const nodesById = new Map(graph.nodes.map((node) => [node.id, node]))
    return graph.edges.map((edge): OcdRelationInspectionRow => ({
        id: edge.id,
        kind: edge.kind,
        label: edge.label,
        sourceName: nodesById.get(edge.sourceId)?.displayName ?? edge.sourceId,
        targetName: nodesById.get(edge.targetId)?.displayName ?? edge.targetId,
        visible: visibleCoordsResourceIds.has(edge.sourceId) && visibleCoordsResourceIds.has(edge.targetId),
    }))
}

export interface ArchitectureRelationVisibility {
    relationOverlayVisible: boolean
    relationParentVisible: boolean
    relationAssociationVisible: boolean
}

export interface ArchitectureRelation {
    relationGraph: ArchitectureRelationGraph
    relationInspectionRows: OcdRelationInspectionRow[]
    renderedParentConnectors: OcdDisplayConnector[]
    renderedAssociationConnectors: OcdDisplayConnector[]
    hiddenEdgeCount: number
    visibleRelationCount: number
    displayedRelationCount: number
}

/**
 * Derives the architecture-relation overlay state for the canvas.
 *
 * Combines the legacy parent/association connectors with the relation-graph
 * overlay connectors, honouring the relation visibility toggles. Extracted
 * verbatim from OcdCanvas so the wiring stays independently testable; the
 * useMemo dependency arrays are unchanged from the original component.
 */
export const useArchitectureRelation = (
    ocdDocument: OcdDocument,
    page: OcdViewPage,
    visibleResourceIds: string[],
    parentConnectors: OcdViewConnector[],
    associationConnectors: OcdViewConnector[],
    visibility: ArchitectureRelationVisibility,
): ArchitectureRelation => {
    const { relationOverlayVisible, relationParentVisible, relationAssociationVisible } = visibility
    const relationGraph = useMemo(() => buildArchitectureRelationGraph(ocdDocument.design), [ocdDocument.design])
    const relationOverlayConnectors = useMemo(
        () => buildRelationOverlayConnectors(relationGraph, ocdDocument.getAllPageCoords(page), visibleResourceIds),
        [ocdDocument, page, relationGraph, visibleResourceIds],
    )
    const relationInspectionRows = useMemo(
        () => buildRelationInspectionRows(relationGraph, ocdDocument.getAllPageCoords(page), visibleResourceIds),
        [ocdDocument, page, relationGraph, visibleResourceIds],
    )
    const filteredRelationParentConnectors = useMemo(
        () => relationOverlayVisible && relationParentVisible ? relationOverlayConnectors.parentConnectors : [],
        [relationOverlayConnectors.parentConnectors, relationOverlayVisible, relationParentVisible],
    )
    const filteredRelationAssociationConnectors = useMemo(
        () => relationOverlayVisible && relationAssociationVisible ? relationOverlayConnectors.associationConnectors : [],
        [relationOverlayConnectors.associationConnectors, relationAssociationVisible, relationOverlayVisible],
    )
    const renderedParentConnectors = useMemo(
        () => mergeConnectors(parentConnectors, filteredRelationParentConnectors),
        [filteredRelationParentConnectors, parentConnectors],
    )
    const renderedAssociationConnectors = useMemo(
        () => mergeConnectors(associationConnectors, filteredRelationAssociationConnectors),
        [associationConnectors, filteredRelationAssociationConnectors],
    )
    const visibleRelationCount = relationOverlayConnectors.parentConnectors.length + relationOverlayConnectors.associationConnectors.length
    const displayedRelationCount = filteredRelationParentConnectors.length + filteredRelationAssociationConnectors.length
    return {
        relationGraph,
        relationInspectionRows,
        renderedParentConnectors,
        renderedAssociationConnectors,
        hiddenEdgeCount: relationOverlayConnectors.hiddenEdgeCount,
        visibleRelationCount,
        displayedRelationCount,
    }
}
