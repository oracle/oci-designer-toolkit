/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { v4 as uuidv4 } from 'uuid'
import { OcdAutoLayout, OcdDesign, OcdViewPage, OcdViewCoords, OcdViewLayer, OcdBaseModel, OcdViewPoint, OcdViewCoordsStyle, OcdResource, PaletteResource, 
    OciModelResources, OciResource,
    AzureModelResources, AzureResource, 
    GoogleModelResources, GoogleResource,
    GeneralModelResources, GeneralResource } from '@ocd/model'
import { OcdUtils } from '@ocd/core'
import { additionTitleInfo } from '../data/OcdAdditionTitleInfo'
import { OcdDragResource, OcdSelectedResource } from '../types/Console'

export interface OcdAddResourceResponse {
    modelResource: OcdResource | undefined
    additionalResources: OcdResource[]
}

export class OcdDocument {
    query: boolean
    design: OcdDesign
    selectedResource: OcdSelectedResource
    dragResource: OcdDragResource
    constructor(design?: string | OcdDesign, resource?: OcdSelectedResource, dragResource?: OcdDragResource) {
        if (typeof design === 'string' && design.length > 0) this.design = JSON.parse(design)
        else if (design instanceof Object) this.design = design
        else this.design = OcdDesign.newDesign()
        this.selectedResource = resource || OcdDocument.newSelectedResource()
        this.dragResource = dragResource || OcdDocument.newDragResource()
        this.query = false
    }

    static readonly new = () => new OcdDocument()

    static readonly clone = (ocdDocument:OcdDocument) => new OcdDocument(ocdDocument.design, ocdDocument.selectedResource, ocdDocument.dragResource)

    static readonly newDesign = (): OcdDesign => OcdDesign.newDesign()

    static readonly newSelectedResource = (): OcdSelectedResource => {
        return {
            modelId: '',
            pageId: '',
            coordsId: '',
            class: 'ocd-image'
        }
    }
    static readonly newDragResource = (dragging:boolean=false): OcdDragResource => {
        return {
            dragging: dragging,
            modelId: '',
            pageId: '',
            coordsId: '',
            class: 'ocd-image',
            resource: OcdDesign.newCoords()
        }
    }
    getSelectedResource = () => this.getResource(this.selectedResource.modelId)
    getSelectedResourceCoords = () => this.getCoords(this.selectedResource.coordsId)

    getParentResource = () => this.getResource(this.dragResource.modelId)
    getParentResourceCoords = () => this.getCoords(this.dragResource.coordsId)

