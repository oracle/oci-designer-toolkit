/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Author: Andrew Hopkinson
*/

import fs from 'fs'
import path from 'path'
import { OkitData } from 'okit-node/src/data/okit.js'
import { OkitModelGenerator } from './code_generation/okit_model_generator.js'
import { OkitPropertiesGenerator } from './code_generation/okit_properties_generator.js'
import { OkitTerraformGenerator } from './code_generation/okit_terraform_generator.js'

const args = process.argv.splice(2)

console.info('')

// Read command as first argument
const command = args[0]
const subcommand = args[1]
if (command.toLocaleLowerCase() === 'generate') {
    if (subcommand.toLocaleLowerCase() === 'okit-model-js') {
        // Source Schema file will be first in the list after command
        const input_filename = args[2]
        const input_data = fs.readFileSync(input_filename, 'utf-8')
        // Generated root directory will be second in the list after command
        const output_dir = args[3]
        const schema = JSON.parse(input_data)
        let resources = []
        Object.entries(schema.provider_schemas["registry.terraform.io/hashicorp/oci"].resource_schemas).forEach(([key,value]) => {
            if (OkitModelGenerator.resource_map.hasOwnProperty(key)) {
                const generator = new OkitModelGenerator(key, value.block.attributes)
                const model_file = generator.generate()
                const model_file_dir = path.join(output_dir, OkitModelGenerator.resource_map[key])
                const model_file_name = path.join(model_file_dir, `${OkitModelGenerator.resource_map[key]}.js`)
                // console.info(model_file_dir)
                // console.info(model_file_name)
                // console.info(model_file)
                if (!fs.existsSync(model_file_dir)) fs.mkdirSync(model_file_dir, {recursive: true})
                fs.writeFileSync(model_file_name, model_file)
                resources.push(key)
            }
        })
        if (resources.length > 0) {
            const resource_model_file_name = path.join(output_dir, 'resources.js')
            const resource_model_file = OkitModelGenerator.generateModelResources(resources)
            fs.writeFileSync(resource_model_file_name, resource_model_file)
        }
    } else if (subcommand.toLocaleLowerCase() === 'okit-properties-js') {
        // Source Schema file will be first in the list after command
        const input_filename = args[2]
        const input_data = fs.readFileSync(input_filename, 'utf-8')
        // Generated root directory will be second in the list after command
        const output_dir = args[3]
        const schema = JSON.parse(input_data)
        let resources = []
        Object.entries(schema.provider_schemas["registry.terraform.io/hashicorp/oci"].resource_schemas).forEach(([key,value]) => {
            if (OkitPropertiesGenerator.resource_map.hasOwnProperty(key)) {
                const generator = new OkitPropertiesGenerator(key, value.block.attributes)
                const properties_file = generator.generate()
                const properties_file_dir = path.join(output_dir, OkitPropertiesGenerator.resource_map[key])
                const properties_file_name = path.join(properties_file_dir, `${OkitPropertiesGenerator.resource_map[key]}.js`)
                // console.info(properties_file_dir)
                // console.info(properties_file_name)
                // console.info(properties_file)
                if (!fs.existsSync(properties_file_dir)) fs.mkdirSync(properties_file_dir, {recursive: true})
                fs.writeFileSync(properties_file_name, properties_file)
                resources.push(key)
            }
        })
        if (resources.length > 0) {
            const resource_properties_file_name = path.join(output_dir, 'resources.js')
            const resource_properties_file = OkitPropertiesGenerator.generatePropertiesResources(resources)
            fs.writeFileSync(resource_properties_file_name, resource_properties_file)
        }
    } else if (subcommand.toLocaleLowerCase() === 'okit-terraform-js') {
        // Source Schema file will be first in the list after command
        const input_filename = args[2]
        const input_data = fs.readFileSync(input_filename, 'utf-8')
        // Generated root directory will be second in the list after command
        const output_dir = args[3]
        const schema = JSON.parse(input_data)
        let resources = []
        Object.entries(schema.provider_schemas["registry.terraform.io/hashicorp/oci"].resource_schemas).forEach(([key,value]) => {
            if (OkitTerraformGenerator.resource_map.hasOwnProperty(key)) {
                const generator = new OkitTerraformGenerator(key, value.block.attributes)
                const terraform_file = generator.generate()
                const terraform_file_dir = path.join(output_dir, OkitTerraformGenerator.resource_map[key])
                const terraform_file_name = path.join(terraform_file_dir, `${OkitTerraformGenerator.resource_map[key]}.js`)
                // console.info(terraform_file_dir)
                // console.info(terraform_file_name)
                // console.info(terraform_file)
                if (!fs.existsSync(terraform_file_dir)) fs.mkdirSync(terraform_file_dir, {recursive: true})
                fs.writeFileSync(terraform_file_name, terraform_file)
                resources.push(key)
            }
        })
        if (resources.length > 0) {
            const resource_terraform_file_name = path.join(output_dir, 'resources.js')
            const resource_terraform_file = OkitTerraformGenerator.generateTerraformResources(resources)
            fs.writeFileSync(resource_terraform_file_name, resource_terraform_file)
        }
    }
}