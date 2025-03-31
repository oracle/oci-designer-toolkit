/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/
import { v4 as uuidv4 } from 'uuid'
import * as ociResources from './provider/oci/resources.js'
import { version } from './OcdModelVersion.js'
import { schemaVersion } from './OcdSchemaVersion.js'
import { OcdResource } from './OcdResource.js'
import { OciResource } from './provider/oci/OciResource.js'

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
    id?: string
    key: string
    value: string
}

export interface OciFreeformTag extends OcdTag {}

export interface OciDefinedTag extends OcdTag {
    namespace: string
}

export interface OcdTags {
    [key: string]: string
}

export interface OciFreeformTags extends OcdTags {}

export interface OciDefinedTags  {
    [key: string]: OcdTags
}

export interface OciTags {
    freeformTags?: OciFreeformTags,
    definedTags?: OciDefinedTags
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
    key: string
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

export interface AwsResources {
    [key: string]: any[]
}

export interface AzureResources {
    [key: string]: any[]
}

export interface GoogleResources {
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
export interface GoogleModel extends OcdBaseModel {}
export interface GeneralModel extends OcdBaseModel {}

export interface OcdDesign {
    metadata: OcdMetadata
    model: {
        oci: OciModel
        aws?: AwsModel
        azure: AzureModel
        google: GoogleModel
        general: GeneralModel
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
                title: 'Untitled - Open Cloud Design',
                documentation: '',
                created: `${date} ${time}`,
                updated: ''
            },
            model: {
                oci: {
                    tags: {
                        freeformTags: {},
                        definedTags: {}
                    },
                    vars: [],
                    resources: {
                        compartment: [compartment]
                    }
                },
                azure: {
                    vars: [],
                    resources: {}
                },
                google: {
                    vars: [],
                    resources: {}
                },
                general: {
                    vars: [],
                    resources: {}
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
    // Model Methods
    export function getResourceLists(design: OcdDesign) {return {...getOciResourceLists(design), ...getAzureResourceLists(design), ...getGoogleResourceLists(design), ...getGeneralResourceLists(design)}}
    export function getResources(design: OcdDesign) {return [...getOciResources(design), ...getAzureResources(design), ...getGoogleResources(design), ...getGeneralResources(design)]}
    export function getResource(design: OcdDesign, id='') {return getResources(design).find((r: OcdResource) => r.id === id)}
    export function getResourceParentId(design: OcdDesign, id: string): string {
        const resource = getResource(design, id)
        const parentId: string = (resource.provider === 'oci') ? OciResource.getParentId(resource) : ''
        return parentId
    }
    export function getResourceAssociationIds(design: OcdDesign, id: string): string[] {
        const resource = getResource(design, id)
        const associationIds: string[] = (resource.provider === 'oci') ? OciResource.getAssociationIds(resource, getResourceLists(design)) : []
        return associationIds
    }
    // Oci
    export function getOciResourceLists(design: OcdDesign) {return Object.hasOwn(design.model, 'oci') ? design.model.oci.resources : {}}
    export function getOciResourceList(design: OcdDesign, key: string) {return Object.hasOwn(design.model, 'oci') && Object.hasOwn(design.model.oci.resources, key) ? design.model.oci.resources[key] : []}
    export function getOciResources(design: OcdDesign) {return Object.hasOwn(design.model, 'oci') ? Object.values(design.model.oci.resources).filter((val) => Array.isArray(val)).reduce((a, v) => [...a, ...v], []) : []}
    // Azure
    export function getAzureResourceLists(design: OcdDesign) {return Object.hasOwn(design.model, 'azure') ? design.model.azure.resources : {}}
    export function getAzureResourceList(design: OcdDesign, key: string) {return Object.hasOwn(design.model, 'azure') && Object.hasOwn(design.model.azure.resources, key) ? design.model.azure.resources[key] : []}
    export function getAzureResources(design: OcdDesign) {return Object.hasOwn(design.model, 'azure') ? Object.values(design.model.azure.resources).filter((val) => Array.isArray(val)).reduce((a, v) => [...a, ...v], []) : []}
    // Google
    export function getGoogleResourceLists(design: OcdDesign) {return Object.hasOwn(design.model, 'google') ? design.model.google.resources : {}}
    export function getGoogleResourceList(design: OcdDesign, key: string) {return Object.hasOwn(design.model, 'google') && Object.hasOwn(design.model.google.resources, key) ? design.model.google.resources[key] : []}
    export function getGoogleResources(design: OcdDesign) {return Object.hasOwn(design.model, 'google') ? Object.values(design.model.google.resources).filter((val) => Array.isArray(val)).reduce((a, v) => [...a, ...v], []) : []}
    // Shapes (General)
    export function getGeneralResourceLists(design: OcdDesign) {return Object.hasOwn(design.model, 'general') ? design.model.general.resources : {}}
    export function getGeneralResourceList(design: OcdDesign, key: string) {return Object.hasOwn(design.model, 'general') && Object.hasOwn(design.model.general.resources, key) ? design.model.general.resources[key] : []}
    export function getGeneralResources(design: OcdDesign) {return Object.hasOwn(design.model, 'general') ? Object.values(design.model.general.resources).filter((val) => Array.isArray(val)).reduce((a, v) => [...a, ...v], []) : []}

    // View Methods
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
    export function duplicateCoords(coords: OcdViewCoords): OcdViewCoords {
        return {
            id: `gid-${uuidv4()}`,
            pgid: coords.pgid,
            ocid: coords.ocid,
            pocid: coords.pocid,
            x: coords.x,
            y: coords.y,
            w: coords.w,
            h: coords.h,
            title: coords.title,
            class: coords.class,
            showParentConnection: coords.showParentConnection,
            showConnections: coords.showConnections
        }
    }
    export function getAllCoords(design: OcdDesign): OcdViewCoords[] {return design.view.pages.map(p => [...p.coords, ...getChildCoords(p.coords)]).reduce((a, c) => [...a, ...c], [])}
    export function getAllPageCoords (page: OcdViewPage) {return getChildCoords(page.coords)}
    export function getCoords(design: OcdDesign, id: string) {return getAllCoords(design).find(c => c.id === id)}
    export function getChildCoords(coords?: OcdViewCoords[]): OcdViewCoords[] {return coords ? coords.reduce((a, c) => [...a, ...getChildCoords(c.coords)], coords) : []}
    export function getCoordsRelativeXY(design: OcdDesign, coords: OcdViewCoords): OcdViewPoint { // Relative to root x: 0, y: 0
        const parentCoords: OcdViewCoords | undefined = getCoords(design, coords.pgid)
        let relativeXY: OcdViewPoint = {x: coords.x, y: coords.y}
        if (parentCoords) {
            const parentXY = getCoordsRelativeXY(design, parentCoords)
            relativeXY.x += parentXY.x
            relativeXY.y += parentXY.y
        }
        return relativeXY
    }

    // Variables Methods
    export function newVariable(): OcdVariable {
        return {
            key: uuidv4(),
            name: '',
            default: '',
            description: ''
        }
    }

    // Tag Methods
    export function newOciFreeformTag(): OciFreeformTag {
        return {
            // id: uuidv4(),
            key: `Key${uuidv4().slice(-4)}`,
            value: ''
        }
    }
    export function newOciDefinedTag(): OciDefinedTag {
        return {
            ...newOciFreeformTag(),
            namespace: 'Namespace'
        }
    }
    export function ociFreeformTagsToArray(freeformTags: OciFreeformTags | undefined): OciFreeformTag[] {
        return freeformTags ? Object.entries(freeformTags).map(([k, v]) => {return {key: k, value: v}}) : [] 
    }
    export function ociFreeformTagArrayToTags(freeformTags: OciFreeformTag[]): OciFreeformTags {
        return freeformTags.reduce((a, c) => {a[c.key] = c.value; return a}, {} as OciFreeformTags)
    }
    export function ociFreeformTagsToString(tags: OciFreeformTags): string {
        return tags ? Object.entries(tags).map(([k, v]) => `${k}: ${v}`).join('\n') : ''
    }
    export function ociDefinedTagsToArray(definedTags: OciDefinedTags | undefined): OciDefinedTag[] {
        return definedTags ? Object.entries(definedTags).reduce((a, [nk, nv]) => {return [...a, ...Object.entries(nv).map(([k, v]) => {return {namespace: nk, key: k, value: v}})]}, [] as OciDefinedTag[]) : []
    }
    export function ociDefinedTagArrayToTags(definedTags: OciDefinedTag[]): OciDefinedTags {
        return definedTags.reduce((a, c) => {a[c.namespace] ? a[c.namespace][c.key] = c.value : a[c.namespace] = {[c.key]: c.value}; return a}, {} as OciDefinedTags)
    }
    export function ociDefinedTagsToString(tags: OciDefinedTags): string {
        return tags ? Object.keys(tags).sort((a, b) => a.localeCompare(b)).flatMap((n) => Object.entries(tags[n]).map(([k, v]) => `${n}.${k}: ${v}`)).join('\n') : ''
    }
}

