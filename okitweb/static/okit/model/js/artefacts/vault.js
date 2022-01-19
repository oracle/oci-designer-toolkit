/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Vault Javascript');

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
        // this.display_name = this.generateDefaultName(okitjson.vaults.length + 1);
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
    ** Clone Functionality
    */
    clone() {
        return new Vault(JSON.clone(this), this.getOkitJson());
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
    if (!this.vaults) {
        this.vaults = [];
    }
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

