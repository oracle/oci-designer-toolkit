/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Database Javascript');

/*
** Define Database Class
*/
class Database extends OkitArtifact {
    /*
    ** Create
    */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.display_name = this.generateDefaultName(okitjson.databases.length + 1);
        this.compartment_id = data.parent_id;
        this.read_only = true;
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
        return new Database(JSON.clone(this), this.getOkitJson());
    }
    /*
    ** Name Generation
    */
    getNamePrefix() {
        return super.getNamePrefix() + 'd';
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return 'Database';
    }
}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newDatabase = function(data) {
    this.getDatabases().push(new Database(data, this));
    return this.getDatabases()[this.getDatabases().length - 1];
}
OkitJson.prototype.getDatabases = function() {
    if (!this.databases) {
        this.databases = [];
    }
    return this.databases;
}
OkitJson.prototype.getDatabase = function(id='') {
    for (let artefact of this.getDatabases()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
return undefined;
}
OkitJson.prototype.deleteDatabase = function(id) {
    for (let i = 0; i < this.databases.length; i++) {
        if (this.databases[i].id === id) {
            this.databases[i].delete();
            this.databases.splice(i, 1);
            break;
        }
    }
}

