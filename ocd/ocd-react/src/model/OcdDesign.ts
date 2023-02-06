/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

export interface OcdMetadata {
    ocd_version: string,
    ocd_schema_version: string,
    title: string,
    documentation: string,
    created: string,
    updated: string
}

export interface OcdTag {
    [key: string]: string
}


export interface OciTags {
    freeform?: OcdTag[],
    defined?: {[key: string]: OcdTag[]}[]
}

export interface OcdView {
    id: string,
    pages: OcdViewPage[]
}

export interface OcdViewCoords {
    id: string,
    pgid: string,
    ocid: string,
    pocid: string,
    x: number,
    y: number,
    w: number,
    h: number,
    title: string,
    class: string,
    container?: boolean,
    coords?: OcdViewCoords[]
}

export interface OcdViewLayer {
    id: string,
    class: string,
    visible: boolean,
    selected: boolean
}

export interface OcdPageLayer {
    id: string,
    ocid: string,
    title: string,
    class: string,
    visible: boolean,
    selected: boolean
}

export interface OcdViewPage {
    id: string,
    title: string,
    layers: OcdViewLayer[],
    coords: OcdViewCoords[],
    selected: boolean
}

export interface OcdVariable {
    name: string,
    default: string | number,
    description: string
}

export interface OcdResources {
    [key: string]: any[]
}

export interface OciResources {
    [key: string]: any[]
}

export interface OcdBaseModel {
    vars: OcdVariable[]
    resources: OcdResources
}

export interface OciModel extends OcdBaseModel {
    tags: OciTags,
}
export interface AwsModel extends OcdBaseModel {}
export interface AzureModel extends OcdBaseModel {}

export interface OcdDesign {
    metadata: OcdMetadata,
    model: {
        oci: OciModel,
        aws?: AwsModel,
        azure?: AzureModel
    },
    view: OcdView
}

