/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Author: Andrew Hopkinson
*/

class OkitCodeGenerator {
    resource_map = {
        // oci_containerengine_cluster: 'cluster',
        // oci_containerengine_node_pool: 'node_pool',

        // oci_core_cpe: 'cpe',
        // oci_core_dhcp_options: 'dhcp_options',
        // oci_core_drg: 'drg',
        // oci_core_instance: 'instance',
        // oci_core_instance_pool: 'instance_pool',
        // oci_core_internet_gateway: 'internet_gateway',
        // oci_core_ipsec: 'ipsec',
        // oci_core_local_peering_gateway: 'local_peering_gateway',
        // oci_core_nat_gateway: 'nat_gateway',
        // oci_core_network_security_group: 'network_security_group',
        // oci_core_remote_peering_connection: 'remote_peering_connection',
        // oci_core_route_table: 'route_table',
        oci_core_security_list: 'security_list',
        // oci_core_service_gateway: 'service_gateway',
        // oci_core_subnet: 'subnet',
        // oci_core_vcn: 'vcn',
        // oci_core_volume: 'volume',
        // oci_core_volume_group: 'volume_group',

        // oci_database_autonomous_database: 'autonomous_database',
        // oci_database_db_system: 'db_system',

        // oci_file_storage_file_system: 'file_system',

        // oci_identity_compartment: 'compartment',

        // oci_load_balancer_load_balancer: 'load_balancer',
        // oci_load_balancer_backend: 'backend',
        // oci_load_balancer_backend_set: 'backend_set',

        // oci_mysql_mysql_db_system: 'mysql_db_system',

        // oci_objectstorage_bucket: 'bucket',
    }
    common_elements = [
        'compartment_id', // Common Element
        'defined_tags',   // Common Element
        'display_name',   // Common Element
        'freeform_tags',  // Common Element
        'id',             // Common Element
        'name',           // Common Element
    ]
    ignore_elements = [
        'inactive_state', 
        'is_accessible',
        'state', 
        'time_created'
    ]

    constructor(resource, definition) {
        this.resources = []
        // this.resource = resource
        // this.definition = definition
        // this.createSchema()
        // this.generate()
    }

    get today() {
        const today = new Date()
        return `${today.getDate() < 10 ? '0' : ''}${today.getDate()}/${today.getMonth() + 1 < 10 ? '0' : ''}${today.getMonth() + 1}/${today.getFullYear()}`
    }

    get now() {
        const today = new Date()
        // return `${today.getDate() < 10 ? '0' : ''}${today.getDate()}/${today.getMonth() + 1 < 10 ? '0' : ''}${today.getMonth() + 1}/${today.getFullYear()} `
        return `${this.today} ${today.getHours()}:${today.getMinutes() < 10 ? '0' : ''}${today.getMinutes()}:${today.getSeconds() < 10 ? '0' : ''}${today.getSeconds()}`
    }

    get copyright() {
        return `/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/`
    }

    get author() {
        return `
/*
** Author: Andrew Hopkinson
*/`
    }

    get auto_generated_warning() {
        return `
/*
** ======================================================================
** === Auto Generated Code All Edits Will Be Lost During Regeneration ===
** ======================================================================
**
** Generated : ${this.now}
**
*/`
    }

    createSchema(definition) {
        return this.getAttributes(definition.block)
        // this.schema = this.getAttributes(definition.block)
        // console.info(this.generateClassName(), 'Schema:', JSON.stringify(this.schema, null, 2))
    }

    generate(resource, definition) {
        this.resources.push(resource)
        const schema = this.createSchema(definition)
        this.resource_file = this.generateResourcesFile(this.resources)
        this.resource_class_file = this.generateResourceClass(resource, schema)
        this.resource_custom_class_file = this.generateCustomResourceClass(resource, schema)
    }

    generateResourcesFile(resources) {
        const contents = `${this.copyright}
${this.author}
${this.auto_generated_warning}
        
export { ${this.root_class} } from './${this.root_class_js}'
${resources.map((r) => 'export { ' + this.titleCase(this.resource_map[r].split('_').join(' ')).split(' ').join('') + " } from './" + this.resource_map[r] + '/' + this.resource_map[r] + ".js'").join('\n')}
    `
            return contents
            }

    generateResourceClass(resource, schema) {
        const class_name = this.generateSuperClassName(resource)
        const contents = `${this.copyright}
${this.author}
${this.auto_generated_warning}

import { ${this.root_class} } from '../${this.root_class_js}'

class ${class_name} extends ${this.root_class} {
    static model = {
        ${this.generateModel(schema).join('\n        ')}
    }

    constructor(resource) {
        super(resource)
        this.tf_resource_name = '${resource}'
    }
}

export default ${class_name}
export { ${class_name} }
`
        return contents
    }

    generateCustomResourceClass(resource) {
        const super_class_name = this.generateSuperClassName(resource)
        const super_class_filename = this.generateSuperClassFilename(resource)
        const class_name = this.generateClassName(resource)
        const contents = `${this.copyright}
${this.author}

import { ${super_class_name} } from '${super_class_filename}'

class ${class_name} extends ${super_class_name} {
    constructor(resource) {
        super(resource)
    }
}

export default ${class_name}
export { ${class_name} }
`
        return contents
    }

    generateClassName(resource) {return this.titleCase(this.resource_map[resource].split('_').join(' ')).split(' ').join('')}

    generateSuperClassName(resource) {return `${this.generateClassName(resource)}Super`}

    generateSuperClassFilename(resource) {return `${this.resource_map[resource]}_generated.js`}

    titleCase(str) {
        // return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()})
        return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
    }

    generateModel(obj) {
        return Object.entries(obj).filter(([k, v]) => !this.ignore_elements.includes(k)).map(([k, v]) => 
            `${k}: {
                required: ${v.required ? v.required : false},
                editable: true,
                type: 'datalist',
                label: '${this.titleCase(k.split('_').join(' '))}'
            },`
        )
    }

    generateConstructor(obj) {
        return Object.entries(obj).map(([key,value]) => key +  Array.isArray(value) ?  ' = []' : value instanceof Object ? ` = ${this.generateConstructor(value).join(', ')}` : "''")
    }

    getAttributes(block) {
        const ignore_block_tyoes = ['timeouts']
        // Simple attributes
        let attributes = Object.entries(block.attributes).filter(([k, v]) => !this.ignore_elements.includes(k)).reduce((r, [k, v]) => {
            r[k] = {
                required: v.required ? v.required : false,
                editable: true,
                type: v.type,
                label: this.titleCase(k.split('_').join(' '))
            }
            return r
        }, {})
        // Block / Object Attributes
        if (block.block_types) {
            attributes = Object.entries(block.block_types).filter(([k, v]) => !ignore_block_tyoes.includes(k)).reduce((r, [k, v]) => {
                r[k] = this.getAttributes(v.block)
                return r
            }, attributes)
        }
        return attributes
    }
}

export default OkitCodeGenerator
export { OkitCodeGenerator }

