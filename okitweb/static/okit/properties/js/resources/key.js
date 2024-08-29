/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Key Properties Javascript');

/*
** Define Key Properties Class
*/
class KeyProperties extends OkitResourceProperties {
    constructor (resource) {
        const resource_tabs = []
        super(resource, resource_tabs)
    }

    curve_id_length = {NIST_P256: 32, NIST_P384: 48, NIST_P521: 66}

    // Build Additional Resource Specific Properties
    buildResource() {
        // Protection Mode
        const pm_data = {options: {HSM: 'HSM', SOFTWARE: 'Software'}}
        const protection_mode = this.createInput('select', 'Protection Mode', `${this.id}_protection_mode`, '', (d, i, n) => {this.resource.protection_mode = n[i].value}, pm_data)
        this.protection_mode = protection_mode.input
        this.protection_mode_row = protection_mode.row
        this.append(this.core_tbody, protection_mode.row)
        // Algorithm
        const alg_data = {options: {AES: 'AES', RSA: 'RSA', ECDSA: 'ECDSA'}}
        const algorithm = this.createInput('select', 'Key Shape: Algorithm', `${this.id}_algorithm`, '', (d, i, n) => {this.resource.key_shape.algorithm = n[i].value; this.handleAlgorithmChange(n[i].value)}, alg_data)
        this.algorithm = algorithm.input
        this.algorithm_row = algorithm.row
        this.append(this.core_tbody, algorithm.row)
        // Length
        const length_data = {options: {16: '128 bits', 24: '192 bits', 32: '256 bits'}}
        const length = this.createInput('select', 'Key Shape: Length', `${this.id}_length`, '', (d, i, n) => {this.resource.key_shape.length = n[i].value}, length_data)
        this.length = length.input
        this.length_row = length.row
        this.append(this.core_tbody, length.row)
        // Length
        const curve_id_data = {options: {NIST_P256: 'NIST_P256', NIST_P384: 'NIST_P384', NIST_P521: 'NIST_P521'}}
        const curve_id = this.createInput('select', 'Key Shape: Elliptic Curve Id', `${this.id}_curve_id`, '', (d, i, n) => {this.resource.key_shape.curve_id = n[i].value; this.resource.key_shape.length = this.curve_id_length[n[i].value]}, curve_id_data)
        this.curve_id = curve_id.input
        this.curve_id_row = curve_id.row
        this.append(this.core_tbody, curve_id.row)
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        // Load Selects
        // Assign Values
        this.protection_mode.property('value', this.resource.protection_mode)
        this.algorithm.property('value', this.resource.key_shape.algorithm)
        this.length.property('value', this.resource.key_shape.length)
        this.curve_id.property('value', this.resource.key_shape.curve_id)
        this.handleAlgorithmChange()
    }

    // Handlers
    handleAlgorithmChange(algorithm) {
        algorithm = algorithm ? algorithm : this.resource.key_shape.algorithm
        const aes_options = new Map([
            ['128 bits', 16], 
            ['192 bits', 24], 
            ['256 bits', 32]
        ])
        const rsa_options = new Map([
            ['2048 bits', 256], 
            ['3072 bits', 384], 
            ['4096 bits', 512]
        ])
        const ecdsa_options = new Map([
            ['256 bits', 32], 
            ['384 bits', 48], 
            ['528 bits', 66]
        ])
        this.loadSelectFromMap(this.length, algorithm === 'AES' ? aes_options : rsa_options)
        // Show / Hide Rows
        this.length_row.classed('collapsed', algorithm === 'ECDSA')
        this.curve_id_row.classed('collapsed', algorithm !== 'ECDSA')
        if (algorithm === 'ECDSA') {
            this.resource.key_shape.curve_id = ['NIST_P256', 'NIST_P384', 'NIST_P521'].includes(this.resource.key_shape.curve_id) ? this.resource.key_shape.curve_id : 'NIST_P256'
            this.resource.key_shape.length = this.curve_id_length[this.resource.key_shape.curve_id]
        } else if (algorithm === 'AES') {
            this.resource.key_shape.curve_id = ''
            this.resource.key_shape.length = [16, 24, 32].includes(this.resource.key_shape.length) ? this.resource.key_shape.length : 16
        } else {
            this.resource.key_shape.curve_id = ''
            this.resource.key_shape.length = [256, 384, 512].includes(this.resource.key_shape.length) ? this.resource.key_shape.length : 256
        }
        this.length.property('value', this.resource.key_shape.length)
        this.curve_id.property('value', this.resource.key_shape.curve_id)
    }

}
