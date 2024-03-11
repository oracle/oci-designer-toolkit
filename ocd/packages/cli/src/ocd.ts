/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
// TODO: Remove Following
// @ts-nocheck

/*
** ocd cli 
*/

import fs from 'fs'
import path from 'path'
import { parseArgs } from "node:util"
import { OcdMarkdownExporter, OcdSVGExporter, OcdTerraformExporter } from '@ocd/export'

const options = {
    design: {
        type: "string",
        short: "d",
        default: "./design.okit"
    },
    css: {
        type: "string",
        short: "c",
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
        type: 'string',
        short: 'P',
        multiple: true
    },
}
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
        const designFile = args.values.design
        const cssFiles = args.values.css
        const inputFile = args.values.input
        const outputFile = args.values.output
        const outputDir = args.values.outputDir
        const pages = args.values.pages
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
                    const cssData = results.filter((r) => r.status === 'fulfilled').map((r) => r.value)
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
                    const cssData = results.filter((r) => r.status === 'fulfilled').map((r) => r.value)
                    const markdownExporter = new OcdMarkdownExporter(cssData)
                    const md = markdownExporter.export(design, pages)
                    fs.mkdirSync(outputDir, {recursive: true})
                    fs.writeFileSync(outputFile, md)
                })
            })
        } else {
            topLevelUsage()
        }
    }
}
