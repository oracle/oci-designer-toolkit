/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Author: Andrew Hopkinson
*/

class OkitModelGenerator {
    static resource_map = {
        oci_core_subnet: 'subnet',
        oci_core_vcn: 'vcn'
    }
    constructor(resource, schema) {
        this.resource = resource
        this.schema = schema
    }

    generate() {
        const class_name = this.generateClassName()
        let model = `
        /*
        ** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
        ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
        */
        
        /*
        ** Author: Andrew Hopkinson
        */
        
        class ${class_name} {
            static model = {}
            constructor() {
                ${Object.entries(this.schema).forEach(([key,value]) => {
                    key = value
                })}
            }
        }
        
        export default ${class_name}
        export { ${class_name} }
        `
        return model
    }

    generateClassName() {
        return this.titleCase(OkitModelGenerator.resource_map[this.resource].split('_').join(' ')).split(' ').join('')
    }

    titleCase(str) {
        return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    }

    getAttributes() {

    }
}

export default OkitModelGenerator
export { OkitModelGenerator }

