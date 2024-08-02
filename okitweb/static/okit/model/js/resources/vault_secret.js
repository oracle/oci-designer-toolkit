/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
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
        this.description = ''
        this.secret_content = {
            content: `var.${this.display_name}_secret`,
            content_type: 'BASE64'
        }
        this.vault_id = ''
        this.key_id = ''
        // Update with any passed data
        this.merge(data);
        this.convert();
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

