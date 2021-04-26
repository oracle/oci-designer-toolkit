/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Db Home Javascript');

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
        this.display_name = this.generateDefaultName(okitjson.db_homes.length + 1);
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
        return new DbHome(JSON.clone(this), this.getOkitJson());
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
    for (let i = 0; i < this.db_homes.length; i++) {
        if (this.db_homes[i].id === id) {
            this.db_homes[i].delete();
            this.db_homes.splice(i, 1);
            break;
        }
    }
}

