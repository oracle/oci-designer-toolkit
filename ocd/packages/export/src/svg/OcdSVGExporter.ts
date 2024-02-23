/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdDesign, OcdViewCoords, OcdViewPage } from "@ocd/model"
import { OcdExporter, OutputData } from "../OcdExporter"

export class OcdSVGExporter extends OcdExporter {
    svg: string = ''
    css: string[]
    constructor(css: string[]) {
        super()
        this.css = css
    }
    export = (design: OcdDesign, pages?: string[]): OutputData => {
        const pagesToExport = pages === undefined ? design.view.pages : design.view.pages.filter((p) => pages.includes(p.title))
        let outputSvg = {}
        pagesToExport.forEach((p) => {
            // @ts-ignore
            outputSvg[p.title] = ''
        })
        return outputSvg
    }

    generateSvg = (page: OcdViewPage):string => {
        const svg = `<svg>
<defs></defs>
<style type="text/css">
        ${this.css.join('\n')}
</style>
<g transform="matrix(1 0 0 1 0 0)">
</g>
</svg>`
        return svg
    }
    generateResource(coords: OcdViewCoords): string {
        const svg = `<g class="ocd-designer-resource" transform="translate(${coords.x},${coords.y})">
<rect class="${coords.container ? 'ocd-svg-container' : 'ocd-svg-simple'} ${coords.detailsStyle === 'simple' ? 'ocd-svg-resource-simple' : coords.detailsStyle === 'detailed' ? 'ocd-svg-resource-detailed' : !coords.container && !coords.detailsStyle ? 'ocd-svg-resource-detailed' : ''}" x="0" y="0"></rect>
<foreignObject></foreignObject>
</g>        
        `
        return svg
    }
}