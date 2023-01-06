/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Vault Secret Javascript');

/*
** Define Vault Secret Class
*/
class VaultSecret extends OkitArtifact {
    /*
    ** Create
    */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.compartment_id = data.parent_id;
        /*
        ** TODO: Add Resource / Artefact specific parameters and default
        */
        // Update with any passed data
        this.merge(data);
        this.convert();
        // TODO: If the Resource is within a Subnet but the subnet_iss is not at the top level then raise it with the following functions if not required delete them.
        // Expose subnet_id at the top level
        Object.defineProperty(this, 'subnet_id', {get: function() {return this.primary_mount_target.subnet_id;}, set: function(id) {this.primary_mount_target.subnet_id = id;}, enumerable: false });
    }
    /*
    ** Name Generation
    */
    getNamePrefix() {
        return super.getNamePrefix() + 'vs';
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return 'Vault Secret';
    }
}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newVaultSecret = function(data) {
    this.getVaultSecrets().push(new VaultSecret(data, this));
    return this.getVaultSecrets()[this.getVaultSecrets().length - 1];
}
OkitJson.prototype.getVaultSecrets = function() {
    if (!this.vault_secrets) this.vault_secrets = []
    return this.vault_secrets;
}
OkitJson.prototype.getVaultSecret = function(id='') {
    return this.getVaultSecrets().find(r => r.id === id)
}
OkitJson.prototype.deleteVaultSecret = function(id) {
    this.vault_secrets = this.vault_secrets ? this.vault_secrets.filter((r) => r.id !== id) : []
}

