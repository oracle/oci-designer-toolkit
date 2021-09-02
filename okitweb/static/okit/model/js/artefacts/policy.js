/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Policy Javascript');

/*
** Define Policy Class
*/
class Policy extends OkitArtifact {
    /*
    ** Create
    */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.display_name = this.generateDefaultName(okitjson.policys.length + 1);
        this.compartment_id = data.parent_id;
        this.description = '';
        this.statements = [];
        this.version_date = '';
        // Update with any passed data
        this.merge(data);
        this.convert();
    }
    /*
    ** Clone Functionality
    */
    clone() {
        return new Policy(JSON.clone(this), this.getOkitJson());
    }
    /*
    ** Name Generation
    */
    getNamePrefix() {
        return super.getNamePrefix() + 'p';
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return 'Policy';
    }
}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newPolicy = function(data) {
    this.getPolicys().push(new Policy(data, this));
    return this.getPolicys()[this.getPolicys().length - 1];
}
OkitJson.prototype.getPolicys = function() {
    if (!this.policys) {
        this.policys = [];
    }
    return this.policys;
}
OkitJson.prototype.getPolicy = function(id='') {
    for (let artefact of this.getPolicys()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
return undefined;
}
OkitJson.prototype.deletePolicy = function(id) {
    for (let i = 0; i < this.policys.length; i++) {
        if (this.policys[i].id === id) {
            this.policys[i].delete();
            this.policys.splice(i, 1);
            break;
        }
    }
}

