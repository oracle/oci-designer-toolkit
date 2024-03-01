/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
// TODO: Remove Following
// @ts-nocheck

import fs from 'fs'
import path from 'path'
import { parseArgs } from "node:util"
import { OcdMarkdownExporter } from '@ocd/export'

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
        default: './ocd.md'
    },
    css: {
        type: 'string',
        short: 'c',
        multiple: true
    }
}
const args = parseArgs({options: options, allowPositionals: true})

// console.info(args)
console.info('')

// Read command as first argument
const designFile = args.values.design
const pages = args.values.pages
const outputFile = args.values.output
const outputDir = path.dirname(outputFile)
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
            const markdownExporter = new OcdMarkdownExporter(cssData)
            const md = markdownExporter.export(design, pages)
            fs.mkdirSync(outputDir, {recursive: true})
            fs.writeFileSync(outputFile, md)
        })
    })
}
