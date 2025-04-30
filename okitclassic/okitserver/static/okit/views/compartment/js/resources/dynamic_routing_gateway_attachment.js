/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Dynamic Routing Gateway Attachment View Javascript');

/*
** Define Dynamic Routing Gateway Attachment View Class
*/
class DynamicRoutingGatewayAttachmentView extends OkitCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        if (!json_view.dynamic_routing_gateway_attachments) json_view.dynamic_routing_gateway_attachments = [];
        super(artefact, json_view);
    }
    get parent_id() {return this.artefact.vcn_id && this.artefact.vcn_id !== '' ? this.artefact.vcn_id : this.artefact.compartment_id;}
    get parent() {return this.artefact.vcn_id && this.artefact.vcn_id !== '' ? this.getJsonView().getVirtualCloudNetwork(this.parent_id) : this.getJsonView().getCompartment(this.parent_id);}
    // ---- Connectors
    get top_bottom_connectors_preferred() {return false;}
    /*
    ** SVG Processing
    */
    /*
    ** Property Sheet Load function
    */
    newPropertiesSheet() {
        this.properties_sheet = new DynamicRoutingGatewayAttachmentProperties(this.artefact)
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return DynamicRoutingGatewayAttachment.getArtifactReference();
    }
    static getDropTargets() {
        return [VirtualCloudNetwork.getArtifactReference()];
    }
}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropDynamicRoutingGatewayAttachmentView = function(target) {
    for (let resource of this.getDynamicRoutingGatewayAttachments()) {
        if (resource.vcn_id === target.id) {
            alert('The maximum limit of 1 DRG Attachment per Virtual Cloud Network has been exceeded for ' + this.getVirtualCloudNetwork(target.id).display_name);
            return null;
        }
    }
    let view_artefact = this.newDynamicRoutingGatewayAttachment();
    if (target.type === VirtualCloudNetwork.getArtifactReference()) {
        view_artefact.getArtefact().vcn_id = target.id;
        view_artefact.getArtefact().compartment_id = target.compartment_id;
    } else if (target.type === Compartment.getArtifactReference()) {
        view_artefact.getArtefact().compartment_id = target.id;
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newDynamicRoutingGatewayAttachment = function(obj) {
    this.getDynamicRoutingGatewayAttachments().push(obj ? new DynamicRoutingGatewayAttachmentView(obj, this) : new DynamicRoutingGatewayAttachmentView(this.okitjson.newDynamicRoutingGatewayAttachment(), this));
    return this.getDynamicRoutingGatewayAttachments()[this.getDynamicRoutingGatewayAttachments().length - 1];
}
OkitJsonView.prototype.getDynamicRoutingGatewayAttachments = function() {
    if (!this.dynamic_routing_gateway_attachments) this.dynamic_routing_gateway_attachments = [];
    return this.dynamic_routing_gateway_attachments;
}
OkitJsonView.prototype.getDynamicRoutingGatewayAttachment = function(id='') {
    return this.getDynamicRoutingGatewayAttachments().find(r => r.id === id)
}
OkitJsonView.prototype.loadDynamicRoutingGatewayAttachments = function(dynamic_routing_gateway_attachments) {
    for (const artefact of dynamic_routing_gateway_attachments) {
        this.getDynamicRoutingGatewayAttachments().push(new DynamicRoutingGatewayAttachmentView(new DynamicRoutingGatewayAttachment(artefact, this.okitjson), this));
    }
}
OkitJsonView.prototype.moveDynamicRoutingGatewayAttachment = function(id) {
    // Build Dialog
    const self = this;
    let dynamic_routing_gateway_attachment = this.getDynamicRoutingGatewayAttachment(id);
    $(jqId('modal_dialog_title')).text('Move ' + dynamic_routing_gateway_attachment.display_name);
    $(jqId('modal_dialog_body')).empty();
    $(jqId('modal_dialog_footer')).empty();
    const table = d3.select(d3Id('modal_dialog_body')).append('div')
        .attr('class', 'table okit-table');
    const tbody = table.append('div')
        .attr('class', 'tbody');
    // Subnet
    let tr = tbody.append('div')
        .attr('class', 'tr');
    tr.append('div')
        .attr('class', 'td')
        .text('Subnet');
    tr.append('div')
        .attr('class', 'td')
        .append('select')
        .attr('id', 'move_dynamic_routing_gateway_attachment_subnet_id');
    // Load Subnets
    this.loadSubnetsSelect('move_dynamic_routing_gateway_attachment_subnet_id');
    $(jqId("move_dynamic_routing_gateway_attachment_subnet_id")).val(dynamic_routing_gateway_attachment.artefact.subnet_id);
    // Submit Button
    const submit = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'submit_query_btn')
        .attr('type', 'button')
        .text('Move')
        .on('click', function () {
            $(jqId('modal_dialog_wrapper')).addClass('hidden');
            if (dynamic_routing_gateway_attachment.artefact.subnet_id !== $(jqId("move_dynamic_routing_gateway_attachment_subnet_id")).val()) {
                self.getSubnet(dynamic_routing_gateway_attachment.artefact.subnet_id).recalculate_dimensions = true;
                self.getSubnet($(jqId("move_dynamic_routing_gateway_attachment_subnet_id")).val()).recalculate_dimensions = true;
                dynamic_routing_gateway_attachment.artefact.subnet_id = $(jqId("move_dynamic_routing_gateway_attachment_subnet_id")).val();
                dynamic_routing_gateway_attachment.artefact.compartment_id = self.getSubnet(dynamic_routing_gateway_attachment.artefact.subnet_id).artefact.compartment_id;
            }
            self.update(this.okitjson);
        });
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}
OkitJsonView.prototype.pasteDynamicRoutingGatewayAttachment = function(drop_target) {
    const clone = this.copied_artefact.artefact.clone();
    clone.display_name += 'Copy';
    if (this.paste_count) {clone.display_name += `-${this.paste_count}`;}
    this.paste_count += 1;
    clone.id = clone.okit_id;
    if (drop_target.getArtifactReference() === Subnet.getArtifactReference()) {
        clone.subnet_id = drop_target.id;
        clone.compartment_id = drop_target.compartment_id;
    }
    this.okitjson.getDynamicRoutingGatewayAttachments().push(clone);
    this.update(this.okitjson);
}
OkitJsonView.prototype.loadDynamicRoutingGatewayAttachmentsSelect = function(select_id, empty_option=false) {
    $(jqId(select_id)).empty();
    const dynamic_routing_gateway_attachment_select = $(jqId(select_id));
    if (empty_option) {
        dynamic_routing_gateway_attachment_select.append($('<option>').attr('value', '').text(''));
    }
    for (let dynamic_routing_gateway_attachment of this.getDynamicRoutingGatewayAttachments()) {
        dynamic_routing_gateway_attachment_select.append($('<option>').attr('value', dynamic_routing_gateway_attachment.id).text(dynamic_routing_gateway_attachment.display_name));
    }
}
OkitJsonView.prototype.loadDynamicRoutingGatewayAttachmentsMultiSelect = function(select_id) {
    $(jqId(select_id)).empty();
    const multi_select = d3.select(d3Id(select_id));
    for (let dynamic_routing_gateway_attachment of this.getDynamicRoutingGatewayAttachments()) {
        const div = multi_select.append('div');
        div.append('input')
            .attr('type', 'checkbox')
            .attr('id', safeId(dynamic_routing_gateway_attachment.id))
            .attr('value', dynamic_routing_gateway_attachment.id);
        div.append('label')
            .attr('for', safeId(dynamic_routing_gateway_attachment.id))
            .text(dynamic_routing_gateway_attachment.display_name);
    }
}
