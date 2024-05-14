/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdDesign, OcdResource, OcdViewConnector, OcdViewCoords, OcdViewPage } from "@ocd/model"
import { OcdExporter, OutputDataString, OutputDataStringArray } from "../OcdExporter"

export class OcdSVGExporter extends OcdExporter {
    svg: string = ''
    css: string[]
    constructor(css: string[]) {
        super()
        this.css = css
    }
    export = (design: OcdDesign, pages?: string[]): OutputDataString => {
        const pagesToExport = pages === undefined || pages.length === 0 ? design.view.pages : design.view.pages.filter((p) => pages.includes(p.title))
        this.design = design
        let outputSvg = {}
        pagesToExport.forEach((p) => {
            // @ts-ignore
            outputSvg[p.title] = this.generateSvg(p)
        })
        return outputSvg
    }

    generateSvg = (page: OcdViewPage):string => {

        // @ts-ignore 
        const allPageCoords = OcdDesign.getAllPageCoords(page)
        const parentMap = allPageCoords.filter(c => c.showParentConnection).map((r: OcdViewCoords) => {return {parentId: OcdDesign.getResourceParentId(this.design, r.ocid), childId: r.ocid, childCoordsId: r.id, pgid: r.pgid}})
        const parentConnectors = parentMap.reduce((a, c) => {return [...a, ...allPageCoords.filter(coords => coords.ocid === c.parentId).filter(p => p.id !== c.pgid).map(p => {return {startCoordsId: p.id, endCoordsId: c.childCoordsId}})]}, [] as OcdViewConnector[])
        const associationMap = allPageCoords.filter(c => c.showConnections).map((r: OcdViewCoords) => {return OcdDesign.getResourceAssociationIds(this.design, r.ocid).map(aId => {return {startCoordsId: r.id, associationId: aId}})}).reduce((a, c) => [...a, ...c], [])
        const associationConnectors = associationMap.reduce((a, c) => {return [...a, ...allPageCoords.filter(coords => coords.ocid === c.associationId).filter(p => p.pgid !== c.startCoordsId).map(p => {return {startCoordsId: c.startCoordsId, endCoordsId: p.id}})]}, [] as OcdViewConnector[])
        const width = this.calculateWidth(page.coords)
        const height = this.calculateHeight(page.coords)
        // const svg = `<svg xmlns="http://www.w3.org/2000/svg" fill="white" width="${width}px" height="${height}px">
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" fill="white" width="100%" height="${height}px" viewBox="0 0 ${width} ${height}" preserveAspectRation="xMinYMin meet">
<defs></defs>
<style type="text/css">
${this.css.join('')}
</style>
<g transform="matrix(1 0 0 1 0 0)">
<g title="Resources">${page.coords.map((c) => this.generateResource(c)).join('')}</g>
</g>
<g title="ParentConnectors">${parentConnectors.map((c) => this.generateConnector(c, true)).join('')}</g>
<g title="AssociationConnectors">${associationConnectors.map((c) => this.generateConnector(c, false)).join('')}</g>
</svg>`
        return svg.replace(/^\s*[\r\n]/gm, '')
        // return svg
        // return svg.replaceAll('\n', ' ')
    }
    generateResource(coords: OcdViewCoords): string {
        const resource = this.getResource(coords.ocid)
        const containerLayout = (coords.container && (!coords.detailsStyle || coords.detailsStyle === 'default'))
        const detailedLayout = (coords.detailsStyle && coords.detailsStyle === 'detailed') || ((!coords.detailsStyle || coords.detailsStyle === 'default') && !coords.container)
        const backgroundColourClass = `${coords.class}-background-colour ${containerLayout ? 'ocd-svg-container-icon-background' : detailedLayout ? 'ocd-svg-detailed-icon-background' : 'ocd-svg-simple-icon-background'}`
        const foreignObjectClass = `ocd-svg-foreign-object ${containerLayout ? 'ocd-svg-resource-container' : detailedLayout ? 'ocd-svg-resource-detailed' : 'ocd-svg-resource-simple'}`
            const svg = `<g class="ocd-designer-resource" transform="translate(${coords.x},${coords.y})">
<rect class="${coords.container ? 'ocd-svg-container' : 'ocd-svg-simple'} ${coords.detailsStyle === 'simple' ? 'ocd-svg-resource-simple' : coords.detailsStyle === 'detailed' ? 'ocd-svg-resource-detailed' : !coords.container && !coords.detailsStyle ? 'ocd-svg-resource-detailed' : ''}" x="0" y="0" width="${coords.w}" height="${coords.h}"></rect>
<foreignObject class="${foreignObjectClass}" transform="translate(0, 0)">
<div xmlns="http://www.w3.org/1999/xhtml">
<div class="${backgroundColourClass}">
<div class="${coords.class} ocd-svg-icon"></div>
</div>
<div class="ocd-svg-foreign-object-display-name">
<span>${resource ? resource.resourceTypeName : ''}</span>
<span class="ocd-svg-foreign-object-name">${resource ? resource.displayName : ''}</span>
</div>
</div>
</foreignObject>
${coords.coords !== undefined ? coords.coords.map((c) => this.generateResource(c)).join('\n') : ''}</g>`
        return svg.replace(/^\s*[\r\n]/gm, '')
        // return svg.replaceAll('\n', '')
    }
    calculateWidth(coords: OcdViewCoords[]): number {
        const simpleWidth = 40
        const detailedWidth = 170
        let width = 0
        coords.forEach((c => width = Math.max(width, (c.x + (c.container && (!c.detailsStyle || c.detailsStyle === 'default') ? c.w : (!c.detailsStyle || c.detailsStyle === 'detailed') ? detailedWidth : simpleWidth)))))
        width += 100
        return width
    }

    calculateHeight(coords: OcdViewCoords[]): number {
        const simpleHeight = 40
        let height = 0
        coords.forEach((c => height = Math.max(height, (c.y + (c.container && (!c.detailsStyle || c.detailsStyle === 'default') ? c.h : simpleHeight)))))
        height += 100
        return height
    }

    getOciResources() {return Object.values(this.design.model.oci.resources).filter((val) => Array.isArray(val)).reduce((a, v) => [...a, ...v], [])}
    getOciResourcesObject() {return this.design.model.oci.resources}
    getResources() {return this.getOciResources()}
    getResource(id='') {return this.getResources().find((r: OcdResource) => r.id === id)}

    generateConnector(connector: OcdViewConnector, parentConnector: boolean = false, detailedResource: boolean = true): string {
        const simpleWidth = 40
        const detailedWidth = 170
        const simpleHeight = 40
        const controlPoint = 100
        // Start Coords Dimensions
        const startCoords = OcdDesign.getCoords(this.design, connector.startCoordsId)
        const startRelativeXY = startCoords ? OcdDesign.getCoordsRelativeXY(this.design, startCoords) : OcdDesign.newCoords()
        const startWidth = startCoords ? startCoords.detailsStyle ? startCoords.detailsStyle === 'simple' ? simpleHeight : startCoords.detailsStyle === 'detailed' ? detailedWidth : startCoords.container ? startCoords.w : detailedResource ? detailedWidth : simpleWidth : startCoords.container ? startCoords.w : detailedResource ? detailedWidth : simpleWidth : 0
        const startHeight = startCoords ? startCoords.container && (!startCoords.detailsStyle || startCoords.detailsStyle === 'default') ? startCoords.h : simpleHeight : 0
        const startDimensions = {x: startRelativeXY.x, y: startRelativeXY.y, w: startWidth, h: startHeight}
        // End Coords Dimensions
        const endCoords = OcdDesign.getCoords(this.design, connector.endCoordsId)
        const endRelativeXY = endCoords ? OcdDesign.getCoordsRelativeXY(this.design, endCoords) : OcdDesign.newCoords()
        const endWidth = endCoords ? endCoords.detailsStyle ? endCoords.detailsStyle === 'simple' ? simpleHeight : endCoords.detailsStyle === 'detailed' ? detailedWidth : endCoords.container ? endCoords.w : detailedResource ? detailedWidth : simpleWidth : endCoords.container ? endCoords.w : detailedResource ? detailedWidth : simpleWidth : 0
        const endHeight = endCoords ? endCoords.container && (!endCoords.detailsStyle || endCoords.detailsStyle === 'default') ? endCoords.h : simpleHeight : 0
        const endDimensions = {x: endRelativeXY.x, y: endRelativeXY.y, w: endWidth, h: endHeight}
        // Build Path
        const path: string[] = ['M']
        // Identify if we are goin left to right or right to left
        if (startDimensions.x < endDimensions.x) {
            // We will start middle right of the Start Coord
            path.push(`${startDimensions.x + startDimensions.w}`)
            path.push(`${startDimensions.y + startDimensions.h / 2}`)
            // Start Control Point
            path.push('C')
            path.push(`${startDimensions.x + startDimensions.w + controlPoint}`)
            path.push(`${startDimensions.y + startDimensions.h / 2},`)
            // Add End Control Point
            path.push(`${endDimensions.x - controlPoint}`)
            path.push(`${endDimensions.y + endDimensions.h / 2},`)
            // We will end at the middle left of the End Coord
            path.push(`${endDimensions.x}`)
            path.push(`${endDimensions.y + endDimensions.h / 2}`)
        } else {
            // We will start middle right of the Start Coord
            path.push(`${startDimensions.x }`)
            path.push(`${startDimensions.y + startDimensions.h / 2}`)
            // Start Control Point
            path.push('C')
            path.push(`${startDimensions.x - controlPoint}`)
            path.push(`${startDimensions.y + startDimensions.h / 2},`)
            // Add End Control Point
            path.push(`${endDimensions.x + endDimensions.w + controlPoint}`)
            path.push(`${endDimensions.y + endDimensions.h / 2},`)
            // We will end at the middle left of the End Coord
            path.push(`${endDimensions.x + endDimensions.w}`)
            path.push(`${endDimensions.y + endDimensions.h / 2}`)
        }
        // console.debug('OcdResourceSvg: Connector Path', path)
        // console.debug('OcdResourceSvg: Connector Path as String', path.join(' '))
        const className = parentConnector ? 'ocd-svg-parent-connector' : 'ocd-svg-association-connector'
        return `<path class="${className}" d="${path.join(' ')}"></path>`
    }
}

export default OcdSVGExporter
