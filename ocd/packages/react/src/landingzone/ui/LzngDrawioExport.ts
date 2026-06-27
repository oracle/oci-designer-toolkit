/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Exports the live Landing Zone network diagram as drawio (mxGraph) XML. Emits a
** dashed region container holding a red-tinted Hub VCN box (with its per-kind
** subnet list) and one spoke container per environment (green tint when its
** security zone is on), each holding project and platform/extension boxes. The
** output opens directly in app.diagrams.net / the OCD drawio renderer.
*/

import { LzngDiagramEnvNode, LzngDiagramModel } from './LzngDiagramModel'

function escapeXml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
}

const REGION_PAD_X = 24
const REGION_PAD_TOP = 48
const HUB_WIDTH = 200
const ENV_WIDTH = 220
const ENV_GAP = 24
const ENV_HEAD = 56
const CHILD_HEIGHT = 44
const CHILD_GAP = 12
const CHILD_PAD_X = 16

function envHeight(env: LzngDiagramEnvNode): number {
    const childCount = env.projects.length + env.platforms.length
    const body = childCount > 0 ? childCount * CHILD_HEIGHT + (childCount - 1) * CHILD_GAP : 8
    return ENV_HEAD + body + 16
}

function box(id: string, value: string, parent: string, x: number, y: number, w: number, h: number, style: string): string {
    return (
        `<mxCell id="${escapeXml(id)}" value="${escapeXml(value)}" style="${style}" vertex="1" parent="${escapeXml(parent)}">` +
        `<mxGeometry x="${x}" y="${y}" width="${w}" height="${h}" as="geometry"/></mxCell>`
    )
}

export function buildDrawioXml(model: LzngDiagramModel): string {
    const envHeights = model.environments.map(envHeight)
    const tallest = envHeights.length > 0 ? Math.max(...envHeights) : 0
    const hubHeight = 64 + (model.hubSubnets.length > 0 ? 18 : 0)
    const innerWidth = HUB_WIDTH + ENV_GAP + model.environments.length * (ENV_WIDTH + ENV_GAP)
    const regionWidth = Math.max(innerWidth + REGION_PAD_X * 2, HUB_WIDTH + REGION_PAD_X * 2)
    const regionHeight = REGION_PAD_TOP + Math.max(hubHeight, tallest) + 24

    const cells: string[] = []

    cells.push(box(
        'region', model.regionLabel, '1', 40, 40, regionWidth, regionHeight,
        'rounded=1;dashed=1;dashPattern=6 6;verticalAlign=top;align=left;spacingLeft=12;spacingTop=8;' +
        'fontStyle=1;fontColor=#5C5C5C;strokeColor=#5C5C5C;fillColor=#F5F5F5;',
    ))

    const hubLabel = `${model.hubLabel}&#10;${model.hubVcn}` +
        (model.hubSubnets.length > 0 ? `&#10;${model.hubSubnets.join(' · ')}` : '')
    cells.push(box(
        'hub', hubLabel, 'region', REGION_PAD_X, REGION_PAD_TOP, HUB_WIDTH, hubHeight,
        'rounded=1;whiteSpace=wrap;html=1;fontStyle=1;fontColor=#A63D2E;strokeColor=#C74634;fillColor=#FBEAE7;',
    ))

    model.environments.forEach((env, index) => {
        const x = REGION_PAD_X + HUB_WIDTH + ENV_GAP + index * (ENV_WIDTH + ENV_GAP)
        const fill = env.secure ? '#E8F5E9' : '#FFFFFF'
        const stroke = env.secure ? '#2e7d32' : '#E0E0E0'
        const fontColor = env.secure ? '#2e7d32' : '#312D2A'
        const sub = `${env.spokeVcn || 'no spoke'}${env.secure ? ' · security zone' : ''}`
        cells.push(box(
            env.id, `${env.name}&#10;${sub}`, 'region', x, REGION_PAD_TOP, ENV_WIDTH, envHeights[index],
            `rounded=1;whiteSpace=wrap;html=1;verticalAlign=top;spacingTop=6;fontStyle=1;fontColor=${fontColor};` +
            `strokeColor=${stroke};fillColor=${fill};`,
        ))
        cells.push(
            `<mxCell id="edge-${escapeXml(env.id)}" style="endArrow=none;strokeColor=#C74634;" ` +
            `edge="1" parent="region" source="hub" target="${escapeXml(env.id)}">` +
            `<mxGeometry relative="1" as="geometry"/></mxCell>`,
        )

        let childY = ENV_HEAD
        const childW = ENV_WIDTH - CHILD_PAD_X * 2
        env.projects.forEach((proj, projIndex) => {
            cells.push(box(
                `${env.id}-proj-${projIndex}`, `${proj}&#10;project`, env.id, CHILD_PAD_X, childY, childW, CHILD_HEIGHT,
                'rounded=1;whiteSpace=wrap;html=1;fontColor=#312D2A;strokeColor=#C9C9C9;fillColor=#FFFFFF;',
            ))
            childY += CHILD_HEIGHT + CHILD_GAP
        })
        env.platforms.forEach((plat) => {
            cells.push(box(
                plat.id, `${plat.name}&#10;${plat.vcn}`, env.id, CHILD_PAD_X, childY, childW, CHILD_HEIGHT,
                'rounded=1;whiteSpace=wrap;html=1;fontColor=#0a5fb4;strokeColor=#0a5fb4;fillColor=#E8F1FB;',
            ))
            childY += CHILD_HEIGHT + CHILD_GAP
        })
    })

    return `<mxGraphModel dx="800" dy="600" grid="1" gridSize="10" guides="1" tooltips="1" ` +
        `connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1100" pageHeight="700" ` +
        `math="0" shadow="0"><root>` +
        `<mxCell id="0"/><mxCell id="1" parent="0"/>` +
        cells.join('') +
        `</root></mxGraphModel>`
}
