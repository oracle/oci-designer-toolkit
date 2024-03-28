/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdDesign, OcdResource, OcdViewConnector, OcdViewCoords, OcdViewPage, OciResource } from "@ocd/model"
import { OcdExporter, OutputDataString, OutputDataStringArray } from "../OcdExporter"
import { OcdSVGExporter } from "../svg/OcdSVGExporter"
import * as ociMarkdownResources from './provider/oci/resources'
import { OcdUtils } from "@ocd/core"

export class OcdMarkdownExporter extends OcdExporter {
    css: string[]
    constructor(css: string[]) {
        super()
        this.css = css
    }
    export = (design: OcdDesign, pages?: string[]): string => {
        const pagesToExport = pages === undefined || pages.length === 0 ? design.view.pages : design.view.pages.filter((p) => pages.includes(p.title))
        this.design = design
        const svgExporter = new OcdSVGExporter(this.css)
        const svg = svgExporter.export(design, pages)
        let outputMd = `# ${design.metadata.title}

${design.metadata.documentation}

${pagesToExport.map((p) => this.generatePageMarkdown(p, svg)).join('\n')}

## OCI Resources

${this.generateOciResourcesMarkdown(design)}
`
        return outputMd
    }
    generatePageMarkdown(page: OcdViewPage, pageSvg: OutputDataString, useDataUri: boolean = false): string {
        const svg = pageSvg[page.title]
        const svgDataUri = OcdUtils.svgToDataUri(svg)
        return `## ${page.title}

${page.documentation}

${useDataUri ? `![${page.title}](${svgDataUri})` : svg}

`
    }
    generateOciResourcesMarkdown(design: OcdDesign): string {
        const resourceLists = OcdDesign.getOciResourceLists(design)
        const allResources = OcdDesign.getOciResources(design)
        const sortedKeys = Object.keys(resourceLists).sort((a, b) => a.localeCompare(b))
        return `${sortedKeys.map((k) => this.generateOciResourceListMarkdown(k, resourceLists[k], allResources)).join('\n')}`
    }
    generateOciResourceListMarkdown(key: string, resources: OciResource[], allResources: OciResource[]): string {
        return `### ${OcdUtils.toTitle(key)}

${resources.map((r) => this.generateOciResourceMarkdown(r, allResources)).join('\n')}
`
    }
    generateOciResourceMarkdown(resource: OciResource, allResources: OciResource[]): string {
        const markdownExporterName = `${OcdUtils.toTitleCase(resource.provider)}${resource.resourceType}`
        // @ts-ignore
        const markdownExporter = new ociMarkdownResources[markdownExporterName](resource, allResources)
        return `${markdownExporter.generate(resource, allResources)}`
    }
}

export default OcdMarkdownExporter
