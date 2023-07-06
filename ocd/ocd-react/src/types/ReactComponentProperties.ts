/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import React from 'react'
import { OcdConsoleConfig } from '../components/OcdConsoleConfiguration'
import OcdDocument from '../components/OcdDocument'
import { OcdViewCoords } from '../model/OcdDesign'
import { DragData } from './DragData'
import { OcdContextMenu } from '../components/OcdCanvas'

export interface CanvasProps {
    dragData: DragData
    setDragData: React.Dispatch<any>
    ocdConsoleConfig: OcdConsoleConfig
    ocdDocument: OcdDocument
    setOcdDocument: React.Dispatch<any>
}

export interface ResourceRectProps {
    ocdConsoleConfig: OcdConsoleConfig
    ocdDocument: OcdDocument
    setOcdDocument: React.Dispatch<any>
    resource: OcdViewCoords
}

export interface ResourceForeignObjectProps {
    ocdConsoleConfig: OcdConsoleConfig
    ocdDocument: OcdDocument
    setOcdDocument: React.Dispatch<any>
    resource: OcdViewCoords
}

export interface ResourceSvgGhostProps {
    ocdConsoleConfig: OcdConsoleConfig
    ocdDocument: OcdDocument
    setOcdDocument: React.Dispatch<any>
    resource: OcdViewCoords
}

export interface ResourceSvgProps {
    ocdConsoleConfig: OcdConsoleConfig
    ocdDocument: OcdDocument
    setOcdDocument: React.Dispatch<any>
    contextMenu: OcdContextMenu
    setContextMenu: React.Dispatch<any>
    resource: OcdViewCoords
}

export interface ResourceSvgContextMenuProps {
    contextMenu: {show: boolean, x: number, y: number}
    setContextMenu: React.Dispatch<any>
    ocdDocument: OcdDocument
    setOcdDocument: React.Dispatch<any>
    resource: OcdViewCoords
}

export interface PaletteProps {
    ocdConsoleConfig: OcdConsoleConfig,
    setDragData: React.Dispatch<any>
    ocdDocument: OcdDocument
}

export interface OcdMouseEvents extends Record<string, Function> {}
// export interface OcdMouseEvents {
//     [key: string]: Function   
// }