    isOciResourceList(key: string): boolean {return Object.hasOwn(this.design.model.oci.resources, key)}
    getOciResourceList(key: string) {return OcdDesign.getOciResourceList(this.design, key)}
    getOciResourcesObject() {return this.design.model.oci.resources}
    getAzureResourcesObject() {return this.design.model.azure.resources}
    getGoogleResourcesObject() {return this.design.model.google.resources}
    getResourceLists() {return OcdDesign.getResourceLists(this.design)}
    getResources() {return OcdDesign.getResources(this.design)}
    getResource(id='') {return OcdDesign.getResource(this.design, id)}
    addOciReasourceToList(key: string, modelResource: OciResource) {
        if (!Object.hasOwn(this.design.model, 'oci')) this.design.model.oci = {resources: {}, vars: [], tags: {}}
        if (!Object.hasOwn(this.design.model.oci.resources, key)) this.design.model.oci.resources[key] = []
        this.design.model.oci.resources[key].push(modelResource)
    }
    addAzureReasourceToList(key: string, modelResource: AzureResource) {
        if (!Object.hasOwn(this.design.model, 'azure')) this.design.model.azure = {resources: {}, vars: []}
        if (!Object.hasOwn(this.design.model.azure.resources, key)) this.design.model.azure.resources[key] = []
        this.design.model.azure.resources[key].push(modelResource)
    }
    addGoogleReasourceToList(key: string, modelResource: GoogleResource) {
        if (!Object.hasOwn(this.design.model, 'google')) this.design.model.google = {resources: {}, vars: []}
        if (!Object.hasOwn(this.design.model.google.resources, key)) this.design.model.google.resources[key] = []
        this.design.model.google.resources[key].push(modelResource)
    }
    addGeneralReasourceToList(key: string, modelResource: GeneralResource) {
        if (!Object.hasOwn(this.design.model, 'general')) this.design.model.general = {resources: {}, vars: []}
        if (!Object.hasOwn(this.design.model.general.resources, key)) this.design.model.general.resources[key] = []
        this.design.model.general.resources[key].push(modelResource)
    }
    addResource(paletteResource: PaletteResource, compartmentId: string): OcdAddResourceResponse {
        switch(paletteResource.provider) {
            case 'oci':
                return this.addOciResource(paletteResource, compartmentId)
            case 'azure':
                return this.addAzureResource(paletteResource, compartmentId)
            case 'google':
                return this.addGoogleResource(paletteResource, compartmentId)
            case 'general':
                return this.addGeneralResource(paletteResource, compartmentId)
            default:
                alert(`Provider ${paletteResource.provider} has not yet been implemented.`)
                return {modelResource: undefined, additionalResources: []}
        }
    }
    addOciResource(paletteResource: PaletteResource, compartmentId: string): OcdAddResourceResponse {
        const resourceList = paletteResource.class.split('-').slice(1).join('_')
        const resourceClass = paletteResource.class.toLowerCase().split('-').map((w) => `${w.charAt(0).toUpperCase()}${w.slice(1)}`).join('')
        const resourceNamespace: string = `${resourceClass}`
        // @ts-ignore 
        const client = OciModelResources[resourceNamespace]
        console.debug('OcdDocument: Namespace',resourceNamespace , client)
        if (client) {
            const modelResource = client.newResource()
            modelResource.compartmentId = compartmentId
            console.debug('OcdDocument:', modelResource)
            this.addOciReasourceToList(resourceList, modelResource)
            const response: OcdAddResourceResponse = {modelResource: modelResource, additionalResources: []}
            const additionalResources = client.getAdditionalResources?.() // Use Optional Chaining to test if function exists
            if (additionalResources) {
                console.debug('OcdDocument: Creating Additional Resources', additionalResources)
                additionalResources.forEach((r: PaletteResource) => {
                    const additionalResource = this.addOciResource(r, compartmentId).modelResource
                    if (additionalResource) {
                        response.additionalResources.push(additionalResource)
                        this.setResourceParent(additionalResource.id, modelResource.id)
                        client.setAdditionalResourceValues?.(modelResource, additionalResource)
                    }
                })
            }
            return response
        } else {
            alert(`Oci Resource ${resourceClass} has not yet been implemented.`)
            return {modelResource: undefined, additionalResources: []}
        }
    }
    addAzureResource(paletteResource: PaletteResource, compartmentId: string): OcdAddResourceResponse {
        const resourceList = paletteResource.class.split('-').slice(1).join('_')
        const resourceClass = paletteResource.class.toLowerCase().split('-').map((w) => `${w.charAt(0).toUpperCase()}${w.slice(1)}`).join('')
        const resourceNamespace: string = `${resourceClass}`
        // @ts-ignore 
        const client = AzureModelResources[resourceNamespace]
        console.debug('OcdDocument: Namespace',resourceNamespace , client)
        if (client) {
            const modelResource = client.newResource()
            modelResource.compartmentId = compartmentId
            console.debug('OcdDocument:', modelResource)
            this.addAzureReasourceToList(resourceList, modelResource)
            const response: OcdAddResourceResponse = {modelResource: modelResource, additionalResources: []}
            const additionalResources = client.getAdditionalResources?.() // Use Optional Chaining to test if function exists
            if (additionalResources) {
                console.debug('OcdDocument: Creating Additional Resources', additionalResources)
                additionalResources.forEach((r: PaletteResource) => {
                    const additionalResource = this.addAzureResource(r, compartmentId).modelResource
                    if (additionalResource) {
                        response.additionalResources.push(additionalResource)
                        this.setResourceParent(additionalResource.id, modelResource.id)
                        client.setAdditionalResourceValues?.(modelResource, additionalResource)
                    }
                })
            }
            return response
        } else {
            alert(`Azure Resource ${resourceClass} has not yet been implemented.`)
            return {modelResource: undefined, additionalResources: []}
        }
    }
    addGoogleResource(paletteResource: PaletteResource, compartmentId: string): OcdAddResourceResponse {
        const resourceList = paletteResource.class.split('-').slice(1).join('_')
        const resourceClass = paletteResource.class.toLowerCase().split('-').map((w) => `${w.charAt(0).toUpperCase()}${w.slice(1)}`).join('')
        const resourceNamespace: string = `${resourceClass}`
        // @ts-ignore 
        const client = GoogleModelResources[resourceNamespace]
        console.debug('OcdDocument: Namespace',resourceNamespace , client)
        if (client) {
            const modelResource = client.newResource()
            modelResource.compartmentId = compartmentId
            console.debug('OcdDocument:', modelResource)
            this.addGoogleReasourceToList(resourceList, modelResource)
            const response: OcdAddResourceResponse = {modelResource: modelResource, additionalResources: []}
            const additionalResources = client.getAdditionalResources?.() // Use Optional Chaining to test if function exists
            if (additionalResources) {
                console.debug('OcdDocument: Creating Google Additional Resources', additionalResources)
                additionalResources.forEach((r: PaletteResource) => {
                    const additionalResource = this.addGoogleResource(r, compartmentId).modelResource
                    if (additionalResource) {
                        response.additionalResources.push(additionalResource)
                        this.setResourceParent(additionalResource.id, modelResource.id)
                        client.setAdditionalResourceValues?.(modelResource, additionalResource)
                    }
                })
            }
            return response
        } else {
            alert(`Google Resource ${resourceClass} has not yet been implemented.`)
            return {modelResource: undefined, additionalResources: []}
        }
    }
    addGeneralResource(paletteResource: PaletteResource, compartmentId: string): OcdAddResourceResponse {
        const resourceList = paletteResource.class.split('-').slice(1).join('_')
        const resourceClass = paletteResource.class.toLowerCase().split('-').map((w) => `${w.charAt(0).toUpperCase()}${w.slice(1)}`).join('')
        const resourceNamespace: string = `${resourceClass}`
        // @ts-ignore 
        const client = GeneralModelResources[resourceNamespace]
        console.debug('OcdDocument: Namespace',resourceNamespace , client)
        if (client) {
            const modelResource = client.newResource()
            modelResource.compartmentId = compartmentId
            console.debug('OcdDocument:', modelResource)
            this.addGeneralReasourceToList(resourceList, modelResource)
            const response: OcdAddResourceResponse = {modelResource: modelResource, additionalResources: []}
            const additionalResources = client.getAdditionalResources?.() // Use Optional Chaining to test if function exists
            if (additionalResources) {
                console.debug('OcdDocument: Creating General Additional Resources', additionalResources)
                additionalResources.forEach((r: PaletteResource) => {
                    const additionalResource = this.addGeneralResource(r, compartmentId).modelResource
                    if (additionalResource) {
                        response.additionalResources.push(additionalResource)
                        this.setResourceParent(additionalResource.id, modelResource.id)
                        client.setAdditionalResourceValues?.(modelResource, additionalResource)
                    }
                })
            }
            return response
        } else {
            alert(`General Resource ${resourceClass} has not yet been implemented.`)
            return {modelResource: undefined, additionalResources: []}
        }
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
            if (parent?.coords) parent.coords = parent.coords.filter(c => c.ocid !== id)
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
            const client = OciModelResources[resourceNamespace]
            if (client) {
                cloneResource = client.cloneResource(resource)
                console.debug(cloneResource)
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
        console.debug('OcdDocument: Setting Parent Resource', resource, parentResource)
        if (resource && parentResource) {
            if (resource.provider === 'oci') OciResource.assignParentId(resource, parentResource)
        }
    }
    getResourceParentId(id: string): string {
        const resource = this.getResource(id)
        const parentId: string = (resource.provider === 'oci') ? OciResource.getParentId(resource, this.getResourceLists()) : ''
        return parentId
    }
    getResourceAssociationIds(id: string): string[] {
        const resource = this.getResource(id)
        const associationIds: string[] = (resource.provider === 'oci') ? OciResource.getAssociationIds(resource, this.getResourceLists()) : []
        return associationIds
    }
    getAdditionalTitleInfo(id: string): string {
        const resource = this.getResource(id)
        const key = resource.resourceType
        if (Object.hasOwn(additionTitleInfo, key)) return `${resource[additionTitleInfo[key]]}`
        else return ''
    }

    getOciVariables = () => this.design.model.oci.vars

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
            documentation: '',
            layers: layers,
            coords: [],
            connectors: [],
            selected: true,
            grid: false,
            transform: this.resetPanZoom()
        }
        this.design.view.pages.forEach((p) => p.selected = false)
        this.design.view.pages.push(viewPage)
        // console.debug(`Pages ${this.design.view.pages}`)
        return viewPage
    }
    removePage(id: string) {
        this.design.view.pages = this.design.view.pages.filter((p) => p.id !== id)
    }
    duplicatePage(id: string) {
        const sourcePage = this.getPage(id)
        const duplicatePage = this.addPage()
        duplicatePage.title = `${sourcePage.title} Copy`
        duplicatePage.coords = JSON.parse(JSON.stringify(sourcePage.coords))
        duplicatePage.coords = this.updateDuplatedCoords(duplicatePage.coords)
        duplicatePage.connectors = JSON.parse(JSON.stringify(sourcePage.connectors))
    }
    updateDuplatedCoords(coords: OcdViewCoords[], pgid: string=''): OcdViewCoords[] {
        const updatedCoords: OcdViewCoords[] = coords.map((c) => {return {...c, id: `gid-${uuidv4()}`, pgid: pgid}}).map((c) => {return {...c, ...c.coords ? {coords: this.updateDuplatedCoords(c.coords, c.id)} : {}}})
        return updatedCoords
    }
    resetPanZoom = () => {
        const page = this.getActivePage()
        page.transform = OcdDesign.resetPanZoom()
        return page.transform
    }
    zoomIn = () => {
        const page = this.getActivePage()
        const newMatrix = page.transform.slice()
        newMatrix[0] *= 1.15
        newMatrix[3] *= 1.15
        if (newMatrix[0] >= 0.3 && newMatrix[0] <= 5) page.transform = newMatrix
        return page.transform
    }
    zoomOut = () => {
        const page = this.getActivePage()
        const newMatrix = page.transform.slice()
        newMatrix[0] *= 0.9
        newMatrix[3] *= 0.9
        if (newMatrix[0] >= 0.3 && newMatrix[0] <= 3) page.transform = newMatrix
        return page.transform
    }
    zoomTo = (percentage: number = 100) => {
        const page = this.getActivePage()
        const newMatrix = OcdDesign.resetPanZoom().slice()
        newMatrix[0] *= percentage/100
        newMatrix[3] *= percentage/100
        if (newMatrix[0] >= 0.25 && newMatrix[0] <= 3) page.transform = newMatrix
        return page.transform
    }

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

    newCoords = (): OcdViewCoords => OcdDesign.newCoords()
    getAllCoords = () => {return this.design.view.pages.map(p => [...p.coords, ...this.getChildCoords(p.coords)]).reduce((a, c) => [...a, ...c], [])}
    getAllPageCoords = (page: OcdViewPage) => {return this.getChildCoords(page.coords)}
    getCoords = (id: string) => {return this.design.view.pages.map(p => [...p.coords, ...this.getChildCoords(p.coords)]).reduce((a, c) => [...a, ...c], []).find(c => c.id === id)}
    // getChildCoords = (coords?: OcdViewCoords[]): OcdViewCoords[] => coords ? coords.reduce((a, c) => [...a, ...this.getChildCoords(c.coords)], [] as OcdViewCoords[]) : []
    getChildCoords = (coords?: OcdViewCoords[]): OcdViewCoords[] => coords ? coords.reduce((a, c) => [...a, ...this.getChildCoords(c.coords)], coords) : []
    getRelativeXY = (coords: OcdViewCoords): OcdViewPoint => {
        // console.debug('OcdDocument: Get Relative XY for', coords.id, 'Parent', coords.pgid)
        const parentCoords: OcdViewCoords | undefined = this.getCoords(coords.pgid)
        let relativeXY: OcdViewPoint = {x: coords.x, y: coords.y}
        if (parentCoords) {
            // console.debug('OcdDocument: Parent', parentCoords)
            const parentXY = this.getRelativeXY(parentCoords)
            relativeXY.x += parentXY.x
            relativeXY.y += parentXY.y
        }
        // console.debug('OcdDocument: Relative XY', relativeXY)
        return relativeXY
    }
    addCoords(coords: OcdViewCoords, viewId: string, pgid: string = '') {
        const view: OcdViewPage = this.getPage(viewId)
        // console.debug('OcdDocument: Check Relative Position', coords.id, this.getRelativeXY(coords))
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
        // console.debug('OcdDocument: Update Coords', coords)
        // console.debug('OcdDocument: Update Coords', this.dragResource)
        let currentCoords: OcdViewCoords | undefined = this.getCoords(coords.id)
        // console.debug('OcdDocument: Update Coords Current', currentCoords)
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
        // console.debug('OcdDocument: Coords', coords, 'Clone', cloneCoords)
        return cloneCoords
    }
    setCoordsRelativeToCanvas = (coords: OcdViewCoords) => {
        const parent = this.getCoords(coords.pgid)
        const relativeXY = this.getRelativeXY(parent ? parent : this.newCoords())
        coords.x += relativeXY.x
        coords.y += relativeXY.y
    }
    setCoordsRelativeToResource = (coords: OcdViewCoords) => {
        // console.debug('OcdDocument setCoordsRelativeToResource', coords)
        const parent = this.getCoords(coords.pgid)
        const relativeXY = this.getRelativeXY(parent ? parent : this.newCoords())
        coords.x -= relativeXY.x
        coords.y -= relativeXY.y
        // console.debug('OcdDocument setCoordsRelativeToResource', parent, relativeXY, coords)
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

    autoLayout = (viewId: string, detailed: boolean = true, style: string = 'dynamic-columns') => {
        console.debug('OcdDocument: autoLayout', style)
        const autoArranger = new OcdAutoLayout(this.design)
        const page = this.getPage(viewId)
        page.coords = autoArranger.layout(detailed, style)
    }

}

export default OcdDocument