/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Db Home Javascript');

/*
** Define Db Home Class
*/
class DbHome extends OkitArtifact {
    /*
    ** Create
    */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        // this.display_name = this.generateDefaultName(okitjson.db_homes.length + 1);
        this.compartment_id = data.parent_id;
        this.read_only = true;
        // Update with any passed data
        this.merge(data);
        this.convert();
    }
    /*
    ** Name Generation
    */
    getNamePrefix() {
        return super.getNamePrefix() + 'dh';
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return 'Db Home';
    }
}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newDbHome = function(data) {
    this.getDbHomes().push(new DbHome(data, this));
    return this.getDbHomes()[this.getDbHomes().length - 1];
}
OkitJson.prototype.getDbHomes = function() {
    if (!this.db_homes) {
        this.db_homes = [];
    }
    return this.db_homes;
}
OkitJson.prototype.getDbHome = function(id='') {
    for (let artefact of this.getDbHomes()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
return undefined;
}
OkitJson.prototype.deleteDbHome = function(id) {
    this.db_homes = this.db_homes ? this.db_homes.filter((r) => r.id !== id) : []
}

