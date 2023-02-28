/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import fs from 'fs'
import path from 'path'
import { OcdModelGenerator } from './generator/OcdModelGenerator.js'
import { OcdPropertiesGenerator } from './generator/OcdPropertiesGenerator.js'
import { OciTerraformGenerator } from './generator/OciTerraformGenerator.js'
import { OciTerraformSchemaImporter } from './importer/OciTerraformSchemaImporter.js'

const args = process.argv.splice(2)

console.info('')

// Read command as first argument
const command = args[0]
const subcommand = args[1]
if (command.toLocaleLowerCase() === 'generate') {
    if (subcommand.toLocaleLowerCase() === 'oci-model-js' || subcommand.toLocaleLowerCase() === 'oci-properties-js' || subcommand.toLocaleLowerCase() === 'oci-terraform-js') {
        // Source Schema file will be first in the list after command
        const input_filename = args[2]
        const input_data = fs.readFileSync(input_filename, 'utf-8')
        // Generated root directory will be second in the list after command
        const output_dir = args[3]
        const schema = JSON.parse(input_data)
        let generator = undefined
        if (subcommand.toLocaleLowerCase() === 'oci-model-js') generator = new OcdModelGenerator()
        else if (subcommand.toLocaleLowerCase() === 'oci-properties-js') generator = new OcdPropertiesGenerator()
        else if (subcommand.toLocaleLowerCase() === 'oci-terraform-js') generator = new OciTerraformGenerator()
        Object.entries(schema).forEach(([key, value]) => {
            generator.generate(key, value)
            const file_dir = path.join(output_dir, generator.generateResourcesDirectory(key))
            // console.info(`File Dir : ${file_dir}`)
            // const super_file_dir = path.join(output_dir, generator.generateClassDir(key), generator.generateSuperClassDir(key))
            const file_name = path.join(file_dir, generator.generateClassFilename(key))
            // console.info(`File Name : ${file_name}`)
            // const super_file_name = path.join(super_file_dir, generator.generateSuperClassFilename(key))
            if (!fs.existsSync(file_dir)) fs.mkdirSync(file_dir, {recursive: true})
            // if (!fs.existsSync(super_file_dir)) fs.mkdirSync(super_file_dir, {recursive: true})
            // fs.writeFileSync(super_file_name, generator.resource_class_file)
            fs.writeFileSync(file_name, generator.resourceDefinitionFile)
            // if (!fs.existsSync(file_name)) fs.writeFileSync(file_name, generator.resourceDefinitionFile)
        })
        if (generator.resources.length > 0) {
            // console.info(generator.resourceFile)
            const resource_file_name = path.join(output_dir, 'resources.ts')
            fs.writeFileSync(resource_file_name, generator.resourceFile)
        }
    } 
} else if (command.toLocaleLowerCase() === 'import') {
        // Source Schema file will be first in the list after command
        const input_filename = args[2]
        const input_data = fs.readFileSync(input_filename, 'utf-8')
        // Generated root directory will be second in the list after command
        const output_filename = args[3]
        const source_schema = JSON.parse(input_data)
        let importer = undefined
        if (subcommand.toLocaleLowerCase() === 'terraform-schema') importer = new OciTerraformSchemaImporter()
        importer.convert(source_schema)
        fs.writeFileSync(output_filename, JSON.stringify(importer.ocd_schema, null, 2))
}
