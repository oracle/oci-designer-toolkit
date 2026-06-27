/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { v4 as uuidv4 } from 'uuid'
import { OcdAutoLayout, OcdDesign, OcdViewPage, OcdViewCoords, OcdViewLayer, OcdBaseModel, OcdViewPoint, OcdViewCoordsStyle, OcdResource, PaletteResource,
    OciModelResources, OciResource,
    AwsModelResources, AwsResource,
    AzureModelResources, AzureResource,
    GoogleModelResources, GoogleResource,
    GeneralModelResources, GeneralResource,
    CustomResource } from '@ocd/model'
import { OcdUtils } from '@ocd/core'
import { additionTitleInfo } from '../data/OcdAdditionTitleInfo'
import { OcdDragResource, OcdSelectedResourceModel, OcdSelectedResource, OcdSelectedResourceView } from '../types/Console'
import { newCustomResourceInstance } from '../stencils/OcdStencilRegistry'

export interface OcdAddResourceResponse {
    modelResource: OcdResource | undefined
    additionalResources: OcdResource[]
}

export interface OcdCoordsBounds {
    x: number
    y: number
    w: number
    h: number
}

const MINIMUM_CONTAINER_WIDTH = 140
const MINIMUM_CONTAINER_HEIGHT = 120
const CONTAINER_CHILD_PADDING = 32

export class OcdDocument {
    query: boolean
    design: OcdDesign
    selectedResource: OcdSelectedResource
    dragResource: OcdDragResource
    dialog: Record<string, boolean>
    constructor(design?: string | OcdDesign, resource?: OcdSelectedResource, dragResource?: OcdDragResource) {
        if (typeof design === 'string' && design.length > 0) this.design = JSON.parse(design)
        else if (design instanceof Object) this.design = OcdDocument.clonePlainData(design)
        else this.design = OcdDesign.newDesign()
        this.selectedResource = resource ? OcdDocument.clonePlainData(resource) : OcdDocument.newSelectedResource()
        this.dragResource = dragResource ? OcdDocument.clonePlainData(dragResource) : OcdDocument.newDragResource()
        this.query = false
        this.dialog = {
            resourceManager: false,
            query: false,
            templateGallery: false
        }
    }

    static readonly new = () => new OcdDocument()

    static readonly clone = (ocdDocument:OcdDocument) => new OcdDocument(ocdDocument.design, ocdDocument.selectedResource, ocdDocument.dragResource)

    private static readonly clonePlainData = <T,>(data: T): T => {
        if (typeof structuredClone === 'function') return structuredClone(data)
        return JSON.parse(JSON.stringify(data)) as T
    }

    static readonly newDesign = (): OcdDesign => OcdDesign.newDesign()

