/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import React from 'react'
import { OcdConsoleConfig } from '../components/OcdConsoleConfiguration'
import OcdDocument from '../components/OcdDocument'
import { OcdViewCoords } from '../model/OcdDesign'

export interface ResourceRectProps {
    ocdDocument: OcdDocument
    setOcdDocument: React.Dispatch<any>
    resource: OcdViewCoords
}

export interface ResourceForeignObjectProps {
    ocdDocument: OcdDocument
    setOcdDocument: React.Dispatch<any>
    resource: OcdViewCoords
}

export interface ResourceSvgProps {
    ocdDocument: OcdDocument
    setOcdDocument: React.Dispatch<any>
    resource: OcdViewCoords
}

export interface PaletteProps {
    ocdConsoleConfig: OcdConsoleConfig,
    setDragData: React.Dispatch<any>
    ocdDocument: OcdDocument
}
