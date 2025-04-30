/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { OcdResource, OcdViewCoords, OcdViewLayer, OcdViewPage } from "@ocd/model"
import { OcdConsoleConfig } from "../components/OcdConsoleConfiguration"
import { OcdDocument } from "../components/OcdDocument"

export interface ConsolePageProps {
    ocdDocument: OcdDocument
    setOcdDocument: React.Dispatch<any>
    ocdConsoleConfig: OcdConsoleConfig
    setOcdConsoleConfig: React.Dispatch<any>
}

export interface ConsoleMenuProps extends ConsolePageProps {
}

export interface ConsoleHeaderProps extends ConsolePageProps {
}

export interface ConsoleToolbarProps extends ConsolePageProps {
}

export interface PageBarPagesProps {
    ocdDocument: OcdDocument
    setOcdDocument: React.Dispatch<any>
}

export interface PageBarPageProps extends PageBarPagesProps {
    page: OcdViewPage
}

export interface PageBarMenuProps extends PageBarPagesProps {}

export interface LayerBarLayersProps {
    ocdDocument: OcdDocument
    setOcdDocument: React.Dispatch<any>
}

export interface LayerBarLayerProps extends LayerBarLayersProps {
    layer: OcdViewLayer
}

export interface LayerBarMenuProps extends LayerBarLayersProps {}

export interface HelpPageProps {
    helpText: string
}

export type OcdActiveFile = {
    name: string
    modified: boolean
}

export interface OcdSelectedResource {
    modelId: string
    pageId: string
    coordsId: string
    class: string
    model?: OcdResource
    page?: OcdViewPage
    coords?: OcdViewCoords
}

export interface OcdSelectedResourceModel {
    modelId: string | null
    model?: OcdResource
}

export interface OcdSelectedResourceView {
    modelId: string | null
    pageId: string | null
    coordsId: string | null
    class: string
    model?: OcdResource
    page?: OcdViewPage
    coords?: OcdViewCoords
}

export interface OcdDragResource {
    dragging: boolean
    modelId: string
    pageId: string
    coordsId: string
    class: string
    resource: OcdViewCoords
    parent?: OcdViewCoords
}
