/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Bastion Javascript');

/*
** Define Bastion Class
*/
class Bastion extends OkitArtifact {
    /*
    ** Create
    */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        // # Required
        // this.display_name = this.generateDefaultName(okitjson.bastions.length + 1);
        this.compartment_id = '';
        this.bastion_type = 'STANDARD';
        this.target_subnet_id = '';
        // # Optional
        this.client_cidr_block_allow_list = [];
        this.max_session_ttl_in_seconds = 180 * 60;
        this.phone_book_entry = '';
        this.static_jump_host_ip_addresses = [];
        // Update with any passed data
        this.merge(data);
        this.convert();
        // Expose subnet_id at the top level
        Object.defineProperty(this, 'subnet_id', {get: function() {return this.target_subnet_id;}, set: function(id) {this.target_subnet_id = id;}, enumerable: false });
    }
    /*
    ** Name Generation
    */
    getNamePrefix() {
        return super.getNamePrefix() + 'b';
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return 'Bastion';
    }
}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newBastion = function(data) {
    this.getBastions().push(new Bastion(data, this));
    return this.getBastions()[this.getBastions().length - 1];
}
OkitJson.prototype.getBastions = function() {
    if (!this.bastions) {
        this.bastions = [];
    }
    return this.bastions;
}
OkitJson.prototype.getBastion = function(id='') {
    for (let artefact of this.getBastions()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJson.prototype.deleteBastion = function(id) {
    this.bastions = this.bastions ? this.bastions.filter((r) => r.id !== id) : []
}

