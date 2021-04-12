/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Author: Andrew Hopkinson
*/

/*
** Author: Andrew Hopkinson
*/

import fs from 'fs'
import { JSDOM } from 'jsdom';
import { OkitData } from 'okit-node/src/data/okit.js'
import { OkitView } from 'okit-node/src/view/okit_view.js'
import { OkitJsonImporter } from 'okit-node/src/importer/okit_json_importer.js'
// Create Simple HTML Page with OKIT Canvas div
const dom = new JSDOM(`<!DOCTYPE html><body><div id="okit-canvas-div"></div></body>`);
const window = dom.window
const document = dom.window.document

const args = process.argv.splice(2)

console.info('')

// Read command as first argument
const command = args[0]
const subcommand = args[1]
if (command.toLocaleLowerCase() === 'generate') {
    if (subcommand.toLocaleLowerCase() === 'svg') {
        // Source OKIT file will be first in the list after command
        const input_filename = args[2]
        const input_data = fs.readFileSync(input_filename, 'utf-8')
        // Generated SVG file will be second in the list after command
        const output_filename = args[3]
        const okitData = new OkitData(input_data)
        const okitView = new OkitView(okitData, document, 'okit-canvas-div', undefined, false, 'none', false, true)
        okitView.draw()
        // Generated SVG file will be second in the list
        const svg_string = document.getElementById("okit-canvas-div").innerHTML
        fs.writeFileSync(output_filename, svg_string)

        console.info('')
        console.info(`SVG Output Written to : ${output_filename}`)
    }
} else if (command.toLocaleLowerCase() === 'import') {
    if (subcommand.toLocaleLowerCase() === 'okit-json') {
        const input_filename = args[2]
        const input_data = fs.readFileSync(input_filename, 'utf-8')
        const output_filename = args[3]
        // console.info(input_data)
        const okitJsonImporter = new OkitJsonImporter(input_data)
        const okitData = okitJsonImporter.convert()
        fs.writeFileSync(output_filename, okitData.toString())

        console.info('')
        console.info(`OKIT Output Written to : ${output_filename}`)
    }
}