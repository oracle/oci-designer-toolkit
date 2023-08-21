/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { v4 as uuidv4 } from 'uuid'
import * as ociResources from '../model/provider/oci/resources'
import { OcdDesign, OcdViewPage, OcdViewCoords, OcdViewLayer, OcdBaseModel, OcdViewPoint, OcdViewCoordsStyle } from '../model/OcdDesign'
import { PaletteResource } from '../model/OcdPalette'
import { OcdResource } from '../model/OcdResource'
import { OcdAutoLayout } from './OcdAutoLayout'
import { OcdUtils } from '../utils/OcdUtils'
import { OciResource } from '../model/provider/oci/OciResource'

export interface OcdSelectedResource {
    modelId: string
    pageId: string
    coordsId: string
    class: string
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

export class OcdDocument {
    query: boolean
    design: OcdDesign
    selectedResource: OcdSelectedResource
    dragResource: OcdDragResource
    constructor(design?: string | OcdDesign, resource?: OcdSelectedResource, dragResource?: OcdDragResource) {
        if (typeof design === 'string' && design.length > 0) this.design = JSON.parse(design)
        else if (design instanceof Object) this.design = design
        else this.design = this.newDesign()
        this.selectedResource = resource ? resource : this.newSelectedResource()
        this.dragResource = dragResource ? dragResource : this.newDragResource()
        this.query = false
    }

    static new = () => new OcdDocument()

    static clone = (ocdDocument:OcdDocument) => new OcdDocument(ocdDocument.design, ocdDocument.selectedResource, ocdDocument.dragResource)

    newDesign = (): OcdDesign => OcdDesign.newDesign()

    newSelectedResource(): OcdSelectedResource {
        return {
            modelId: '',
            pageId: '',
            coordsId: '',
            class: 'ocd-image'
        }
    }
    newDragResource(dragging:boolean=false): OcdDragResource {
        return {
            dragging: dragging,
            modelId: '',
            pageId: '',
            coordsId: '',
            class: 'ocd-image',
            resource: this.newCoords()
        }
    }
    getSelectedResource = () => this.getResource(this.selectedResource.modelId)
    getSelectedResourceCoords = () => this.getCoords(this.selectedResource.coordsId)

    getParentResource = () => this.getResource(this.dragResource.modelId)
    getParentResourceCoords = () => this.getCoords(this.dragResource.coordsId)

