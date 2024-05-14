/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** ocd cli 
*/

import fs from 'fs'
import path from 'path'
import { parseArgs } from "node:util"
import { OcdMarkdownExporter, OcdSVGExporter, OcdTerraformExporter } from '@ocd/export'
import { OciQuery } from "@ocd/query"
import { OcdAutoLayout, OcdDesign, OcdViewCoords } from '@ocd/model'
import { OcdUtils } from '@ocd/core'
import { OciModelResources } from '@ocd/model'

const options = {
    compartments: {
        type: "string",
        short: "c",
        multiple: true
    },
    design: {
        type: "string",
        short: "d",
        default: "./design.okit"
    },
    css: {
        type: "string",
        short: "C",
        multiple: true
    },
    input: {
        type: "string",
        short: "i"
    },
    output: {
        type: "string",
        short: "o"
    },
    outputDir: {
        type: "string",
        short: "O"
    },
    pages: {
        type: "string",
        short: "P",
        multiple: true
    },
    profile: {
        type: "string",
        short: "p",
        default: "DEFAULT"
    },
    region: {
        type: "string",
        short: "r"
    }
}
// @ts-ignore
const args = parseArgs({options: options, allowPositionals: true})
// Usage Functions
const exportUsage = () => {
    console.info(`
Export:

ocd export <category> [options]
`)
}
const importUsage = () => {
    console.info(`
Import:

ocd import <category> [options]
`)
}
const queryUsage = () => {
    console.info(`
Query:

ocd query <category> [options]
`)
}
const topLevelUsage = () => {
    console.info(`
Usage:

ocd <command> <category> [options]

Command:

    export: Export Design to specified output format.
    import: Import Design from specified input format.
    query: Query specified tenancy.
`)
    exportUsage()
    importUsage()
    queryUsage()
}

function isFulfilled<T>(val: PromiseSettledResult<T>): val is PromiseFulfilledResult<T> {return val.status === 'fulfilled'}

// console.info('Arguments:', args)

if (args.positionals.length === 0 || Object.hasOwn(args.values, 'help')) {
    topLevelUsage()
} else {
    const command = args.positionals[0]
    if (args.positionals.length === 1) {
        if (command === 'export') exportUsage()
        else if (command === 'import') importUsage()
        else if (command === 'query') queryUsage()
        else topLevelUsage()
    } else {
        const category = args.positionals[1]
        const compartments = args.values.compartments as string[]
        const designFile = args.values.design as string
        const cssFiles = args.values.css as string[]
        const inputFile = args.values.input as string
        const outputFile = args.values.output as string
        const outputDir = args.values.outputDir as string
        const pages = args.values.pages as string[]
        const profile = args.values.profile as string
        const region = args.values.region as string
        // Run specific action
        if (command === 'export' && category === 'terraform' && designFile !== undefined && outputDir !== undefined) {
            console.info('Exporting to Terraform\n')
            fs.readFile(designFile, 'utf8', (err, data) => {
                if (err) {
                    console.error(err)
                    return
                }
                // File exists and successfully Read
                const design = JSON.parse(data)
                const terraformExporter = new OcdTerraformExporter()
                const terraform = terraformExporter.export(design)
                fs.mkdirSync(outputDir, {recursive: true})
                Object.entries(terraform).forEach(([k, v]) => fs.writeFileSync(path.join(outputDir, `${k}`), v.join('\n')))
            })
        } else if (command === 'export' && category === 'svg' && designFile !== undefined && outputDir !== undefined && cssFiles !== undefined) {
            fs.readFile(designFile, 'utf8', (err, data) => {
                if (err) {
                    console.error(err)
                    return
                }
                // File exists and successfully Read
                const design = JSON.parse(data)
                // Read CSS Files
                const cssReadPromises = cssFiles.map((f) => fs.promises.readFile(f, 'utf-8'))
                Promise.allSettled(cssReadPromises).then((results) => {
                    // const cssData = results.filter((r) => r.status === 'fulfilled').map((r) => r.value)
                    const cssData = results.filter(isFulfilled).map((r) => r.value)
                    const svgExporter = new OcdSVGExporter(cssData)
                    const svg = svgExporter.export(design, pages)
                    fs.mkdirSync(outputDir, {recursive: true})
                    Object.entries(svg).forEach(([k, v]) => fs.writeFileSync(path.join(outputDir, `${k.replaceAll(' ', '_')}.svg`), v))
                })
            })
        } else if (command === 'export' && category === 'markdown' && designFile !== undefined && outputFile !== undefined && cssFiles !== undefined) {
            const outputDir = path.dirname(outputFile)
            fs.readFile(designFile, 'utf8', (err, data) => {
                if (err) {
                    console.error(err)
                    return
                }
                // File exists and successfully Read
                const design = JSON.parse(data)
                // Read CSS Files
                const cssReadPromises = cssFiles.map((f) => fs.promises.readFile(f, 'utf-8'))
                Promise.allSettled(cssReadPromises).then((results) => {
                    // const cssData = results.filter((r) => r.status === 'fulfilled').map((r) => r.value)
                    const cssData = results.filter(isFulfilled).map((r) => r.value)
                    const markdownExporter = new OcdMarkdownExporter(cssData)
                    const md = markdownExporter.export(design, pages)
                    fs.mkdirSync(outputDir, {recursive: true})
                    fs.writeFileSync(outputFile, md)
                })
            })
        } else if (command === 'query' && designFile !== undefined && profile !== undefined && compartments !== undefined) {
            const outputDir = path.dirname(designFile)
            const ociQuery = new OciQuery(profile, region)
            ociQuery.listTenancyCompartments().then((resp) => {
                // console.info('All compartments:', resp)
                const compartmentIds = resp.filter((c: Record<string, any>) => compartments.includes(c.name)).map((c: Record<string, any>) => c.id)
                ociQuery.queryTenancy(compartmentIds).then((results) => {
                    const design = OcdDesign.newDesign()
                    design.metadata.title = 'Queried Cloud Design'
                    design.view.pages[0].title = region ? region : 'Home Region'
                    const resultsOciResources = results.model.oci.resources
                    Object.entries(resultsOciResources).forEach(([key, value]) => {
                        const namespace = `Oci${OcdUtils.toResourceType(key)}`
                        // @ts-ignore
                        if(OciModelResources[namespace]) design.model.oci.resources[key] = value.map((v) => {return {...OciModelResources[namespace].newResource(), ...v, locked: true, readOnly: true}})
                    })
                    const autoArranger = new OcdAutoLayout(design)
                    const coords: OcdViewCoords[] = autoArranger.layout()
                    autoArranger.autoOciAddLayers()
                    design.view.pages[0].coords = coords
                    fs.mkdirSync(outputDir, {recursive: true})
                    fs.writeFileSync(designFile, JSON.stringify(design, null, 2))
                })
            }).catch((resp) => console.error(resp))
        } else {
            topLevelUsage()
        }
    }
}
