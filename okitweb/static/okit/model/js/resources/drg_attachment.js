/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Drg Attachment Javascript');

/*
** Define Drg Attachment Class
*/
class DrgAttachment extends OkitArtifact {
    /*
    ** Create
    */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        // this.display_name = this.generateDefaultName(okitjson.drg_attachments.length + 1);
        this.compartment_id = data.compartment_id;
        this.drg_id = '';
        this.drg_route_table_id = '';
        this.network_details = {
            id: '',
            type: 'VCN',
            route_table_id: ''
        }
        // Update with any passed data
        this.merge(data);
        this.convert();
        // Expose vcn_id at the top level
        delete this.vcn_id;
        Object.defineProperty(this, 'vcn_id', {get: function() {return this.network_details.id;}, set: function(id) {this.network_details.id = id;}, enumerable: true });
        // Expose route_table_id at the top level
        delete this.route_table_id;
        Object.defineProperty(this, 'route_table_id', {get: function() {return this.network_details.route_table_id;}, set: function(id) {this.network_details.route_table_id = id;}, enumerable: true });
    }
    /*
    ** Name Generation
    */
    getNamePrefix() {
        return super.getNamePrefix() + 'da';
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return 'Drg Attachment';
    }
}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newDrgAttachment = function(data) {
    this.getDrgAttachments().push(new DrgAttachment(data, this));
    return this.getDrgAttachments()[this.getDrgAttachments().length - 1];
}
OkitJson.prototype.getDrgAttachments = function() {
    if (!this.drg_attachments) {
        this.drg_attachments = [];
    }
    return this.drg_attachments;
}
OkitJson.prototype.getDrgAttachment = function(id='') {
    for (let artefact of this.getDrgAttachments()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
return undefined;
}
OkitJson.prototype.deleteDrgAttachment = function(id) {
    this.drg_attachments = this.drg_attachments ? this.drg_attachments.filter((r) => r.id !== id) : []
}