    getOciResourceList(key: string) {return this.design.model.oci.resources[key] ? this.design.model.oci.resources[key] : []}
    getOciResources() {return Object.values(this.design.model.oci.resources).filter((val) => Array.isArray(val)).reduce((a, v) => [...a, ...v], [])}
    getResources() {return this.getOciResources()}
    getResource(id='') {return this.getResources().find((r: OcdResource) => r.id === id)}
    addResource(paletteResource: PaletteResource, compartmentId: string) {
        const resourceList = paletteResource.class.split('-').slice(1).join('_')
        const resourceClass = paletteResource.class.toLowerCase().split('-').map((w) => `${w.charAt(0).toUpperCase()}${w.slice(1)}`).join('')
        const resourceNamespace: string = `${resourceClass}`
        const resourceClient: string = `${resourceClass}`
        // console.info('OcdDocument: List:', resourceList, 'Class:', resourceClass, 'Client:', resourceClient)
        // console.info(`OcdDocument: ociResource`, ociResources)
        let modelResource = undefined
        if (paletteResource.provider === 'oci') {
            modelResource = {id: `ocd-${paletteResource.class}-${uuidv4()}`}
            // @ts-ignore 
            const client = ociResources[resourceNamespace]
            if (client) {
                modelResource = client.newResource()
                modelResource.compartmentId = compartmentId
                console.info(modelResource)
                this.design.model.oci.resources[resourceList] ? this.design.model.oci.resources[resourceList].push(modelResource) : this.design.model.oci.resources[resourceList] = [modelResource]
            } else {
                alert(`Resource ${resourceClass} has not yet been implemented.`)
            }
        } else {
            alert(`Provider ${paletteResource.provider} has not yet been implemented.`)
        }
        // console.info('OcdDocument: Added Resource:', modelResource)
        return modelResource
    }
    removeResource(id: string) {
        // Delete from Model
        Object.values(this.design.model).forEach((provider: OcdBaseModel) => Object.entries(provider.resources).forEach(([k, v]) => provider.resources[k] = v.filter((r: OcdResource) => r.id !== id)))
        // Remove from Page Level
        this.design.view.pages.forEach((page: OcdViewPage) => {
            const pageResources = page.coords.filter((coords: OcdViewCoords) => coords.ocid === id)
            pageResources.forEach((coords: OcdViewCoords) => this.removeCoords(coords, page.id, coords.pgid))
        })
        // Remove Nested
        const allCoords = this.getAllCoords()
        allCoords.filter(c => c.ocid === id).forEach((c) => {
            const parent = this.getCoords(c.pgid)
            if (parent && parent.coords) parent.coords = parent.coords.filter(c => c.ocid !== id)
        })
    }
    cloneResource(id: string) {
        const resource: OcdResource = this.getResource(id)
        const provider: string = resource.provider
        const resourceList: string = resource.resourceTypeName.toLowerCase().split(' ').join('_')
        const resourceNamespace: string = `${OcdUtils.toTitleCase(provider)}${resource.resourceType}`
        let cloneResource = undefined
        if (provider === 'oci') {
            // @ts-ignore 
            const client = ociResources[resourceNamespace]
            if (client) {
                cloneResource = client.cloneResource(resource)
                console.info(cloneResource)
                this.design.model.oci.resources[resourceList] ? this.design.model.oci.resources[resourceList].push(cloneResource) : this.design.model.oci.resources[resourceList] = [cloneResource]
            }
        } else {
            alert(`Provider ${provider} has not yet been implemented.`)
        }
        return cloneResource
    }
    getDisplayName(id: string): string {
        const resource = this.getResource(id)
        return resource ? resource.name ? resource.name : resource.displayName : ''
    }
    setDisplayName(id: string, displayName: string) {
        const resource = this.getResource(id)
        if (resource) {
            resource.name = displayName
            resource.displayName = displayName
        }
    }
    setResourceParent(id: string, parentId: string) {
        const resource = this.getResource(id)
        const parentResource = this.getResource(parentId)
        if (resource && parentResource) {
            if (resource.provider === 'oci') OciResource.assignParentId(resource, parentResource)
        }
    }
    getResourceParentId(id: string): string {
        const resource = this.getResource(id)
        const parentId: string = (resource.provider === 'oci') ? OciResource.getParentId(resource) : ''
        return parentId
    }
    getResourceAssociationIds(id: string): string[] {
        const resource = this.getResource(id)
        const associationIds: string[] = (resource.provider === 'oci') ? OciResource.getAssociationIds(resource) : []
        return associationIds
    }

    // @ts-ignore 
    getPage = (id: string): OcdViewPage => this.design.view.pages.find((v) => v.id === id)
    // @ts-ignore 
    getActivePage = (): OcdViewPage => this.design.view.pages.find((p: OcdViewPage) => p.selected)
    // @ts-ignore 
    setPageTitle = (id: string, title: string): void => this.design.view.pages.find((v) => v.id === id).title = title
    addPage(): OcdViewPage {
        // @ts-ignore 
        const layers = this.design.model.oci.resources.compartment.map((c, i) => {return {id: c.id, class: 'oci-compartment', visible: true, selected: i === 0}})
        const viewPage: OcdViewPage = {
            id: `page-${uuidv4()}`,
            title: `Page ${this.design.view.pages.length + 1}`,
            layers: layers,
            coords: [],
            connectors: [],
            selected: true,
            transform: this.resetPanZoom()
        }
        this.design.view.pages.forEach((p) => p.selected = false)
        this.design.view.pages.push(viewPage)
        console.info(`Pages ${this.design.view.pages}`)
        return viewPage
    }
    removePage(id: string) {
        this.design.view.pages = this.design.view.pages.filter((p) => p.id !== id)
    }
    resetPanZoom = () => OcdDesign.resetPanZoom()

    // @ts-ignore 
    // getLayer = (id: string): OcdViewLayer => this.design.model.oci.resources.compartment.find((c) => c.id === id)
    getLayerName = (id: string): string => this.design.model.oci.resources.compartment.find((c) => c.id === id).displayName
    // @ts-ignore 
    getActiveLayer = (pageId: string): OcdViewLayer => this.getActivePage(pageId).layers.find((l: OcdViewLayer) => l.selected)
    // @ts-ignore 
    getResourcesLayer = (id: string): OcdViewLayer => this.getActivePage().layers.find((l: OcdViewLayer) => l.id === this.getResource(id).compartmentId)
    addLayer(id: string, selected: boolean = false, layerClass: string = 'oci-compartment') {
        this.design.view.pages.forEach((p: OcdViewPage) => {
            const layer: OcdViewLayer = {
                id: id,
                class: layerClass,
                visible: true,
                selected: selected
            } 
            p.layers.push(layer)
        })
    }
    updateLayerStyle(id: string, style: OcdViewCoordsStyle) {
        this.design.view.pages.forEach((p: OcdViewPage) => {
            const layer = p.layers.find(l => l.id === id)
            if (layer) layer.style = style
        })
    }

