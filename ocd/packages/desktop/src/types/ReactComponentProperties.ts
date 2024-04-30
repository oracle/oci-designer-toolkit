/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import React, { MouseEventHandler } from 'react'
import { OcdConsoleConfig } from '../components/OcdConsoleConfiguration'
import OcdDocument from '../components/OcdDocument'
import { OcdResource, OcdResources, OcdViewConnector, OcdViewCoords, OciResource } from '@ocd/model'
import { DragData } from './DragData'
import { OcdContextMenu } from '../components/OcdCanvas'
import { OcdVariable } from '@ocd/model/src/OcdDesign'

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
    hidden: boolean
}

export interface ResourceForeignObjectProps {
    ocdConsoleConfig: OcdConsoleConfig
    ocdDocument: OcdDocument
    setOcdDocument: React.Dispatch<any>
    resource: OcdViewCoords
    hidden: boolean
    ghost?: boolean
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
    svgDragDropEvents: OcdMouseEvents
    resource: OcdViewCoords
    ghost?: boolean
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

export interface ConnectorSvgProps {
    ocdConsoleConfig: OcdConsoleConfig
    ocdDocument: OcdDocument
    connector: OcdViewConnector
    parentConnector: boolean
}

export interface OcdMouseEvents extends Record<string, MouseEventHandler<SVGGElement>> {}
// export interface OcdMouseEvents {
//     [key: string]: Function   
// }

export interface OciTabularResourceProps {
    ocdDocument: OcdDocument
    ociResources: OcdResources
    selected: string
}

export interface OciTabularContentsProps extends OciTabularResourceProps {
    columnTitles: string[]
    resourceElements: string[]
}

export interface OciTabularHeaderProps {
    columnTitles: string[]
    ociResources: OcdResources
    resourceElements: string[]
    selected: string
    sortColumn: string
    sortAscending: boolean
    onSortClick: React.Dispatch<any>
}

export interface OciTabularRowProps {
    ocdDocument: OcdDocument
    ociResources: OcdResources
    index: number
    resource: OcdResource
    resourceElements: string[]
}

export interface OcdVariableRowPropsNew {
    variable: OcdVariable
    onNameChange: React.Dispatch<any>
    onDefaultChange: React.Dispatch<any>
    onDescriptionChange: React.Dispatch<any>
    onDeleteClick: React.Dispatch<any>
}
export interface OcdVariableRowProps {
    ocdDocument: OcdDocument
    setOcdDocument: React.Dispatch<any>
    variable: OcdVariable
    // row: number
    onDeleteClick: React.Dispatch<any>
}
