/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
// TODO: Remove Following
// @ts-nocheck

import fs from 'fs'
import path from 'path'
import { parseArgs } from "node:util"
import { OcdTerraformExporter } from '@ocd/export'

const options = {
    design: {
        type: 'string',
        short: 'd'
    },
    output: {
        type: 'string',
        short: 'o',
        default: './'
    }
}
const args = parseArgs({options: options, allowPositionals: true})

// console.info(args)
console.info('')

// Read command as first argument
const designFile = args.values.design
const outputDir = args.values.output
console.debug('Positionals:', args.positionals)

if (designFile) {
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
}
