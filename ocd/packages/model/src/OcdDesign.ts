/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/
import { v4 as uuidv4 } from 'uuid'
import * as ociResources from './provider/oci/resources'
import { version } from './OcdModelVersion'
import { schemaVersion } from './OcdSchemaVersion'

export interface OcdMetadata {
    ocdVersion: string,
    ocdSchemaVersion: string,
    ocdModelId: string,
    platform: 'oci' | 'pca'
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
    showParentConnection: boolean
    showConnections: boolean
    container?: boolean,
    coords?: OcdViewCoords[]
    style?: OcdViewCoordsStyle
    detailsStyle?: 'default' | 'simple' | 'detailed'
}

export interface OcdViewConnector {
    startCoordsId: string
    endCoordsId: string
}

export interface OcdViewCoordsStyle {
    fill?: string,
    stroke?: string,
    strokeDasharray?: string
    strokeWidth?: string
    strokeOpacity?: string
    opacity?: string
}

export interface OcdViewPoint {
    x: number,
    y: number
}

export interface OcdViewLayer {
    id: string,
    class: string,
    visible: boolean,
    selected: boolean,
    style?: OcdViewCoordsStyle
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
    id: string
    title: string
    documentation: string
    layers: OcdViewLayer[]
    coords: OcdViewCoords[]
    connectors: OcdViewConnector[]
    selected: boolean
    grid: boolean
    transform: number[]
}

export interface OcdUserDefined extends Record<string, any> {
    terraform?: string
    ansible?: string
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
    view: OcdView,
    userDefined: OcdUserDefined
}

export namespace OcdDesign {
    export function newDesign(): OcdDesign {
        const today = new Date();
        const date = `${today.getFullYear()}-${(today.getMonth() + 1)}-${today.getDate()}`;
        const time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
        const compartment = ociResources.OciCompartment.newResource()
        const layer: OcdViewLayer = {
            id: compartment.id,
            class: 'oci-compartment',
            visible: true,
            selected: true
        } 
        return {
            metadata: {
                ocdVersion: version,
                ocdSchemaVersion: schemaVersion,
                ocdModelId: `ocd-model-${uuidv4()}`,
                platform: 'oci',
                title: 'Open Cloud Architecture',
                documentation: '',
                created: `${date} ${time}`,
                updated: ''
            },
            model: {
                oci: {
                    tags: {},
                    vars: [],
                    resources: {
                        compartment: [compartment]
                    }
                }
            },
            view: {
                id: `view-${uuidv4()}`,
                pages: [
                    {
                        id: `page-${uuidv4()}`,
                        title: 'Open Cloud Design',
                        documentation: '',
                        layers: [layer],
                        coords: [],
                        connectors: [],
                        selected: true,
                        grid: false,
                        transform: OcdDesign.resetPanZoom()
                    }
                ]
            },
            userDefined: {}
        }
    }
    export function resetPanZoom(): number[] {
        return [1, 0, 0, 1, 0, 0]
    }
    export function newCoords(): OcdViewCoords {
        return {
            id: `gid-${uuidv4()}`,
            pgid: '',
            ocid: '',
            pocid: '',
            x: 0,
            y: 0,
            w: 0,
            h: 0,
            title: '',
            class: '',
            showParentConnection: true,
            showConnections: true
        }
    }
}

