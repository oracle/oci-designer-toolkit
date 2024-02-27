/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
// TODO: Remove Following
// @ts-nocheck

import fs from 'fs'
import path from 'path'
import { parseArgs } from "node:util"
import { OcdSVGExporter } from '@ocd/export'

const options = {
    design: {
        type: 'string',
        short: 'd'
    },
    pages: {
        type: 'string',
        short: 'p',
        multiple: true
    },
    output: {
        type: 'string',
        short: 'o',
        default: './'
    },
    css: {
        type: 'string',
        short: 'c',
        multiple: true
    },
    force: {
        type: 'boolean',
        short: 'f',
        default: false
    }
}
const args = parseArgs({options: options, allowPositionals: true})

// console.info(args)
console.info('')

// Read command as first argument
const designFile = args.values.design
const pages = args.values.pages
const outputDir = args.values.output
const cssFiles = args.values.css

if (designFile) {
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
}
