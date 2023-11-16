/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
// TODO: Remove Following
// @ts-nocheck

import fs from 'fs'
import path from 'path'
import { OcdModelGenerator, OcdPropertiesGenerator, OcdTabularGenerator, OciTerraformGenerator, OciTerraformSchemaImporter, OcdValidatorGenerator } from '@ocd/codegen'
import { parseArgs } from "node:util"

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
const command = args.positionals[0]
const subcommand = args.positionals[1]
if (command.toLocaleLowerCase() === 'generate') {
    if (subcommand.toLocaleLowerCase() === 'oci-model-js' 
        || subcommand.toLocaleLowerCase() === 'oci-properties-js' 
        || subcommand.toLocaleLowerCase() === 'oci-tabular-js'
        || subcommand.toLocaleLowerCase() === 'oci-terraform-js'
        || subcommand.toLocaleLowerCase() === 'oci-validator-js'
        ) {
        // Source Schema file will be first in the list after command
        const input_filename = args.values.schema
        const input_data = fs.readFileSync(input_filename, 'utf-8')
        // Generated root directory will be second in the list after command
        const outputDirectory = args.values.destination
        const schema = JSON.parse(input_data)
        const force_resource_file = args.values.force
        let generator = undefined
        if (subcommand.toLocaleLowerCase() === 'oci-model-js') generator = new OcdModelGenerator()
        else if (subcommand.toLocaleLowerCase() === 'oci-properties-js') generator = new OcdPropertiesGenerator()
        else if (subcommand.toLocaleLowerCase() === 'oci-terraform-js') generator = new OciTerraformGenerator()
        else if (subcommand.toLocaleLowerCase() === 'oci-tabular-js') generator = new OcdTabularGenerator()
        else if (subcommand.toLocaleLowerCase() === 'oci-validator-js') generator = new OcdValidatorGenerator()
        Object.entries(schema).forEach(([key, value]) => {
            generator.generate(key, value)
            generator.writeFiles(outputDirectory, key, force_resource_file)
        })
        if (generator.resources.length > 0) {
            // console.info(generator.resourceFile)
            const resource_file_name = path.join(outputDirectory, 'resources.ts')
            fs.writeFileSync(resource_file_name, generator.resourceFile)
        }
    } 
} else if (command.toLocaleLowerCase() === 'import') {
        // Source Schema file will be first in the list after command
        const input_filename = args.values.input
        const input_data = fs.readFileSync(input_filename, 'utf-8')
        // Generated root directory will be second in the list after command
        const output_filename = args.values.output
        const source_schema = JSON.parse(input_data)
        let importer = undefined
        if (subcommand.toLocaleLowerCase() === 'terraform-schema') importer = new OciTerraformSchemaImporter()
        importer.convert(source_schema)
        fs.writeFileSync(output_filename, JSON.stringify(importer.ocd_schema, null, 2))
}
