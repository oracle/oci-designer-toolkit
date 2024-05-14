/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
// TODO: Remove Following
// @ts-nocheck

import { parseArgs } from "node:util"
import { OcdBuildDateGenerator } from '@ocd/codegen'

const options = {
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
const outputDirectory = args.values.destination
const packageJsonFilename = args.values.package
const force = true
const generator = new OcdBuildDateGenerator()
generator.writeFiles(outputDirectory, packageJsonFilename, force)
