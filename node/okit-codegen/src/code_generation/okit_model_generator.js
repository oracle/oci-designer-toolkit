/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Author: Andrew Hopkinson
*/

import { OkitCodeGenerator } from './okit_code_generator.js'

class OkitModelGenerator extends OkitCodeGenerator {
    root_class = 'OkitResourceModel'
    root_class_js = 'okit_resource_model.js'
    generateResourceClass(resource, schema) {
        const class_name = this.generateSuperClassName(resource)
        const contents = `${this.copyright}
${this.author}
${this.auto_generated_warning}

import { ${this.root_class} } from '../${this.root_class_js}'

class ${class_name} extends ${this.root_class} {
    constructor() {
        super()
        ${Object.keys(schema).filter((key) => !this.ignore_elements.includes(key)).map((key) => key + ' = undefined').join('\n        ')}
    }
}

export default ${class_name}
export { ${class_name} }
`
        return contents
    }

    static generateModelResources1(resources) {
        const model = `
/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Author: Andrew Hopkinson
*/

export { OkitResourceModel } from './okit_resource_model.js'
${resources.map((r) => 'export { ' + OkitModelGenerator.titleCase(OkitModelGenerator.resource_map[r].split('_').join(' ')).split(' ').join('') + " } from './" + OkitModelGenerator.resource_map[r] + '/' + OkitModelGenerator.resource_map[r] + ".js'").join('\n')}
`
        return model
    }

    generate1() {
        const class_name = this.generateClassName()
        let model = `${this.copyright}
${this.author}
${this.auto_generated_warning}

import { OkitResourceModel } from '../okit_resource_model.js'

class ${class_name} extends OkitResourceModel {
    constructor() {
        super()
        ${Object.keys(this.schema).filter((key) => !this.ignore_elements.includes(key)).map((key) => key + ' = undefined').join('\n        ')}
    }
}

export default ${class_name}
export { ${class_name} }
`
        return model
    }
}

export default OkitModelGenerator
export { OkitModelGenerator }