    static readonly newSelectedResource = (): OcdSelectedResource => {
        return {
            modelId: '',
            pageId: '',
            coordsId: '',
            class: 'ocd-image'
        }
    }
    static readonly newSelectedResourceModel = (): OcdSelectedResourceModel => {
        return {
            modelId: null
        }
    }
    static readonly newSelectedResourceView = (): OcdSelectedResourceView => {
        return {
            modelId: null,
            pageId: null,
            coordsId: null,
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
    getAwsResourcesObject() {return Object.hasOwn(this.design.model, 'aws') ? this.design.model.aws!.resources : {}}
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
    addAwsReasourceToList(key: string, modelResource: AwsResource) {
        if (!Object.hasOwn(this.design.model, 'aws')) this.design.model.aws = {resources: {}, vars: []}
        if (!Object.hasOwn(this.design.model.aws!.resources, key)) this.design.model.aws!.resources[key] = []
        this.design.model.aws!.resources[key].push(modelResource)
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
    addCustomReasourceToList(key: string, modelResource: CustomResource) {
        if (!Object.hasOwn(this.design.model, 'custom')) this.design.model.custom = {resources: {}, vars: []}
        if (!Object.hasOwn(this.design.model.custom!.resources, key)) this.design.model.custom!.resources[key] = []
        this.design.model.custom!.resources[key].push(modelResource)
    }
    addResource(paletteResource: PaletteResource, compartmentId: string): OcdAddResourceResponse {
        switch(paletteResource.provider) {
            case 'oci':
                return this.addOciResource(paletteResource, compartmentId)
            case 'aws':
                return this.addAwsResource(paletteResource, compartmentId)
            case 'azure':
                return this.addAzureResource(paletteResource, compartmentId)
            case 'google':
                return this.addGoogleResource(paletteResource, compartmentId)
            case 'general':
                return this.addGeneralResource(paletteResource, compartmentId)
            case 'custom':
                return this.addCustomResource(paletteResource, compartmentId)
            default:
                alert(`Provider ${paletteResource.provider} has not yet been implemented.`)
                return {modelResource: undefined, additionalResources: []}
        }
    }
    addCustomResource(paletteResource: PaletteResource, compartmentId: string): OcdAddResourceResponse {
        // Manifest was persisted to design.userDefined.customStencils[class] at import time.
        const manifest = this.design.userDefined?.customStencils?.[paletteResource.class]
        if (!manifest) {
            alert(`Custom stencil ${paletteResource.class} could not be found. Re-import the stencil JSON via File > Import > Custom Stencil.`)
            return {modelResource: undefined, additionalResources: []}
        }
        const modelResource = newCustomResourceInstance(manifest, compartmentId)
        this.addCustomReasourceToList(paletteResource.class, modelResource)
        return {modelResource: modelResource, additionalResources: []}
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
    addAwsResource(paletteResource: PaletteResource, compartmentId: string): OcdAddResourceResponse {
        const resourceList = paletteResource.class.split('-').slice(1).join('_')
        const resourceClass = paletteResource.class.toLowerCase().split('-').map((w) => `${w.charAt(0).toUpperCase()}${w.slice(1)}`).join('')
        const resourceNamespace: string = `${resourceClass}`
        // @ts-ignore
        const client = AwsModelResources[resourceNamespace]
        console.debug('OcdDocument: Namespace',resourceNamespace , client)
        if (client) {
            const modelResource = client.newResource()
            modelResource.compartmentId = compartmentId
            console.debug('OcdDocument:', modelResource)
            this.addAwsReasourceToList(resourceList, modelResource)
            const response: OcdAddResourceResponse = {modelResource: modelResource, additionalResources: []}
            const additionalResources = client.getAdditionalResources?.() // Use Optional Chaining to test if function exists
            if (additionalResources) {
                console.debug('OcdDocument: Creating Additional Resources', additionalResources)
                additionalResources.forEach((r: PaletteResource) => {
                    const additionalResource = this.addAwsResource(r, compartmentId).modelResource
                    if (additionalResource) {
                        response.additionalResources.push(additionalResource)
                        this.setResourceParent(additionalResource.id, modelResource.id)
                        client.setAdditionalResourceValues?.(modelResource, additionalResource)
                    }
                })
            }
            return response
        } else {
            alert(`Aws Resource ${resourceClass} has not yet been implemented.`)
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
    getVisibleCoordsWidth = (coords: OcdViewCoords): number => Math.max(coords.w || 0, coords.container ? MINIMUM_CONTAINER_WIDTH : 32)
    getVisibleCoordsHeight = (coords: OcdViewCoords): number => Math.max(coords.h || 0, coords.container ? MINIMUM_CONTAINER_HEIGHT : 32)
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
    getCoordsBounds = (coords: OcdViewCoords): OcdCoordsBounds => {
        const point = this.getRelativeXY(coords)
        return {
            x: point.x,
            y: point.y,
            w: this.getVisibleCoordsWidth(coords),
            h: this.getVisibleCoordsHeight(coords)
        }
    }
    isBoundsInsideBounds = (candidate: OcdCoordsBounds, container: OcdCoordsBounds): boolean => {
        return candidate.x >= container.x
            && candidate.y >= container.y
            && candidate.x + candidate.w <= container.x + container.w
            && candidate.y + candidate.h <= container.y + container.h
    }
    getContainerMinimumDimensions = (coords: OcdViewCoords, padding: number = CONTAINER_CHILD_PADDING): Pick<OcdCoordsBounds, 'w' | 'h'> => {
        const childCoords = coords.coords ?? []
        if (childCoords.length === 0) return {w: MINIMUM_CONTAINER_WIDTH, h: MINIMUM_CONTAINER_HEIGHT}
        const childBounds = childCoords.map((child) => ({
            x: child.x,
            y: child.y,
            w: this.getVisibleCoordsWidth(child),
            h: this.getVisibleCoordsHeight(child)
        }))
        const minChildX = Math.min(...childBounds.map((child) => child.x))
        const minChildY = Math.min(...childBounds.map((child) => child.y))
        const maxChildX = Math.max(...childBounds.map((child) => child.x + child.w))
        const maxChildY = Math.max(...childBounds.map((child) => child.y + child.h))
        return {
            w: Math.max(MINIMUM_CONTAINER_WIDTH, maxChildX + padding, Math.abs(Math.min(0, minChildX)) + maxChildX + padding),
            h: Math.max(MINIMUM_CONTAINER_HEIGHT, maxChildY + padding, Math.abs(Math.min(0, minChildY)) + maxChildY + padding)
        }
    }
    constrainContainerResize = (source: OcdViewCoords, candidate: OcdViewCoords): OcdViewCoords => {
        const minimum = this.getContainerMinimumDimensions(source)
        const constrained = OcdDocument.clonePlainData(candidate)
        const eastEdge = source.x + source.w
        const southEdge = source.y + source.h
        constrained.w = Math.max(constrained.w, minimum.w)
        constrained.h = Math.max(constrained.h, minimum.h)
        if (candidate.x !== source.x && constrained.w !== candidate.w) constrained.x = eastEdge - constrained.w
        if (candidate.y !== source.y && constrained.h !== candidate.h) constrained.y = southEdge - constrained.h
        return constrained
    }
    getSiblingCoords = (coords: OcdViewCoords, page: OcdViewPage): OcdViewCoords[] => {
        const parent = this.getCoords(coords.pgid)
        if (parent?.coords) return parent.coords
        return page.coords
    }
    attachContainedCoordsToFrame = (frame: OcdViewCoords, viewId: string): number => {
        if (!frame.container) return 0
        const page = this.getPage(viewId)
        if (!page) return 0
        const frameBounds = this.getCoordsBounds(frame)
        const frameDescendantIds = new Set(this.getChildCoords(frame.coords ?? []).map((coords) => coords.id))
        const siblings = this.getSiblingCoords(frame, page)
        const containedSiblings = siblings.filter((candidate) => {
            if (candidate.id === frame.id || frameDescendantIds.has(candidate.id)) return false
            return this.isBoundsInsideBounds(this.getCoordsBounds(candidate), frameBounds)
        })
        containedSiblings.forEach((candidate) => {
            const candidateBounds = this.getCoordsBounds(candidate)
            this.removeCoords(candidate, viewId, candidate.pgid)
            candidate.pgid = frame.id
            candidate.pocid = frame.ocid
            candidate.x = candidateBounds.x - frameBounds.x
            candidate.y = candidateBounds.y - frameBounds.y
            this.setResourceParent(candidate.ocid, frame.ocid)
            frame.coords = [...(frame.coords ?? []), candidate]
        })
        return containedSiblings.length
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
    // Clone a coords node preserving its position relative to its parent (used for
    // nested children so they are not double-offset like the cloned root is).
    cloneChildCoords(coords: OcdViewCoords): OcdViewCoords {
        let cloneCoords = this.newCoords()
        cloneCoords.pgid = coords.pgid
        cloneCoords.ocid = coords.ocid
        cloneCoords.pocid = coords.pocid
        cloneCoords.x = coords.x
        cloneCoords.y = coords.y
        cloneCoords.w = coords.w
        cloneCoords.h = coords.h
        cloneCoords.title = coords.title
        cloneCoords.class = coords.class
        cloneCoords.container = coords.container
        return cloneCoords
    }
    // Recursively deep-clone a coords sub-tree AND its backing model resources.
    // Returns a new (in-memory, not yet added) coords root whose nested children
    // each reference freshly cloned model resources and are re-parented to the
    // newly cloned parent resource.
    //
    // For the root call (isChild=false) the returned coords keeps the SOURCE's
    // pgid/pocid so the caller can re-attach it to the same parent on the page,
    // and inherits cloneCoords' positional nudge. For nested children the caller
    // passes the new parent's coords id (newPgid) and model id (newPocid) so the
    // child is re-parented onto the freshly cloned parent, preserving its relative
    // position.
    cloneResourceTree(sourceCoords: OcdViewCoords, newPgid?: string, newPocid?: string): OcdViewCoords | undefined {
        const isChild = newPgid !== undefined && newPocid !== undefined
        // Clone THIS model resource
        const newModelResource = this.cloneResource(sourceCoords.ocid)
        if (!newModelResource) {
            console.warn('OcdDocument: cloneResourceTree could not clone model resource for', sourceCoords.ocid)
            return undefined
        }
        // Re-point the new child resource's parent link to the new parent resource.
        // setResourceParent guards with allowedParentTypes, so unsupported child types
        // are left unchanged rather than crashing.
        if (isChild && newPocid) this.setResourceParent(newModelResource.id, newPocid)
        // The root keeps cloneCoords' nudge so it does not sit exactly on top of the
        // source; children keep their relative position within the parent.
        const newCoords = isChild ? this.cloneChildCoords(sourceCoords) : this.cloneCoords(sourceCoords)
        newCoords.ocid = newModelResource.id
        if (isChild) {
            newCoords.pgid = newPgid as string
            newCoords.pocid = newPocid as string
        }
        const children = sourceCoords.coords ?? []
        newCoords.coords = children
            .map((child) => this.cloneResourceTree(child, newCoords.id, newModelResource.id))
            .filter((c): c is OcdViewCoords => c !== undefined)
        return newCoords
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
