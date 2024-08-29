/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Dynamic Routing Gateway Attachment Javascript');

/*
** Define Dynamic Routing Gateway Attachment Class
*/
class DynamicRoutingGatewayAttachment extends OkitArtifact {
    /*
    ** Create
    */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.compartment_id = data.parent_id;
        this.drg_id = ''
        this.vcn_id = ''
        // Update with any passed data
        this.merge(data);
        this.convert();
    }
    /*
    ** Name Generation
    */
    getNamePrefix() {
        return super.getNamePrefix() + 'drga';
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return 'Dynamic Routing Gateway Attachment';
    }
}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newDynamicRoutingGatewayAttachment = function(data) {
    this.getDynamicRoutingGatewayAttachments().push(new DynamicRoutingGatewayAttachment(data, this));
    return this.getDynamicRoutingGatewayAttachments()[this.getDynamicRoutingGatewayAttachments().length - 1];
}
OkitJson.prototype.getDynamicRoutingGatewayAttachments = function() {
    if (!this.dynamic_routing_gateway_attachments) this.dynamic_routing_gateway_attachments = []
    return this.dynamic_routing_gateway_attachments;
}
OkitJson.prototype.getDynamicRoutingGatewayAttachment = function(id='') {
    return this.getDynamicRoutingGatewayAttachments().find(r => r.id === id)
}
OkitJson.prototype.deleteDynamicRoutingGatewayAttachment = function(id) {
    this.dynamic_routing_gateway_attachments = this.dynamic_routing_gateway_attachments ? this.dynamic_routing_gateway_attachments.filter((r) => r.id !== id) : []
}

