/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
// TODO: Remove Following
// @ts-nocheck

import fs from 'fs'
import path from 'path'
import { OcdMarkdownGenerator, OciModelGenerator, OcdPropertiesGenerator, OcdTabularGenerator, OciTerraformGenerator, OciTerraformSchemaImporter, OciValidatorGenerator, OcdTerraformSchemaResourceAttributesGenerator } from '@ocd/codegen'
import { AzureModelGenerator, AzureAzTerraformSchemaImporter, AzureValidatorGenerator } from '@ocd/codegen'
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
        || subcommand.toLocaleLowerCase() === 'oci-markdown-js' 
        || subcommand.toLocaleLowerCase() === 'oci-properties-js' 
        || subcommand.toLocaleLowerCase() === 'oci-tabular-js'
        || subcommand.toLocaleLowerCase() === 'oci-terraform-js'
        || subcommand.toLocaleLowerCase() === 'oci-validator-js'
        || subcommand.toLocaleLowerCase() === 'azureaz-model-js'
        || subcommand.toLocaleLowerCase() === 'azureaz-validator-js'
        ) {
        // Source Schema file will be first in the list after command
        const input_filename = args.values.schema
        const input_data = fs.readFileSync(input_filename, 'utf-8')
        // Generated root directory will be second in the list after command
        const outputDirectory = args.values.destination
        const schema = JSON.parse(input_data)
        // console.debug('Schema', schema)
        const force_resource_file = args.values.force
        let generator = undefined
        if (subcommand.toLocaleLowerCase() === 'oci-model-js') generator = new OciModelGenerator()
        else if (subcommand.toLocaleLowerCase() === 'oci-markdown-js') generator = new OcdMarkdownGenerator()
        else if (subcommand.toLocaleLowerCase() === 'oci-properties-js') generator = new OcdPropertiesGenerator()
        else if (subcommand.toLocaleLowerCase() === 'oci-terraform-js') generator = new OciTerraformGenerator()
        else if (subcommand.toLocaleLowerCase() === 'oci-tabular-js') generator = new OcdTabularGenerator()
        else if (subcommand.toLocaleLowerCase() === 'oci-validator-js') generator = new OciValidatorGenerator()
        else if (subcommand.toLocaleLowerCase() === 'azureaz-model-js') generator = new AzureModelGenerator()
        else if (subcommand.toLocaleLowerCase() === 'azureaz-validator-js') generator = new AzureValidatorGenerator()
        if (generator !== undefined) {
            Object.entries(schema).forEach(([key, value]) => {
                generator.generate(key, value)
                generator.writeFiles(outputDirectory, key, force_resource_file)
            })
            if (generator.resources.length > 0) {
                // console.info(generator.resourceFile)
                const resource_file_name = path.join(outputDirectory, 'resources.ts')
                fs.writeFileSync(resource_file_name, generator.resourceFile)
            }
        } else {
            console.debug(`ocd-codegen: generate sub-command ${subcommand} does not exist.`)
        }
    } else {
        console.debug(`ocd-codegen: generate sub-command ${subcommand} does not exist.`)
    }
} else if (command.toLocaleLowerCase() === 'import') {
        // Source Schema file will be first in the list after command
        const input_filename = args.values.input
        const input_data = fs.readFileSync(input_filename, 'utf-8')
        // Generated root directory will be second in the list after command
        const output_filename = args.values.output
        const source_schema = JSON.parse(input_data)
        let importer = undefined
        if (subcommand.toLocaleLowerCase() === 'oci-terraform-schema') importer = new OciTerraformSchemaImporter()
        else if (subcommand.toLocaleLowerCase() === 'azureaz-terraform-schema') importer = new AzureAzTerraformSchemaImporter()
        else if (subcommand.toLocaleLowerCase() === 'terraform-schema-resource-attributes') importer = new OcdTerraformSchemaResourceAttributesGenerator()
        if (importer !== undefined) {
            importer.convert(source_schema)
            fs.writeFileSync(output_filename, JSON.stringify(importer.ocd_schema, null, 2))
        } else {
            console.debug(`ocd-codegen: import sub-command ${subcommand} does not exist.`)
        }
} else {
    console.debug(`ocd-codegen: command ${command} does not exist.`)
}