    removeLayer(id: string) {
        this.design.view.pages.forEach((p: OcdViewPage) => p.layers = p.layers.filter((l) => l.id !== id))
        this.deleteCompartmentChildren(id)
    }
    deleteCompartmentChildren(id: string) {
        this.design.model.oci.resources.compartment.filter(r => r.compartmentId === id).forEach(r => this.deleteCompartmentChildren(r.id))
        this.design.model.oci.resources.compartment =  this.design.model.oci.resources.compartment.filter(r => r.compartmentId !== id)
        const childIds: string[] = Object.entries(this.design.model.oci.resources).filter(([k, v]) => k !== 'compartment').reduce((a, [k, v]) => [...a, ...v.filter(r => r.compartmentId === id).map(r => r.id)], [] as string[])
        console.debug('OcdDocument: Child Ids', childIds)
        childIds.forEach(id => this.removeResource(id))
    }

    newCoords = (): OcdViewCoords => {
        return OcdDesign.newCoords()
        // return {
        //     id: `gid-${uuidv4()}`,
        //     pgid: '',
        //     ocid: '',
        //     pocid: '',
        //     x: 0,
        //     y: 0,
        //     w: 0,
        //     h: 0,
        //     title: '',
        //     class: '',
        //     showParentConnection: true,
        //     showConnections: true
        // }
    }
    getAllCoords = () => {return this.design.view.pages.map(p => [...p.coords, ...this.getChildCoords(p.coords)]).reduce((a, c) => [...a, ...c], [])}
    getAllPageCoords = (page: OcdViewPage) => {return this.getChildCoords(page.coords)}
    getCoords = (id: string) => {return this.design.view.pages.map(p => [...p.coords, ...this.getChildCoords(p.coords)]).reduce((a, c) => [...a, ...c], []).find(c => c.id === id)}
    // getChildCoords = (coords?: OcdViewCoords[]): OcdViewCoords[] => coords ? coords.reduce((a, c) => [...a, ...this.getChildCoords(c.coords)], [] as OcdViewCoords[]) : []
    getChildCoords = (coords?: OcdViewCoords[]): OcdViewCoords[] => coords ? coords.reduce((a, c) => [...a, ...this.getChildCoords(c.coords)], coords) : []
    getRelativeXY = (coords: OcdViewCoords): OcdViewPoint => {
        // console.info('OcdDocument: Get Relative XY for', coords.id, 'Parent', coords.pgid)
        const parentCoords: OcdViewCoords | undefined = this.getCoords(coords.pgid)
        let relativeXY: OcdViewPoint = {x: coords.x, y: coords.y}
        if (parentCoords) {
            console.info('OcdDocument: Parent', parentCoords)
            const parentXY = this.getRelativeXY(parentCoords)
            relativeXY.x += parentXY.x
            relativeXY.y += parentXY.y
        }
        // console.info('OcdDocument: Relative XY', relativeXY)
        return relativeXY
    }
    addCoords(coords: OcdViewCoords, viewId: string, pgid: string = '') {
        const view: OcdViewPage = this.getPage(viewId)
        // console.info('OcdDocument: Check Relative Position', coords.id, this.getRelativeXY(coords))
        if (view) {
            if (pgid === '') view.coords.push(coords)
            else {
                const parent = this.getCoords(pgid)
                this.setCoordsRelativeToResource(coords)
                if (parent && parent.coords) parent.coords.push(coords)
                else if (parent) parent.coords = [coords]
            }
        }
    }
    removeCoords(coords: OcdViewCoords, viewId: string, pgid: string = '') {
        const view: OcdViewPage = this.getPage(viewId)
        if (view) {
            if (pgid === '') view.coords = view.coords.filter(c => c !== coords)
            else {
                const parent = this.getCoords(pgid)
                if (parent && parent.coords) parent.coords = parent.coords.filter(c => c !== coords)
            }
        }
    }
    updateCoords(coords: OcdViewCoords, viewId: string) {
        // console.info('OcdDocument: Update Coords', coords)
        // console.info('OcdDocument: Update Coords', this.dragResource)
        let currentCoords: OcdViewCoords | undefined = this.getCoords(coords.id)
        // console.info('OcdDocument: Update Coords Current', currentCoords)
        if (currentCoords) {
            currentCoords.w = coords.w
            currentCoords.h = coords.h
            if (currentCoords.pgid === coords.pgid) {
                currentCoords.x = coords.x
                currentCoords.y = coords.y
            } else {
                this.removeCoords(currentCoords, viewId, currentCoords.pgid)
                // Reset relative to SVG Canvas
                currentCoords.x = coords.x
                currentCoords.y = coords.y
                this.setCoordsRelativeToCanvas(currentCoords)
                // Update Parent
                currentCoords.pgid = coords.pgid
                currentCoords.pocid = coords.pocid
                this.addCoords(currentCoords, viewId, coords.pgid)
            }
            if (coords.style) currentCoords.style = coords.style
        }
    }
    cloneCoords(coords: OcdViewCoords): OcdViewCoords {
        let cloneCoords = this.newCoords()
        cloneCoords.pgid = coords.pgid
        cloneCoords.ocid = coords.ocid
        cloneCoords.pocid = coords.pocid
        cloneCoords.x = coords.x
        cloneCoords.y = coords.y + coords.h + 20
        cloneCoords.w = coords.w
        cloneCoords.h = coords.h
        cloneCoords.title = coords.title
        cloneCoords.class = coords.class
        cloneCoords.container = coords.container
        console.info('OcdDocument: Coords', coords, 'Clone', cloneCoords)
        return cloneCoords
    }
    setCoordsRelativeToCanvas = (coords: OcdViewCoords) => {
        const parent = this.getCoords(coords.pgid)
        const relativeXY = this.getRelativeXY(parent ? parent : this.newCoords())
        coords.x += relativeXY.x
        coords.y += relativeXY.y
    }
    setCoordsRelativeToResource = (coords: OcdViewCoords) => {
        // console.info('OcdDocument setCoordsRelativeToResource', coords)
        const parent = this.getCoords(coords.pgid)
        const relativeXY = this.getRelativeXY(parent ? parent : this.newCoords())
        coords.x -= relativeXY.x
        coords.y -= relativeXY.y
        // console.info('OcdDocument setCoordsRelativeToResource', parent, relativeXY, coords)
    }
    switchCoords = (coords: OcdViewCoords[], idx1: number, idx2: number) => [coords[idx1], coords[idx2]] = [coords[idx2], coords[idx1]]
    bringForward = (coords: OcdViewCoords, viewId: string) => {
        const page = this.getPage(viewId)
        const parent = this.getCoords(coords.pgid)
        if (parent && parent.coords) {
            const idx = parent.coords.findIndex(c => c.id === coords.id)
            if (idx < parent.coords.length - 1) this.switchCoords(parent.coords, idx, idx + 1)
        } else if (page) {
            const idx = page.coords.findIndex(c => c.id === coords.id)
            if (idx < page.coords.length - 1) this.switchCoords(page.coords, idx, idx + 1)
        }
    }
    sendBackward = (coords: OcdViewCoords, viewId: string) => {
        const page = this.getPage(viewId)
        const parent = this.getCoords(coords.pgid)
        if (parent && parent.coords) {
            const idx = parent.coords.findIndex(c => c.id === coords.id)
            if (idx > 0) this.switchCoords(parent.coords, idx, idx - 1)
        } else if (page) {
            const idx = page.coords.findIndex(c => c.id === coords.id)
            if (idx > 0) this.switchCoords(page.coords, idx, idx - 1)
        }
    }
    toFront = (coords: OcdViewCoords, viewId: string) => {
        const page = this.getPage(viewId)
        const parent = this.getCoords(coords.pgid)
        if (parent && parent.coords) {
            const idx = parent.coords.findIndex(c => c.id === coords.id)
            parent.coords = [...parent.coords.slice(0, idx), ...parent.coords.slice(idx + 1), parent.coords[idx]]
        } else if (page) {
            const idx = page.coords.findIndex(c => c.id === coords.id)
            page.coords = [...page.coords.slice(0, idx), ...page.coords.slice(idx + 1), page.coords[idx]]
        }
    }
    toBack = (coords: OcdViewCoords, viewId: string) => {
        const page = this.getPage(viewId)
        const parent = this.getCoords(coords.pgid)
        if (parent && parent.coords) {
            const idx = parent.coords.findIndex(c => c.id === coords.id)
            parent.coords = [parent.coords[idx], ...parent.coords.slice(0, idx), ...parent.coords.slice(idx + 1)]
        } else if (page) {
            const idx = page.coords.findIndex(c => c.id === coords.id)
            page.coords = [page.coords[idx], ...page.coords.slice(0, idx), ...page.coords.slice(idx + 1)]
        }
    }

    autoLayout = (viewId: string) => {
        const autoArranger = new OcdAutoLayout(this.design)
        const page = this.getPage(viewId)
        page.coords = autoArranger.layout()
    }

}

export default OcdDocument