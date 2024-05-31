/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Dynamic Group View Javascript');

/*
** Define Dynamic Group View Class
*/
class DynamicGroupView extends OkitCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        if (!json_view.dynamic_groups) json_view.dynamic_groups = [];
        super(artefact, json_view);
    }
    get parent_id() {return this.artefact.compartment_id;}
    get parent() {return this.getJsonView().getCompartment(this.parent_id);}
    /*
    ** SVG Processing
    */
    /*
    ** Property Sheet Load function
    */
    newPropertiesSheet() {
        this.properties_sheet = new DynamicGroupProperties(this.artefact)
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return DynamicGroup.getArtifactReference();
    }
    static getDropTargets() {
        return [Compartment.getArtifactReference()];
    }
}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropDynamicGroupView = function(target) {
    let view_artefact = this.newDynamicGroup();
    if (target.type === Compartment.getArtifactReference()) {
        view_artefact.artefact.compartment_id = target.id;
    } else {
        view_artefact.artefact.compartment_id = target.compartment_id;
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newDynamicGroup = function(obj) {
    this.getDynamicGroups().push(obj ? new DynamicGroupView(obj, this) : new DynamicGroupView(this.okitjson.newDynamicGroup(), this));
    return this.getDynamicGroups()[this.getDynamicGroups().length - 1];
}
OkitJsonView.prototype.getDynamicGroups = function() {
    if (!this.dynamic_groups) {
        this.dynamic_groups = [];
    }
    return this.dynamic_groups;
}
OkitJsonView.prototype.getDynamicGroup = function(id='') {
    for (let artefact of this.getDynamicGroups()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadDynamicGroups = function(dynamic_groups) {
    for (const artefact of dynamic_groups) {
        this.getDynamicGroups().push(new DynamicGroupView(new DynamicGroup(artefact, this.okitjson), this));
    }
}
OkitJsonView.prototype.moveDynamicGroup = function(id) {
    // Build Dialog
    const self = this;
    let dynamic_group = this.getDynamicGroup(id);
    $(jqId('modal_dialog_title')).text('Move ' + dynamic_group.display_name);
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
        .attr('id', 'move_dynamic_group_subnet_id');
    // Load Subnets
    this.loadSubnetsSelect('move_dynamic_group_subnet_id');
    $(jqId("move_dynamic_group_subnet_id")).val(dynamic_group.artefact.subnet_id);
    // Submit Button
    const submit = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'submit_query_btn')
        .attr('type', 'button')
        .text('Move')
        .on('click', function () {
            $(jqId('modal_dialog_wrapper')).addClass('hidden');
            if (dynamic_group.artefact.subnet_id !== $(jqId("move_dynamic_group_subnet_id")).val()) {
                self.getSubnet(dynamic_group.artefact.subnet_id).recalculate_dimensions = true;
                self.getSubnet($(jqId("move_dynamic_group_subnet_id")).val()).recalculate_dimensions = true;
                dynamic_group.artefact.subnet_id = $(jqId("move_dynamic_group_subnet_id")).val();
                dynamic_group.artefact.compartment_id = self.getSubnet(dynamic_group.artefact.subnet_id).artefact.compartment_id;
            }
            self.update(this.okitjson);
        });
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}
OkitJsonView.prototype.pasteDynamicGroup = function(drop_target) {
    const clone = this.copied_artefact.artefact.clone();
    clone.display_name += 'Copy';
    if (this.paste_count) {clone.display_name += `-${this.paste_count}`;}
    this.paste_count += 1;
    clone.id = clone.okit_id;
    if (drop_target.getArtifactReference() === Subnet.getArtifactReference()) {
        clone.subnet_id = drop_target.id;
        clone.compartment_id = drop_target.compartment_id;
    }
    this.okitjson.getDynamicGroups().push(clone);
    this.update(this.okitjson);
}
OkitJsonView.prototype.loadDynamicGroupsSelect = function(select_id, empty_option=false) {
    $(jqId(select_id)).empty();
    const dynamic_group_select = $(jqId(select_id));
    if (empty_option) {
        dynamic_group_select.append($('<option>').attr('value', '').text(''));
    }
    for (let dynamic_group of this.getDynamicGroups()) {
        dynamic_group_select.append($('<option>').attr('value', dynamic_group.id).text(dynamic_group.display_name));
    }
}
OkitJsonView.prototype.loadDynamicGroupsMultiSelect = function(select_id) {
    $(jqId(select_id)).empty();
    const multi_select = d3.select(d3Id(select_id));
    for (let dynamic_group of this.getDynamicGroups()) {
        const div = multi_select.append('div');
        div.append('input')
            .attr('type', 'checkbox')
            .attr('id', safeId(dynamic_group.id))
            .attr('value', dynamic_group.id);
        div.append('label')
            .attr('for', safeId(dynamic_group.id))
            .text(dynamic_group.display_name);
    }
}
