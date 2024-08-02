/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Key Javascript');

/*
** Define Key Class
*/
class Key extends OkitArtifact {
    /*
    ** Create
    */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.compartment_id = data.parent_id;
        this.vault_id = ''
        this.key_shape = {
            algorithm: 'AES',
            length: 32,
            curve_id: ''
        }
        this.management_endpoint = ''
        this.protection_mode = "HSM"
            // Update with any passed data
        this.merge(data);
        this.convert();
    }
    /*
    ** Name Generation
    */
    getNamePrefix() {
        return super.getNamePrefix() + 'k';
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return 'Key';
    }
}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newKey = function(data) {
    this.getKeys().push(new Key(data, this));
    return this.getKeys()[this.getKeys().length - 1];
}
OkitJson.prototype.getKeys = function() {
    if (!this.keys) this.keys = []
    return this.keys;
}
OkitJson.prototype.getKey = function(id='') {
    for (let artefact of this.getKeys()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
return undefined;
}
OkitJson.prototype.deleteKey = function(id) {
    this.keys = this.keys ? this.keys.filter((r) => r.id !== id) : []
}

