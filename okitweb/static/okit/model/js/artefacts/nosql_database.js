/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded NoSQL Database Javascript');

/*
** Define NoSQL Database Class
*/
class NoSQLDatabase extends OkitArtifact {
    /*
    ** Create
    */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        // this.display_name = this.generateDefaultName(okitjson.nosql_databases.length + 1);
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
        return super.getNamePrefix() + 'nd';
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return 'NoSQL Database';
    }
}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newNoSQLDatabase = function(data) {
    this.getNoSQLDatabases().push(new NoSQLDatabase(data, this));
    return this.getNoSQLDatabases()[this.getNoSQLDatabases().length - 1];
}
OkitJson.prototype.getNoSQLDatabases = function() {
    if (!this.nosql_databases) {
        this.nosql_databases = [];
    }
    return this.nosql_databases;
}
OkitJson.prototype.getNoSQLDatabase = function(id='') {
    for (let artefact of this.getNoSQLDatabases()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
return undefined;
}
OkitJson.prototype.deleteNoSQLDatabase = function(id) {
    this.nosql_databases = this.nosql_databases ? this.nosql_databases.filter((r) => r.id !== id) : []
}

