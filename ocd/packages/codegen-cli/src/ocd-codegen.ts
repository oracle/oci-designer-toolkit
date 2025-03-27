/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import fs from 'fs'
import path from 'path'
import { OcdSchema, OciModelGenerator, OciTerraformGenerator, OciTerraformImportGenerator, OciTerraformSchemaImporter, OciValidatorGenerator, OcdTerraformSchemaResourceAttributesGenerator, OciMarkdownGenerator, OciPropertiesGenerator, OciTabularGenerator, AzureMarkdownGenerator, AzurePropertiesGenerator, AzureTabularGenerator, AzureTerraformGenerator, AzureModelGenerator, AzureAzTerraformSchemaImporter, AzureRmTerraformSchemaImporter, AzureValidatorGenerator, GoogleTerraformSchemaImporter, GoogleModelGenerator, GoogleMarkdownGenerator, GooglePropertiesGenerator, GoogleTerraformGenerator, GoogleTabularGenerator, GoogleValidatorGenerator, OciExcelGenerator } from '@ocd/codegen'
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
} as const
const args = parseArgs({options: options, allowPositionals: true})

// console.info(args)
console.info('')

// Read command as first argument
const command = args.positionals[0]
const subcommand = args.positionals[1]
if (command.toLocaleLowerCase() === 'generate') {
    // Source Schema file will be first in the list after command
    const input_filename: string = args.values.schema as string || ''
    const input_data = fs.readFileSync(input_filename, 'utf-8')
    // Generated root directory will be second in the list after command
    const outputDirectory = args.values.destination as string
    const schema = JSON.parse(input_data)
    // console.debug('Schema', schema)
    const force_resource_file = args.values.force as boolean
    let generator = undefined
    if (subcommand.toLocaleLowerCase() === 'oci-model-js') generator = new OciModelGenerator()
    else if (subcommand.toLocaleLowerCase() === 'oci-markdown-js') generator = new OciMarkdownGenerator()
    else if (subcommand.toLocaleLowerCase() === 'oci-properties-js') generator = new OciPropertiesGenerator()
    else if (subcommand.toLocaleLowerCase() === 'oci-terraform-js') generator = new OciTerraformGenerator()
    else if (subcommand.toLocaleLowerCase() === 'oci-tabular-js') generator = new OciTabularGenerator()
    else if (subcommand.toLocaleLowerCase() === 'oci-validator-js') generator = new OciValidatorGenerator()
    else if (subcommand.toLocaleLowerCase() === 'oci-excel-js') generator = new OciExcelGenerator()
    else if (subcommand.toLocaleLowerCase() === 'oci-terraform-import-js') generator = new OciTerraformImportGenerator()
    // else if (subcommand.toLocaleLowerCase() === 'azureaz-model-js') generator = new AzureModelGenerator()
    // else if (subcommand.toLocaleLowerCase() === 'azureaz-validator-js') generator = new AzureValidatorGenerator()
    else if (subcommand.toLocaleLowerCase() === 'azurerm-model-js') generator = new AzureModelGenerator()
    else if (subcommand.toLocaleLowerCase() === 'azurerm-markdown-js') generator = new AzureMarkdownGenerator()
    else if (subcommand.toLocaleLowerCase() === 'azurerm-properties-js') generator = new AzurePropertiesGenerator()
    else if (subcommand.toLocaleLowerCase() === 'azurerm-terraform-js') generator = new AzureTerraformGenerator()
    else if (subcommand.toLocaleLowerCase() === 'azurerm-tabular-js') generator = new AzureTabularGenerator()
    else if (subcommand.toLocaleLowerCase() === 'azurerm-validator-js') generator = new AzureValidatorGenerator()
    else if (subcommand.toLocaleLowerCase() === 'google-model-js') generator = new GoogleModelGenerator()
    else if (subcommand.toLocaleLowerCase() === 'google-markdown-js') generator = new GoogleMarkdownGenerator()
    else if (subcommand.toLocaleLowerCase() === 'google-properties-js') generator = new GooglePropertiesGenerator()
    else if (subcommand.toLocaleLowerCase() === 'google-terraform-js') generator = new GoogleTerraformGenerator()
    else if (subcommand.toLocaleLowerCase() === 'google-tabular-js') generator = new GoogleTabularGenerator()
    else if (subcommand.toLocaleLowerCase() === 'google-validator-js') generator = new GoogleValidatorGenerator()
    if (generator !== undefined) {
        Object.entries(schema).forEach(([key, value]) => {
            generator.generate(key, value as OcdSchema)
            generator.writeFiles(outputDirectory, key, force_resource_file)
        })
        if (generator.resources.length > 0) {
            // console.info(generator.resourceFile)
            const fullFilename = path.join(outputDirectory, 'resources.ts')
            fs.writeFileSync(fullFilename, generator.resourceFile)
        }
        generator.generateAdditionalFiles()
        if (generator.additionalFiles.length > 0) {
            generator.additionalFiles.forEach((a) => {
                const fullFilename = path.join(outputDirectory, a.filename)
                fs.writeFileSync(fullFilename, a.contents)
            })
        }
    } else {
        console.debug(`ocd-codegen: generate sub-command ${subcommand} does not exist.`)
    }
} else if (command.toLocaleLowerCase() === 'import') {
    // Source Schema file will be first in the list after command
    const input_filename: string = args.values.input as string || ''
    const input_data = fs.readFileSync(input_filename, 'utf-8')
    // Generated root directory will be second in the list after command
    const output_filename: string = args.values.output as string || ''
    const source_schema = JSON.parse(input_data)
    let importer = undefined
    if (subcommand.toLocaleLowerCase() === 'oci-terraform-schema') importer = new OciTerraformSchemaImporter()
    else if (subcommand.toLocaleLowerCase() === 'azurerm-terraform-schema') importer = new AzureRmTerraformSchemaImporter()
    else if (subcommand.toLocaleLowerCase() === 'azureaz-terraform-schema') importer = new AzureAzTerraformSchemaImporter()
    else if (subcommand.toLocaleLowerCase() === 'google-terraform-schema') importer = new GoogleTerraformSchemaImporter()
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
