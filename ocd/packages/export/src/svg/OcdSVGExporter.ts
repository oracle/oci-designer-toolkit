/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdDesign, OcdResource, OcdViewCoords, OcdViewPage } from "@ocd/model"
import { OcdExporter, OutputData } from "../OcdExporter"

export class OcdSVGExporter extends OcdExporter {
    svg: string = ''
    css: string[]
    constructor(css: string[]) {
        super()
        this.css = css
    }
    export = (design: OcdDesign, pages?: string[]): OutputData => {
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
        const width = 1000
        const height = 1000
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" fill="white" width="${width}px" height="${height}px">
<defs></defs>
<style type="text/css">
        ${this.css.join('\n')}
</style>
<g transform="matrix(1 0 0 1 0 0)">
${page.coords.map((c) => this.generateResource(c)).join('\n')}
</g>
</svg>`
        return svg
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
        <span>${resource ? resource.displayName : ''}</span>
    </div>
</div>
</foreignObject>
${coords.coords !== undefined ? coords.coords.map((c) => this.generateResource(c)).join('\n') : ''}
</g>        
        `
        return svg
    }

    getOciResources() {return Object.values(this.design.model.oci.resources).filter((val) => Array.isArray(val)).reduce((a, v) => [...a, ...v], [])}
    getOciResourcesObject() {return this.design.model.oci.resources}
    getResources() {return this.getOciResources()}
    getResource(id='') {return this.getResources().find((r: OcdResource) => r.id === id)}

}