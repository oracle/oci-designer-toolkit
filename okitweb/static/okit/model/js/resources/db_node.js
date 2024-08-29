/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Db Node Javascript');

/*
** Define Db Node Class
*/
class DbNode extends OkitArtifact {
    /*
    ** Create
    */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        // this.display_name = this.generateDefaultName(okitjson.db_nodes.length + 1);
        this.compartment_id = data.parent_id;
        this.read_only = true;
        // Update with any passed data
        this.merge(data);
        this.convert();
        if (this.hostname) this.display_name = this.hostname
    }
    /*
    ** Name Generation
    */
    getNamePrefix() {
        return super.getNamePrefix() + 'dn';
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return 'Db Node';
    }
}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newDbNode = function(data) {
    this.getDbNodes().push(new DbNode(data, this));
    return this.getDbNodes()[this.getDbNodes().length - 1];
}
OkitJson.prototype.getDbNodes = function() {
    if (!this.db_nodes) {
        this.db_nodes = [];
    }
    return this.db_nodes;
}
OkitJson.prototype.getDbNode = function(id='') {
    for (let artefact of this.getDbNodes()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
return undefined;
}
OkitJson.prototype.deleteDbNode = function(id) {
    this.db_nodes = this.db_nodes ? this.db_nodes.filter((r) => r.id !== id) : []
}

