/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Live network-diagram card built on @xyflow/react (React-Flow v12). The graph
** is derived from the full Landing Zone config via buildDiagramModel and updates
** live as the wizard config changes:
**
**   - a dashed Region container parent node, holding
**   - a red-tinted Hub VCN node (with its per-kind subnet list), and
**   - one spoke container per environment (green tint when its security zone is
**     on), each holding project nodes and platform/extension nodes.
**
** Read-only (no interactive editing); dotted-grid Background, zoom Controls and a
** MiniMap are provided.
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
import { LandingZoneConfig } from '../OcdLzConfig'
import { LzngDiagramEnvNode, buildDiagramModel } from './LzngDiagramModel'

const REGION_PAD_X = 28
const REGION_PAD_TOP = 46
const HUB_WIDTH = 200
const ENV_WIDTH = 220
const ENV_GAP = 26
const ENV_HEAD = 56
const CHILD_HEIGHT = 46
const CHILD_GAP = 12
const CHILD_PAD_X = 16
const CHILD_TOP = ENV_HEAD

export interface LzngNetworkDiagramProps {
    config: LandingZoneConfig
}

function envHeight(env: LzngDiagramEnvNode): number {
    const childCount = env.projects.length + env.platforms.length
    const body = childCount > 0 ? childCount * CHILD_HEIGHT + (childCount - 1) * CHILD_GAP : 8
    return CHILD_TOP + body + 16
}

function buildFlow(config: LandingZoneConfig): { nodes: Node[]; edges: Edge[] } {
    const model = buildDiagramModel(config)
    const hubHeight = REGION_PAD_TOP + 56 + (model.hubSubnets.length > 0 ? 22 : 0)
    const envHeights = model.environments.map(envHeight)
    const tallestEnv = envHeights.length > 0 ? Math.max(...envHeights) : 0
    const innerWidth = HUB_WIDTH + ENV_GAP + model.environments.length * (ENV_WIDTH + ENV_GAP)
    const regionWidth = Math.max(innerWidth + REGION_PAD_X * 2, HUB_WIDTH + REGION_PAD_X * 2)
    const regionHeight = REGION_PAD_TOP + Math.max(hubHeight, tallestEnv) + 28

    const nodes: Node[] = [
        {
            id: 'region',
            position: { x: 0, y: 0 },
            data: { label: model.regionLabel },
            className: 'ocd-lzng-rf-region',
            style: { width: regionWidth, height: regionHeight },
            selectable: false,
            draggable: false,
        },
        {
            id: 'hub',
            parentId: 'region',
            extent: 'parent',
            position: { x: REGION_PAD_X, y: REGION_PAD_TOP },
            data: {
                label: (
                    <span>
                        {model.hubLabel}
                        <span className='ocd-lzng-rf-node-sub'>{model.hubVcn}</span>
                        {model.hubSubnets.length > 0 && (
                            <span className='ocd-lzng-rf-node-sub'>{model.hubSubnets.join(' · ')}</span>
                        )}
                    </span>
                ),
            },
            className: 'ocd-lzng-rf-node ocd-lzng-rf-hub',
            style: { width: HUB_WIDTH, height: hubHeight - REGION_PAD_TOP },
            draggable: false,
        },
    ]

    const edges: Edge[] = []

    model.environments.forEach((env, index) => {
        const x = REGION_PAD_X + HUB_WIDTH + ENV_GAP + index * (ENV_WIDTH + ENV_GAP)
        const height = envHeights[index]
        nodes.push({
            id: env.id,
            parentId: 'region',
            extent: 'parent',
            position: { x, y: REGION_PAD_TOP },
            data: {
                label: (
                    <span>
                        {env.name}
                        <span className='ocd-lzng-rf-node-sub'>
                            {env.spokeVcn || 'no spoke'}{env.secure ? ' · security zone' : ''}
                        </span>
                    </span>
                ),
            },
            className: `ocd-lzng-rf-spoke${env.secure ? ' ocd-lzng-rf-secure' : ''}`,
            style: { width: ENV_WIDTH, height },
            draggable: false,
        })
        edges.push({
            id: `edge-${env.id}`,
            source: 'hub',
            target: env.id,
            style: { stroke: '#C74634' },
        })

        let childY = CHILD_TOP
        env.projects.forEach((proj, projIndex) => {
            nodes.push({
                id: `${env.id}-proj-${projIndex}`,
                parentId: env.id,
                extent: 'parent',
                position: { x: CHILD_PAD_X, y: childY },
                data: {
                    label: (
                        <span>
                            {proj}
                            <span className='ocd-lzng-rf-node-sub'>project</span>
                        </span>
                    ),
                },
                className: 'ocd-lzng-rf-child ocd-lzng-rf-project',
                style: { width: ENV_WIDTH - CHILD_PAD_X * 2, height: CHILD_HEIGHT },
                draggable: false,
            })
            childY += CHILD_HEIGHT + CHILD_GAP
        })
        env.platforms.forEach((plat) => {
            nodes.push({
                id: plat.id,
                parentId: env.id,
                extent: 'parent',
                position: { x: CHILD_PAD_X, y: childY },
                data: {
                    label: (
                        <span>
                            {plat.name}
                            <span className='ocd-lzng-rf-node-sub'>{plat.vcn}</span>
                        </span>
                    ),
                },
                className: 'ocd-lzng-rf-child ocd-lzng-rf-platform',
                style: { width: ENV_WIDTH - CHILD_PAD_X * 2, height: CHILD_HEIGHT },
                draggable: false,
            })
            childY += CHILD_HEIGHT + CHILD_GAP
        })
    })

    return { nodes, edges }
}

export function LzngNetworkDiagram({ config }: LzngNetworkDiagramProps): JSX.Element {
    const { nodes, edges } = useMemo(() => buildFlow(config), [config])

    return (
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
    )
}
