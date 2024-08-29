/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Drg Attachment View Javascript');

/*
** Define Drg Attachment View Class
*/
class DrgAttachmentView extends OkitCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        if (!json_view.drg_attachments) json_view.drg_attachments = [];
        super(artefact, json_view);
    }
    get parent_id() {return this.artefact.vcn_id;}
    get parent() {return this.getJsonView().getVirtualCloudNetwork(this.parent_id);}
    // ---- Connectors
    get top_bottom_connectors_preferred() {return false;}
    /*
    ** SVG Processing
    */
    // Draw Connections
    drawConnections() {
        this.drawConnection(this.id, this.drg_id);
    }
    /*
    ** Property Sheet Load function
    */
    newPropertiesSheet() {
        this.properties_sheet = new DrgAttachmentProperties(this.artefact)
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return DrgAttachment.getArtifactReference();
    }
    static getDropTargets() {
        return [VirtualCloudNetwork.getArtifactReference()];
    }
}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropDrgAttachmentView = function(target) {
    for (let resource of this.getDrgAttachments()) {
        if (resource.vcn_id === target.id) {
            alert('The maximum limit of 1 DRG Attachment per Virtual Cloud Network has been exceeded for ' + this.getVirtualCloudNetwork(target.id).display_name);
            return null;
        }
    }
    let view_artefact = this.newDrgAttachment();
    if (target.type === VirtualCloudNetwork.getArtifactReference()) {
        view_artefact.getArtefact().vcn_id = target.id;
        view_artefact.getArtefact().compartment_id = target.compartment_id;
    } else if (target.type === Compartment.getArtifactReference()) {
        view_artefact.getArtefact().compartment_id = target.id;
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newDrgAttachment = function(obj) {
    this.getDrgAttachments().push(obj ? new DrgAttachmentView(obj, this) : new DrgAttachmentView(this.okitjson.newDrgAttachment(), this));
    return this.getDrgAttachments()[this.getDrgAttachments().length - 1];
}
OkitJsonView.prototype.getDrgAttachments = function() {
    if (!this.drg_attachments) {
        this.drg_attachments = [];
    }
    return this.drg_attachments;
}
OkitJsonView.prototype.getDrgAttachment = function(id='') {
    for (let artefact of this.getDrgAttachments()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadDrgAttachments = function(drg_attachments) {
    for (const artefact of drg_attachments) {
        this.getDrgAttachments().push(new DrgAttachmentView(new DrgAttachment(artefact, this.okitjson), this));
    }
}
OkitJsonView.prototype.moveDrgAttachment = function(id) {
    // Build Dialog
    const self = this;
    let drg_attachment = this.getDrgAttachment(id);
    $(jqId('modal_dialog_title')).text('Move ' + drg_attachment.display_name);
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
        .attr('id', 'move_drg_attachment_subnet_id');
    // Load Subnets
    this.loadSubnetsSelect('move_drg_attachment_subnet_id');
    $(jqId("move_drg_attachment_subnet_id")).val(drg_attachment.artefact.subnet_id);
    // Submit Button
    const submit = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'submit_query_btn')
        .attr('type', 'button')
        .text('Move')
        .on('click', function () {
            $(jqId('modal_dialog_wrapper')).addClass('hidden');
            if (drg_attachment.artefact.subnet_id !== $(jqId("move_drg_attachment_subnet_id")).val()) {
                self.getSubnet(drg_attachment.artefact.subnet_id).recalculate_dimensions = true;
                self.getSubnet($(jqId("move_drg_attachment_subnet_id")).val()).recalculate_dimensions = true;
                drg_attachment.artefact.subnet_id = $(jqId("move_drg_attachment_subnet_id")).val();
                drg_attachment.artefact.compartment_id = self.getSubnet(drg_attachment.artefact.subnet_id).artefact.compartment_id;
            }
            self.update(this.okitjson);
        });
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}
OkitJsonView.prototype.pasteDrgAttachment = function(drop_target) {
    const clone = this.copied_artefact.artefact.clone();
    clone.display_name += 'Copy';
    if (this.paste_count) {clone.display_name += `-${this.paste_count}`;}
    this.paste_count += 1;
    clone.id = clone.okit_id;
    if (drop_target.getArtifactReference() === Subnet.getArtifactReference()) {
        clone.subnet_id = drop_target.id;
        clone.compartment_id = drop_target.compartment_id;
    }
    this.okitjson.getDrgAttachments().push(clone);
    this.update(this.okitjson);
}
OkitJsonView.prototype.loadDrgAttachmentsSelect = function(select_id, empty_option=false) {
    $(jqId(select_id)).empty();
    const drg_attachment_select = $(jqId(select_id));
    if (empty_option) {
        drg_attachment_select.append($('<option>').attr('value', '').text(''));
    }
    for (let drg_attachment of this.getDrgAttachments()) {
        drg_attachment_select.append($('<option>').attr('value', drg_attachment.id).text(drg_attachment.display_name));
    }
}
OkitJsonView.prototype.loadDrgAttachmentsMultiSelect = function(select_id) {
    $(jqId(select_id)).empty();
    const multi_select = d3.select(d3Id(select_id));
    for (let drg_attachment of this.getDrgAttachments()) {
        const div = multi_select.append('div');
        div.append('input')
            .attr('type', 'checkbox')
            .attr('id', safeId(drg_attachment.id))
            .attr('value', drg_attachment.id);
        div.append('label')
            .attr('for', safeId(drg_attachment.id))
            .text(drg_attachment.display_name);
    }
}
