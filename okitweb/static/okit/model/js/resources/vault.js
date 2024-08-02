/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Vault Javascript');

/*
** Define Vault Class
*/
class Vault extends OkitArtifact {
    /*
    ** Create
    */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.compartment_id = data.parent_id;
        this.vault_type = 'DEFAULT'
        // Update with any passed data
        this.merge(data);
        this.convert();
    }
    /*
    ** Name Generation
    */
    getNamePrefix() {
        return super.getNamePrefix() + 'v';
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return 'Vault';
    }
}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newVault = function(data) {
    this.getVaults().push(new Vault(data, this));
    return this.getVaults()[this.getVaults().length - 1];
}
OkitJson.prototype.getVaults = function() {
    if (!this.vaults) this.vaults = []
    return this.vaults;
}
OkitJson.prototype.getVault = function(id='') {
    for (let artefact of this.getVaults()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
return undefined;
}
OkitJson.prototype.deleteVault = function(id) {
    this.vaults = this.vaults ? this.vaults.filter((r) => r.id !== id) : []
}

