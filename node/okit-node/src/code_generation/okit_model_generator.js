/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Author: Andrew Hopkinson
*/

import { OkitCodeGenerator } from './okit_code_generator.js'

class OkitModelGenerator extends OkitCodeGenerator {
    // static resource_map = {
    //     // oci_core_drg: 'drg',
    //     oci_core_instance: 'instance',
    //     oci_core_instance_pool: 'instance_pool',
    //     // oci_core_internet_gateway: 'intergnet_gateway',
    //     // oci_core_ipsec: 'ipsec',
    //     // oci_core_local_peering_gateway: 'local_peering_gateway',
    //     // oci_core_nat_gateway: 'nat_gateway',
    //     // oci_core_network_security_group: 'network_security_group',
    //     // oci_core_remote_peering_connection: 'remote_peering_connection',
    //     // oci_core_route_table: 'route_table',
    //     // oci_core_security_list: 'security_list',
    //     // oci_core_service_gateway: 'service_gateway',
    //     oci_core_subnet: 'subnet',
    //     oci_core_vcn: 'vcn',
    //     // oci_core_volume: 'volume',
    //     // oci_core_volume_group: 'volume_group',
    //     // oci_database_autonomous_database: 'autonomous_database',
    // }
    // ignore_elements = ['id', 'compartment_id', 'display_name', 'name', 'defined_tags', 'freeform_tags', 'state', 'time_created']
    // constructor(resource, schema) {
    //     this.resource = resource
    //     this.schema = schema
    // }

    static generateModelResources(resources) {
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

import { OkitResourceModel } from '../okit_resource_model.js'

class ${class_name} extends OkitResourceModel {
    static model = {}
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

    generateConstructor(obj) {
        return Object.entries(obj).map(([key,value]) => key +  Array.isArray(value) ?  ' = []' : value instanceof Object ? ` = ${this.generateConstructor(value).join(', ')}` : "''")
    }

    // generateClassName() {
    //     return OkitModelGenerator.titleCase(OkitModelGenerator.resource_map[this.resource].split('_').join(' ')).split(' ').join('')
    // }

    // static titleCase(str) {
    //     return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    // }

    getAttributes() {

    }
}

export default OkitModelGenerator
export { OkitModelGenerator }

