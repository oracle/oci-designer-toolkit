/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Drg Attachment Javascript');

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
        this.display_name = this.generateDefaultName(okitjson.drg_attachments.length + 1);
        this.compartment_id = data.parent_id;
        this.vcn_id = '';
        /*
        ** TODO: Add Resource / Artefact specific parameters and default
        */
        // Update with any passed data
        this.merge(data);
        this.convert();
    }
    /*
    ** Clone Functionality
    */
    clone() {
        return new DrgAttachment(JSON.clone(this), this.getOkitJson());
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

