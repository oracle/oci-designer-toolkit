/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import * as ociResources from '../model/provider/oci/resources'
import version from '../json/version.json'
import { OcdDesign, OcdViewPage, OcdViewCoords, OcdViewLayer, OcdBaseModel } from '../model/OcdDesign'
import { PaletteResource } from '../model/OcdPalette'
import { OcdResource } from '../model/OcdResource'

export interface OcdSelectedResource {
    modelId: string
    pageId: string
    coordsId: string
    class: string
}

export class OcdDocument {
    design: OcdDesign
    selectedResource: OcdSelectedResource
    constructor(design?: string | OcdDesign, resource?: OcdSelectedResource) {
        if (typeof design === 'string' && design.length > 0) this.design = JSON.parse(design)
        else if (design instanceof Object) this.design = design
        else this.design = this.newDesign()
        this.selectedResource = resource ? resource : this.newSelectedResource()
    }

    static new = () => new OcdDocument()

    static clone = (ocdDocument:OcdDocument) => new OcdDocument(ocdDocument.design, ocdDocument.selectedResource)

    newDesign(): OcdDesign {
        const today = new Date();
        const date = `${today.getFullYear()}-${(today.getMonth() + 1)}-${today.getDate()}`;
        const time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
        const compartment = ociResources.OciCompartment.newResource()
        // const compartment = ociResources.OciCompartmentClient.new()
        const layer: OcdViewLayer = {
            id: compartment.id,
            class: 'oci-compartment',
            visible: true,
            selected: true
        } 
        return {
            metadata: {
                ocd_version: version.version,
                ocd_schema_version: version.schema_version,
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
                id: this.uuid(),
                pages: [
                    {
                        id: this.uuid('page'),
                        title: 'Open Cloud Design',
                        layers: [layer],
                        coords: [],
                        selected: true
                    }
                ]
            }
        }
    }

    newSelectedResource(): OcdSelectedResource {
        return {
            modelId: '',
            pageId: '',
            coordsId: '',
            class: 'ocd-image'
        }
    }
    getSelectedResource = () => this.getResource(this.selectedResource.modelId)
    getSelectedResourceCoords = () => this.getCoords(this.selectedResource.coordsId)

    // @ts-ignore 
    getLayerName = (id: string): string => this.design.model.oci.resources.compartment.find((c) => c.id === id).name
    // @ts-ignore 
    getActiveLayer = (pageId: string): OcdViewLayer => this.getActivePage(pageId).layers.find((l: OcdViewLayer) => l.selected)

    // @ts-ignore 
    getPage = (id: string): OcdViewPage => this.design.view.pages.find((v) => v.id === id)
    // @ts-ignore 
    getActivePage = (): OcdViewPage => this.design.view.pages.find((p: OcdViewPage) => p.selected)

    // @ts-ignore 
    uuid = (prefix='view') => `${prefix}-${([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,c =>(c^(((window.crypto||window.Crypto).getRandomValues(new Uint8Array(1))[0]&15)>>c/4)).toString(16))}`

