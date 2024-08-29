/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Bastion View Javascript');

/*
** Define Bastion View Class
*/
class BastionView extends OkitCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        if (!json_view.bastions) json_view.bastions = [];
        super(artefact, json_view);
    }
    // -- Reference
    get parent_id() {
        let primary_subnet = this.getJsonView().getSubnet(this.subnet_id);
        if (primary_subnet && primary_subnet.compartment_id === this.artefact.compartment_id) {
            return this.subnet_id;
        } else {
            return this.compartment_id;
        }
    }
    get parent() {return this.getJsonView().getSubnet(this.parent_id) ? this.getJsonView().getSubnet(this.parent_id) : this.getJsonView().getCompartment(this.parent_id);}
    // Direct Subnet Access
    get subnet_id() {return this.artefact.target_subnet_id;}
    set subnet_id(id) {this.artefact.target_subnet_id = id;}
    /*
    ** SVG Processing
    */
    /*
    ** Property Sheet Load function
    */
    newPropertiesSheet() {
        this.properties_sheet = new BastionProperties(this.artefact)
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return Bastion.getArtifactReference();
    }
    static getDropTargets() {
        return [Compartment.getArtifactReference(), Subnet.getArtifactReference()];
    }
}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropBastionView = function(target) {
    let view_artefact = this.newBastion();
    if (target.type === Subnet.getArtifactReference()) {
        view_artefact.getArtefact().target_subnet_id = target.id;
        view_artefact.getArtefact().compartment_id = target.compartment_id;
    } else if (target.type === Compartment.getArtifactReference()) {
        view_artefact.getArtefact().compartment_id = target.id;
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newBastion = function(obj) {
    this.getBastions().push(obj ? new BastionView(obj, this) : new BastionView(this.okitjson.newBastion(), this));
    return this.getBastions()[this.getBastions().length - 1];
}
OkitJsonView.prototype.getBastions = function() {
    if (!this.bastions) {
        this.bastions = [];
    }
    return this.bastions;
}
OkitJsonView.prototype.getBastion = function(id='') {
    for (let artefact of this.getBastions()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadBastions = function(bastions) {
    for (const artefact of bastions) {
        this.getBastions().push(new BastionView(new Bastion(artefact, this.okitjson), this));
    }
}
OkitJsonView.prototype.moveBastion = function(id) {
    // Build Dialog
    const self = this;
    let bastion = this.getBastion(id);
    $(jqId('modal_dialog_title')).text('Move ' + bastion.display_name);
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
        .attr('id', 'move_bastion_subnet_id');
    // Load Subnets
    this.loadSubnetsSelect('move_bastion_subnet_id');
    $(jqId("move_bastion_subnet_id")).val(bastion.artefact.subnet_id);
    // Submit Button
    const submit = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'submit_query_btn')
        .attr('type', 'button')
        .text('Move')
        .on('click', function () {
            $(jqId('modal_dialog_wrapper')).addClass('hidden');
            if (bastion.artefact.subnet_id !== $(jqId("move_bastion_subnet_id")).val()) {
                self.getSubnet(bastion.artefact.subnet_id).recalculate_dimensions = true;
                self.getSubnet($(jqId("move_bastion_subnet_id")).val()).recalculate_dimensions = true;
                bastion.artefact.subnet_id = $(jqId("move_bastion_subnet_id")).val();
                bastion.artefact.compartment_id = self.getSubnet(bastion.artefact.subnet_id).artefact.compartment_id;
            }
            self.update(this.okitjson);
        });
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}
OkitJsonView.prototype.pasteBastion = function(drop_target) {
    const clone = this.copied_artefact.artefact.clone();
    clone.display_name += 'Copy';
    if (this.paste_count) {clone.display_name += `-${this.paste_count}`;}
    this.paste_count += 1;
    clone.id = clone.okit_id;
    if (drop_target.getArtifactReference() === Subnet.getArtifactReference()) {
        clone.subnet_id = drop_target.id;
        clone.compartment_id = drop_target.compartment_id;
    }
    this.okitjson.getBastions().push(clone);
    this.update(this.okitjson);
}
OkitJsonView.prototype.loadBastionsSelect = function(select_id, empty_option=false) {
    $(jqId(select_id)).empty();
    const bastion_select = $(jqId(select_id));
    if (empty_option) {
        bastion_select.append($('<option>').attr('value', '').text(''));
    }
    for (let bastion of this.getBastions()) {
        bastion_select.append($('<option>').attr('value', bastion.id).text(bastion.display_name));
    }
}
OkitJsonView.prototype.loadBastionsMultiSelect = function(select_id) {
    $(jqId(select_id)).empty();
    const multi_select = d3.select(d3Id(select_id));
    for (let bastion of this.getBastions()) {
        const div = multi_select.append('div');
        div.append('input')
            .attr('type', 'checkbox')
            .attr('id', safeId(bastion.id))
            .attr('value', bastion.id);
        div.append('label')
            .attr('for', safeId(bastion.id))
            .text(bastion.display_name);
    }
}
