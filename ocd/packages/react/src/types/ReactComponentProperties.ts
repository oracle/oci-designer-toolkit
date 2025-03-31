/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import React, { MouseEventHandler } from 'react'
import { OcdConsoleConfig } from '../components/OcdConsoleConfiguration'
import OcdDocument from '../components/OcdDocument'
import { OcdResource, OcdResources, OcdViewConnector, OcdViewCoords, OcdVariable, OciDefinedTag, OciFreeformTag } from '@ocd/model'
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
    hidden: boolean
    setOrigin: React.Dispatch<any>
}

export type point = {x: number, y: number}

export interface ResourceForeignObjectProps {
    ocdConsoleConfig: OcdConsoleConfig
    ocdDocument: OcdDocument
    setOcdDocument: React.Dispatch<any>
    resource: OcdViewCoords
    hidden: boolean
    ghost?: boolean
    origin: point
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

export interface OcdTabularResourceProps {
    ocdDocument: OcdDocument
    ocdResources?: OcdResources
    selected: string
}

export interface OciTabularResourceProps extends OcdTabularResourceProps {
    ociResources: OcdResources
}

export interface AzureTabularResourceProps extends OcdTabularResourceProps {
    azureResources: OcdResources
}

export interface GoogleTabularResourceProps extends OcdTabularResourceProps {
    googleResources: OcdResources
}

export interface OcdTabularContentsProps extends OcdTabularResourceProps {
    columnTitles: string[]
    resourceElements: string[]
}

export interface OciTabularContentsProps extends OciTabularResourceProps {
    columnTitles: string[]
    resourceElements: string[]
}

export interface AzureTabularContentsProps extends AzureTabularResourceProps {
    columnTitles: string[]
    resourceElements: string[]
}

export interface GoogleTabularContentsProps extends GoogleTabularResourceProps {
    columnTitles: string[]
    resourceElements: string[]
}

export interface OcdTabularHeaderProps {
    columnTitles: string[]
    ocdResources?: OcdResources
    resourceElements: string[]
    selected: string
    sortColumn: string
    sortAscending: boolean
    onSortClick: React.Dispatch<any>
    displayColumns: string[]
    setDisplayColumns: React.Dispatch<any>
}

export interface OciTabularHeaderProps extends OcdTabularHeaderProps {
    ociResources: OcdResources
}

export interface AzureTabularHeaderProps extends OcdTabularHeaderProps {
    azureResources: OcdResources
}

export interface GoogleTabularHeaderProps extends OcdTabularHeaderProps {
    googleResources: OcdResources
}

export interface OcdTabularRowProps {
    ocdDocument: OcdDocument
    ocdResources?: OcdResources
    index: number
    resource: OcdResource
    resourceElements: string[]
    displayColumns: string[]
    selected: string
}

export interface OciTabularRowProps extends OcdTabularRowProps {
    ociResources: OcdResources
}

export interface AzureTabularRowProps extends OcdTabularRowProps {
    azureResources: OcdResources
}

export interface GoogleTabularRowProps extends OcdTabularRowProps {
    googleResources: OcdResources
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

export interface OciDefinedTagRowProps {
    ocdDocument: OcdDocument
    setOcdDocument: React.Dispatch<any>
    tag: OciDefinedTag
    // row: number
    onDeleteClick: React.Dispatch<any>
    onDefinedNamespaceChange: (oldNamespace: string, newNamespace: string, key: string) => any
    onDefinedKeyChange: (namespace: string, oldKey: string, newKey: string) => any
    onDefinedValueChange: (namespace: string, key: string, value: string) => any
}

export interface OciFreeformTagRowProps {
    ocdDocument: OcdDocument
    setOcdDocument: React.Dispatch<any>
    tag: OciFreeformTag
    // row: number
    onDeleteClick: React.Dispatch<any>
    onFreeformKeyChange: (oldKey: string, newKey: string) => any
    onFreeformValueChange: (key: string, value: string) => any
}