    getOciResources() {return Object.values(this.design.model.oci.resources).filter((val) => Array.isArray(val)).reduce((a, v) => [...a, ...v], [])}
    getResources() {return this.getOciResources()}
    getResource(id='') {return this.getResources().find((r: any) => r.id === id)}
    addResource(paletteResource: PaletteResource, compartmentId: string) {
        const resourceList = paletteResource.class.split('-').slice(1).join('_')
        const resourceClass = paletteResource.class.toLowerCase().split('-').map((w) => `${w.charAt(0).toUpperCase()}${w.slice(1)}`).join('')
        const resourceClient: string = `${resourceClass}Client`
        console.info('List:', resourceList, 'Class:', resourceClass, 'Client:', resourceClient)
        console.info(`ociResource`, ociResources)
        let modelResource = undefined
        if (paletteResource.provider === 'oci') {
            modelResource = {id: this.uuid()}
            // @ts-ignore 
            // const client = ociResources[resourceClient]
            // modelResource = client.new()
            // @ts-ignore 
            modelResource = ociResources[resourceClass].newResource()
            modelResource.compartmentId = compartmentId
            // modelResource = new ociResources[resourceClass]()
            console.info(modelResource)
            // const region = this.design.model.oci.region.undefined
            // region.resources[resourceList] ? region.resources[resourceList].push(modelResource) : region.resources[resourceList] = [modelResource]
            this.design.model.oci.resources[resourceList] ? this.design.model.oci.resources[resourceList].push(modelResource) : this.design.model.oci.resources[resourceList] = [modelResource]
        }
        console.info('Added Resource:', modelResource)
        return modelResource
    }
    removeResource(id: string) {
        // Delete from Model
        Object.values(this.design.model).forEach((provider: OcdBaseModel) => Object.entries(provider.resources).forEach(([k, v]) => provider.resources[k] = v.filter((r: OcdResource) => r.id !== id)))
        // Remove from Views
        this.design.view.pages.forEach((page: OcdViewPage) => {
            const pageResources = page.coords.filter((coords: OcdViewCoords) => coords.ocid === id)
            pageResources.forEach((coords: OcdViewCoords) => this.removeCoords(coords, page.id))
        })
    }
    getDisplayName(id: string): string {
        const resource = this.getResource(id)
        return resource ? resource.name ? resource.name : resource.displayName : 'Unknown'
    }
    setDisplayName(id: string, displayName: string) {
        const resource = this.getResource(id)
        if (resource) {
            resource.name = displayName
            resource.displayName = displayName
        }
    }

    addPage(): OcdViewPage {
        // @ts-ignore 
        const layers = this.design.model.oci.resources.compartment.map((c, i) => {return {id: c.id, class: 'oci-compartment', visible: true, selected: i === 0}})
        const viewPage: OcdViewPage = {
            id: this.uuid('page'),
            title: `Page ${this.design.view.pages.length + 1}`,
            layers: layers,
            coords: [],
            selected: true
        }
        this.design.view.pages.forEach((p) => p.selected = false)
        this.design.view.pages.push(viewPage)
        console.info(`Pages ${this.design.view.pages}`)
        return viewPage
    }
    removePage(id: string) {
        this.design.view.pages = this.design.view.pages.filter((p) => p.id !== id)
    }

    addLayer(id: string, layerClass: string = 'oci-compartment') {
        this.design.view.pages.forEach((p: OcdViewPage) => {
            const layer: OcdViewLayer = {
                id: id,
                class: layerClass,
                visible: true,
                selected: false
            } 
            p.layers.push(layer)
        })
    }
    removeLayer(id: string) {
        this.design.view.pages.forEach((p: OcdViewPage) => p.layers = p.layers.filter((l) => l.id !== id))
    }

    getCoords = (id: string) => {return this.design.view.pages.map(p => p.coords).reduce((a, c) => [...a, ...c], []).find(c => c.id === id)}
    addCoords(coords: OcdViewCoords, viewId: string, pgid: string = '') {
        const view: OcdViewPage = this.getPage(viewId)
        if (view) view.coords.push(coords)
    }
    removeCoords(coords: OcdViewCoords, viewId: string, pgid: string = '') {
        const view: OcdViewPage = this.getPage(viewId)
        view.coords = view.coords.filter(c => c !== coords)
    }
    updateCoords(coords: OcdViewCoords, viewId: string) {
        const view: OcdViewPage = this.getPage(viewId)
        let oldCoords: OcdViewCoords | undefined = view.coords.find(c => c.id === coords.id)
        if (oldCoords) {
            oldCoords.x = coords.x
            oldCoords.y = coords.y
            oldCoords.w = coords.w
            oldCoords.h = coords.h
        }
    }

}

export default OcdDocument