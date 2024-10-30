/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { parseArgs } from "node:util"
import { OcdSvgCssGenerator } from '@ocd/codegen'

const options: Record<string, any> = {
    schema: {
        type: 'string',
        short: 's'
    },
    input: {
        type: 'string',
        short: 'i'
    },
    output: {
        type: 'string',
        short: 'o'
    },
    destination: {
        type: 'string',
        short: 'd'
    },
    package: {
        type: 'string',
        short: 'p'
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
const outputDirectory = args.values.destination as string
const inputDirectory = args.values.input as string
const force = true
const generator = new OcdSvgCssGenerator()
generator.writeFiles(outputDirectory, inputDirectory, force)
