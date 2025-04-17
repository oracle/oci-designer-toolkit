/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdCacheData } from "../components/OcdCache"
import { OcdConsoleConfig } from "../components/OcdConsoleConfiguration"
import { OcdDocument } from "../components/OcdDocument"
import { OcdActiveFile, OcdDragResource, OcdSelectedResourceModel, OcdSelectedResource, OcdSelectedResourceView } from "../types/Console"

export type OcdActiveFileContext = {
    activeFile: OcdActiveFile
    setActiveFile: (c: OcdActiveFile) => void
}

export type OcdCacheContext = {
    ocdCache: OcdCacheData
    setOcdCache: (c: OcdCacheData) => void
}

export type OcdConsoleConfigContext = {
    ocdConsoleConfig: OcdConsoleConfig
    setOcdConsoleConfig: (c: OcdConsoleConfig) => void
}

export type OcdDocumentContext = {
    ocdDocument: OcdDocument
    setOcdDocument: (c: OcdDocument) => void
}

export type OcdSelectedResourceContext = {
    selectedResource: OcdSelectedResource
    setSelectedResource: (c: OcdSelectedResource) => void
}

export type OcdSelectedModelContext = {
    selectedResourceModel: OcdSelectedResourceModel
    setSelectedResourceModel: (c: OcdSelectedResourceModel) => void
}

export type OcdSelectedViewContext = {
    selectedResourceView: OcdSelectedResourceView
    setSelectedResourceView: (c: OcdSelectedResourceView) => void
}

export type OcdDragResourceContext = {
    dragResource: OcdDragResource
    setDragResource: (c: OcdDragResource) => void
}

export type OcdDialogs = 'queryDialog' | 'resourceManagerDialog' | 'referenceDataQueryDialog' | ''

export type OcdDialogContext = {
    displayDialog: OcdDialogs
    setDisplayDialog: (c: OcdDialogs) => void
}
