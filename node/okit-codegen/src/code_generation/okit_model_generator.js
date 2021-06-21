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
${this.generateConstructor(schema).join('\n')}
    }
}

export default ${class_name}
export { ${class_name} }
`
// ${Object.keys(schema).filter((key) => !this.ignore_elements.includes(key)).map((key) => key + ' = undefined').join('\n        ')}
        return contents
    }

    generateConstructor(obj, depth=1, assign=' = ') {
        return Object.entries(obj).filter(([k, v]) => ![...this.common_elements, 'definition'].includes(k)).map(([k, v]) => `${this.indent(depth)}${k}${assign}${v.definition.type === 'string' ? "''" : v.definition.type === 'object' ? '{\n' + this.generateConstructor(v, depth+1, ': ').join(',\n') + '\n' + this.indent(depth) + '}' : v.definition.type === 'bool' ? 'false' : v.definition.type === 'number' ? 0 : v.definition.type === 'map' ? '{}' : v.definition.type === 'set' ? '[]' : v.definition.type === 'list' ? '[]' : undefined}`)
    }

    indent(depth) {
        return depth > 0 ? `        ${Array((depth-1)*2).fill(' ').join('')}` : '        '
    }

}

export default OkitModelGenerator
export { OkitModelGenerator }

