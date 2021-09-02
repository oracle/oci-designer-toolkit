/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded User Javascript');

/*
** Define User Class
*/
class User extends OkitArtifact {
    /*
    ** Create
    */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.display_name = this.generateDefaultName(okitjson.users.length + 1);
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
        return new User(JSON.clone(this), this.getOkitJson());
    }
    /*
    ** Name Generation
    */
    getNamePrefix() {
        return super.getNamePrefix() + 'u';
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return 'User';
    }
}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newUser = function(data) {
    this.getUsers().push(new User(data, this));
    return this.getUsers()[this.getUsers().length - 1];
}
OkitJson.prototype.getUsers = function() {
    if (!this.users) {
        this.users = [];
    }
    return this.users;
}
OkitJson.prototype.getUser = function(id='') {
    for (let artefact of this.getUsers()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
return undefined;
}
OkitJson.prototype.deleteUser = function(id) {
    for (let i = 0; i < this.users.length; i++) {
        if (this.users[i].id === id) {
            this.users[i].delete();
            this.users.splice(i, 1);
            break;
        }
    }
}

