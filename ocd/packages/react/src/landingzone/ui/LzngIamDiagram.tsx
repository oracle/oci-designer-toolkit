/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** React-Flow IAM compartment diagram for the Review step. Renders the One-OE
** compartment tree from the generated `iam.json`:
**
**   tenancy (root)
**     └─ Landing Zone
**          └─ Shared infra compartments (cmp-lz-network / -security / -platform)
**          └─ per-environment compartments (cmp-lz-<env>-{network,platform,projects,security})
**               └─ their children (project / platform compartments)
**
** It walks the compartment tree returned by buildCompartmentDiagram and lays it
** out as a simple top-down hierarchy. Read-only; dotted Background + Controls.
*/

import React, { useMemo } from 'react'
import {
    Background,
    BackgroundVariant,
    Controls,
    Edge,
    MiniMap,
    Node,
    ReactFlow,
} from '@xyflow/react'
import { DiagramNode, buildCompartmentDiagram } from '../OcdLzCompartmentDiagram'

const NODE_WIDTH = 200
const NODE_HEIGHT = 52
const COL_GAP = 36
const ROW_GAP = 70

export interface LzngIamDiagramProps {
    iamJson: string
}

interface Placed {
    node: DiagramNode
    parentId: string | null
    depth: number
    leafIndex: number
}

function countLeaves(node: DiagramNode): number {
    if (node.children.length === 0) return 1
    return node.children.reduce((sum, child) => sum + countLeaves(child), 0)
}

// Flatten the tree, assigning each node a horizontal "leaf slot" range midpoint
// so parents centre over their descendants.
function placeTree(node: DiagramNode, parentId: string | null, depth: number, startLeaf: number, out: Placed[]): number {
    if (node.children.length === 0) {
        out.push({ node, parentId, depth, leafIndex: startLeaf })
        return startLeaf + 1
    }
    let cursor = startLeaf
    const childStart = cursor
    for (const child of node.children) {
        cursor = placeTree(child, node.key, depth + 1, cursor, out)
    }
    const childEnd = cursor - 1
    out.push({ node, parentId, depth, leafIndex: (childStart + childEnd) / 2 })
    return cursor
}

function buildFlow(iamJson: string): { nodes: Node[]; edges: Edge[]; empty: boolean } {
    const diagram = buildCompartmentDiagram(iamJson)
    const root = diagram.root
    if (!root) return { nodes: [], edges: [], empty: true }

    const placed: Placed[] = []
    placeTree(root, null, 0, 0, placed)

    const nodes: Node[] = placed.map((item) => {
        const isRoot = item.depth === 0
        const className = isRoot
            ? 'ocd-lzng-rf-node ocd-lzng-rf-tenancy'
            : `ocd-lzng-rf-node ocd-lzng-rf-cmp${item.node.children.length > 0 ? ' ocd-lzng-rf-cmp-parent' : ''}`
        return {
            id: item.node.key,
            position: {
                x: item.leafIndex * (NODE_WIDTH + COL_GAP),
                y: item.depth * (NODE_HEIGHT + ROW_GAP),
            },
            data: {
                label: (
                    <span>
                        {item.node.name}
                        {item.node.description && (
                            <span className='ocd-lzng-rf-node-sub'>{item.node.description}</span>
                        )}
                    </span>
                ),
            },
            className,
            style: { width: NODE_WIDTH, height: NODE_HEIGHT },
            draggable: false,
        }
    })

    const edges: Edge[] = placed
        .filter((item) => item.parentId)
        .map((item) => ({
            id: `iam-edge-${item.parentId}-${item.node.key}`,
            source: item.parentId as string,
            target: item.node.key,
            style: { stroke: '#9aa0a6' },
        }))

    return { nodes, edges, empty: false }
}

export function LzngIamDiagram({ iamJson }: LzngIamDiagramProps): JSX.Element {
    const { nodes, edges, empty } = useMemo(() => buildFlow(iamJson), [iamJson])

    if (empty) {
        return <p className='ocd-lzng-placeholder'>No compartments found in the generated iam.json.</p>
    }

    return (
        <div data-testid='lzng-iam-diagram'>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
                proOptions={{ hideAttribution: true }}
            >
                <Background variant={BackgroundVariant.Dots} gap={18} size={1} color='#d8d8d8' />
                <Controls showInteractive={false} />
                <MiniMap pannable zoomable nodeColor='#C74634' maskColor='rgba(245,245,245,0.7)' />
            </ReactFlow>
        </div>
    )
}
