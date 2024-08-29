/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Group View Javascript');

/*
** Define Group View Class
*/
class GroupView extends OkitCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        if (!json_view.groups) json_view.groups = [];
        super(artefact, json_view);
    }
    get parent_id() {return this.artefact.compartment_id;}
    get parent() {return this.getJsonView().getCompartment(this.parent_id);}
    /*
    ** SVG Processing
    */
    draw() {}
    /*
    ** Property Sheet Load function
    */
    loadProperties() {
        const self = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/group.html", () => {loadPropertiesSheet(self.artefact);});
    }
    /*
    ** Load and display Value Proposition
    */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/group.html");
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return Group.getArtifactReference();
    }
    static getDropTargets() {
        return [Compartment.getArtifactReference()];
    }
}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropGroupView = function(target) {
    let view_artefact = this.newGroup();
    if (target.type === Compartment.getArtifactReference()) {
        view_artefact.artefact.compartment_id = target.id;
    } else {
        view_artefact.artefact.compartment_id = target.compartment_id;
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newGroup = function(obj) {
    this.getGroups().push(obj ? new GroupView(obj, this) : new GroupView(this.okitjson.newGroup(), this));
    return this.getGroups()[this.getGroups().length - 1];
}
OkitJsonView.prototype.getGroups = function() {
    if (!this.groups) {
        this.groups = [];
    }
    return this.groups;
}
OkitJsonView.prototype.getGroup = function(id='') {
    for (let artefact of this.getGroups()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadGroups = function(groups) {
    for (const artefact of groups) {
        this.getGroups().push(new GroupView(new Group(artefact, this.okitjson), this));
    }
}
OkitJsonView.prototype.moveGroup = function(id) {
    // Build Dialog
    const self = this;
    let group = this.getGroup(id);
    $(jqId('modal_dialog_title')).text('Move ' + group.display_name);
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
        .attr('id', 'move_group_subnet_id');
    // Load Subnets
    this.loadSubnetsSelect('move_group_subnet_id');
    $(jqId("move_group_subnet_id")).val(group.artefact.subnet_id);
    // Submit Button
    const submit = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'submit_query_btn')
        .attr('type', 'button')
        .text('Move')
        .on('click', function () {
            $(jqId('modal_dialog_wrapper')).addClass('hidden');
            if (group.artefact.subnet_id !== $(jqId("move_group_subnet_id")).val()) {
                self.getSubnet(group.artefact.subnet_id).recalculate_dimensions = true;
                self.getSubnet($(jqId("move_group_subnet_id")).val()).recalculate_dimensions = true;
                group.artefact.subnet_id = $(jqId("move_group_subnet_id")).val();
                group.artefact.compartment_id = self.getSubnet(group.artefact.subnet_id).artefact.compartment_id;
            }
            self.update(this.okitjson);
        });
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}
OkitJsonView.prototype.pasteGroup = function(drop_target) {
    const clone = this.copied_artefact.artefact.clone();
    clone.display_name += 'Copy';
    if (this.paste_count) {clone.display_name += `-${this.paste_count}`;}
    this.paste_count += 1;
    clone.id = clone.okit_id;
    if (drop_target.getArtifactReference() === Subnet.getArtifactReference()) {
        clone.subnet_id = drop_target.id;
        clone.compartment_id = drop_target.compartment_id;
    }
    this.okitjson.getGroups().push(clone);
    this.update(this.okitjson);
}
OkitJsonView.prototype.loadGroupsSelect = function(select_id, empty_option=false) {
    $(jqId(select_id)).empty();
    const group_select = $(jqId(select_id));
    if (empty_option) {
        group_select.append($('<option>').attr('value', '').text(''));
    }
    for (let group of this.getGroups()) {
        group_select.append($('<option>').attr('value', group.id).text(group.display_name));
    }
}
OkitJsonView.prototype.loadGroupsMultiSelect = function(select_id) {
    $(jqId(select_id)).empty();
    const multi_select = d3.select(d3Id(select_id));
    for (let group of this.getGroups()) {
        const div = multi_select.append('div');
        div.append('input')
            .attr('type', 'checkbox')
            .attr('id', safeId(group.id))
            .attr('value', group.id);
        div.append('label')
            .attr('for', safeId(group.id))
            .text(group.display_name);
    }
}
