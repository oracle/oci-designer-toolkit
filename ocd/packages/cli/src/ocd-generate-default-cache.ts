/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
// TODO: Remove Following
// @ts-nocheck

import fs from 'fs'
import path from 'path'
import { OciReferenceDataQuery } from "@ocd/query"
import { parseArgs } from "node:util"
import { OcdReferenceDataGenerator } from "./generator/OcdReferenceDataGenerator"

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
// const outputFilename = 'DefaultCache.ts'
// const resourceFilename = path.join(outputDirectory, outputFilename)
const referenceDataQuery = new OciReferenceDataQuery()
const force = true

const generator = new OcdReferenceDataGenerator()
generator.writeFiles(outputDirectory, '', force)
