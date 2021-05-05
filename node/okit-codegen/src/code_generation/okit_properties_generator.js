/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Author: Andrew Hopkinson
*/

import { OkitCodeGenerator } from './okit_code_generator.js'

class OkitPropertiesGenerator extends OkitCodeGenerator {
    static generatePropertiesResources(resources) {
        const model = `
/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Author: Andrew Hopkinson
*/

export { OkitResourceProperties } from './okit_resource_properties.js'
${resources.map((r) => 'export { ' + OkitPropertiesGenerator.titleCase(OkitPropertiesGenerator.resource_map[r].split('_').join(' ')).split(' ').join('') + " } from './" + OkitPropertiesGenerator.resource_map[r] + '/' + OkitPropertiesGenerator.resource_map[r] + ".js'").join('\n')}
`
        return model
    }

    generate() {
        const class_name = this.generateClassName()
        let model = `${this.copyright}
${this.author}
${this.auto_generated_warning}

import { OkitResourceProperties } from '../okit_resource_properties.js'

class ${class_name} extends OkitResourceProperties {
    static model = {
        ${this.generateModel(this.schema).join('\n        ')}
    }
}

export default ${class_name}
export { ${class_name} }
`
        return model
    }

    // generateModel(obj) {
    //     return Object.entries(obj).filter(([k, v]) => !this.ignore_elements.includes(k)).map(([k, v]) => 
    //         `${k}: {
    //             required: ${v.required ? v.required : false},
    //             editable: true,
    //             type: 'datalist',
    //             label: '${OkitPropertiesGenerator.titleCase(k.split('_').join(' '))}'
    //         },`
    //     )
    // }

    // generateConstructor(obj) {
    //     return Object.entries(obj).map(([key,value]) => key +  Array.isArray(value) ?  ' = []' : value instanceof Object ? ` = ${this.generateConstructor(value).join(', ')}` : "''")
    // }

    // getAttributes() {

    // }
}

export default OkitPropertiesGenerator
export { OkitPropertiesGenerator }

