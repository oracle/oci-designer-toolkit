/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdDesign, OciResource } from "@ocd/model"
import { OcdExporter } from "../OcdExporter.js"
import * as ociExcelResources from './provider/oci/resources.js'
import { OcdUtils, ociNoneVisualResources } from "@ocd/core"
import ExcelJS, { TableProperties, Workbook } from 'exceljs'
import { OcdExcelResource } from "./OcdExcelResource.js"

export class OcdExcelExporter extends OcdExporter {

    export = (design: OcdDesign): Workbook => {
        const workbook = new ExcelJS.Workbook()
        this.generateOciWorksheets(design, workbook)
        return workbook
    }

    generateOciWorksheets(design: OcdDesign, workbook: Workbook): Workbook {
        const resourceLists = OcdDesign.getOciResourceLists(design)
        const allResources = OcdDesign.getOciResources(design)
        const sortedKeys = Object.keys(resourceLists).sort((a, b) => a.localeCompare(b)).filter((r) => !ociNoneVisualResources.includes(r))
        let styleNumber = 1
        sortedKeys.forEach((k) => {
            const resources = resourceLists[k]
            if (resources.length > 0) { // Ignore Empty date
                const worksheet = workbook.addWorksheet(OcdUtils.toTitle(k), {pageSetup: {paperSize: 9, showGridLines: true}})
                worksheet.views = [{state: 'frozen', xSplit: 2, ySplit: 1, zoomScale: 125, showGridLines: true}]
                const resource = resources[0]
                const excelExporterName = `${OcdUtils.toTitleCase(resource.provider)}${resource.resourceType}`
                // @ts-ignore
                const excelExporter: OcdExcelResource = new ociExcelResources[excelExporterName](resource, allResources)
                const columns = excelExporter.columns()
                const tableColumns = excelExporter.tableColumns()
                // Add column titles to worksheet
                worksheet.columns = columns
                const tableRows = this.generateOciResourceListRows(resources, allResources, excelExporter)
                const table: TableProperties = {
                    name: `${k}Table`,
                    ref: 'A1',
                    headerRow: true,
                    totalsRow: true,
                    style: {
                        theme: `TableStyleLight16`,
                        showRowStripes: true,
                        showFirstColumn: true
                    },
                    columns: tableColumns,
                    rows: tableRows,
                }
                worksheet.addTable(table)
                styleNumber += 1
                if (styleNumber > 28) styleNumber = 1
                columns.forEach((c) => worksheet.getColumn(c.key).alignment = {wrapText: true, vertical: 'top'})
            }
        })
        return workbook
    }
    generateOciResourceListRows(resources: OciResource[], allResources: OciResource[], excelExporter: OcdExcelResource): string[][] {
        const rows: any[][] = resources.reduce((a, c) => {
            return [...a, this.generateOciResourceRow(c, allResources)]
        }, [] as any[][])
        return rows
    }
    generateOciResourceRow(resource: OciResource, allResources: OciResource[]): string[] {
        const excelExporterName = `${OcdUtils.toTitleCase(resource.provider)}${resource.resourceType}`
        // @ts-ignore
        const excelExporter = new ociExcelResources[excelExporterName](resource, allResources)
        return excelExporter.generate(resource, allResources)
    }
}

export default OcdExcelExporter
