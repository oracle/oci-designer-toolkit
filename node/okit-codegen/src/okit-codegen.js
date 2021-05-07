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
    if (subcommand.toLocaleLowerCase() === 'okit-model-js' || subcommand.toLocaleLowerCase() === 'okit-properties-js' || subcommand.toLocaleLowerCase() === 'okit-terraform-js') {
        // Source Schema file will be first in the list after command
        const input_filename = args[2]
        const input_data = fs.readFileSync(input_filename, 'utf-8')
        // Generated root directory will be second in the list after command
        const output_dir = args[3]
        const schema = JSON.parse(input_data)
        let resources = []
        let generator = undefined
        if (subcommand.toLocaleLowerCase() === 'okit-model-js') generator = new OkitModelGenerator()
        else if (subcommand.toLocaleLowerCase() === 'okit-properties-js') generator = new OkitPropertiesGenerator()
        else if (subcommand.toLocaleLowerCase() === 'okit-terraform-js') generator = new OkitTerraformGenerator()
        Object.entries(schema.provider_schemas["registry.terraform.io/hashicorp/oci"].resource_schemas).forEach(([key,value]) => {
            if (generator.resource_map.hasOwnProperty(key)) {
                generator.generate(key, value)
                const file_dir = path.join(output_dir, generator.resource_map[key])
                const file_name = path.join(file_dir, `${generator.resource_map[key]}.js`)
                const super_file_name = path.join(file_dir, generator.generateSuperClassFilename(key))
                if (!fs.existsSync(file_dir)) fs.mkdirSync(file_dir, {recursive: true})
                fs.writeFileSync(super_file_name, generator.resource_class_file)
                if (!fs.existsSync(file_name)) fs.writeFileSync(file_name, generator.resource_custom_class_file)
            }
        })
        if (generator.resources.length > 0) {
            const resource_file_name = path.join(output_dir, 'resources.js')
            fs.writeFileSync(resource_file_name, generator.resource_file)
        }
    } else if (subcommand.toLocaleLowerCase() === 'okit-model-js') {
        // Source Schema file will be first in the list after command
        const input_filename = args[2]
        const input_data = fs.readFileSync(input_filename, 'utf-8')
        // Generated root directory will be second in the list after command
        const output_dir = args[3]
        const schema = JSON.parse(input_data)
        let resources = []
        Object.entries(schema.provider_schemas["registry.terraform.io/hashicorp/oci"].resource_schemas).forEach(([key,value]) => {
            if (OkitModelGenerator.resource_map.hasOwnProperty(key)) {
                const generator = new OkitModelGenerator(key, value)
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
                const generator = new OkitPropertiesGenerator(key, value)
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
        const generator = new OkitTerraformGenerator()
        Object.entries(schema.provider_schemas["registry.terraform.io/hashicorp/oci"].resource_schemas).forEach(([key,value]) => {
            if (generator.resource_map.hasOwnProperty(key)) {
                // const generator = new OkitTerraformGenerator(key, value)
                // const terraform_file = generator.generate(key, value)
                generator.generate(key, value)
                const file_dir = path.join(output_dir, generator.resource_map[key])
                const file_name = path.join(file_dir, `${generator.resource_map[key]}.js`)
                const super_file_name = path.join(file_dir, generator.generateSuperClassFilename(key))
                if (!fs.existsSync(file_dir)) fs.mkdirSync(file_dir, {recursive: true})
                fs.writeFileSync(super_file_name, generator.resource_class_file)
                if (!fs.existsSync(file_name)) fs.writeFileSync(file_name, generator.resource_custom_class_file)
                // resources.push(key)
            }
        })
        if (generator.resources.length > 0) {
            const resource_file_name = path.join(output_dir, 'resources.js')
            // const resource_terraform_file = OkitTerraformGenerator.generateTerraformResources(resources)
            fs.writeFileSync(resource_file_name, generator.resource_file)
        }
    }
}