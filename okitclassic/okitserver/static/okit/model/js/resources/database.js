/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Database Javascript');

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
        // this.display_name = this.generateDefaultName(okitjson.databases.length + 1);
        this.compartment_id = data.parent_id;
        this.read_only = true;
        // Update with any passed data
        this.merge(data);
        this.convert();
        if (this.db_name) this.display_name = this.db_name
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
    this.databases = this.databases ? this.databases.filter((r) => r.id !== id) : []
}

