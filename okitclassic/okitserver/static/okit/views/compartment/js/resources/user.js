/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded User View Javascript');

/*
** Define User View Class
*/
class UserView extends OkitCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        if (!json_view.users) json_view.users = [];
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
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/user.html", () => {loadPropertiesSheet(self.artefact);});
    }
    /*
    ** Load and display Value Proposition
    */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/user.html");
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return User.getArtifactReference();
    }
    static getDropTargets() {
        return [Compartment.getArtifactReference()];
    }
}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropUserView = function(target) {
    let view_artefact = this.newUser();
    if (target.type === Compartment.getArtifactReference()) {
        view_artefact.artefact.compartment_id = target.id;
    } else {
        view_artefact.artefact.compartment_id = target.compartment_id;
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newUser = function(obj) {
    this.getUsers().push(obj ? new UserView(obj, this) : new UserView(this.okitjson.newUser(), this));
    return this.getUsers()[this.getUsers().length - 1];
}
OkitJsonView.prototype.getUsers = function() {
    if (!this.users) {
        this.users = [];
    }
    return this.users;
}
OkitJsonView.prototype.getUser = function(id='') {
    for (let artefact of this.getUsers()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadUsers = function(users) {
    for (const artefact of users) {
        this.getUsers().push(new UserView(new User(artefact, this.okitjson), this));
    }
}
OkitJsonView.prototype.moveUser = function(id) {
    // Build Dialog
    const self = this;
    let user = this.getUser(id);
    $(jqId('modal_dialog_title')).text('Move ' + user.display_name);
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
        .attr('id', 'move_user_subnet_id');
    // Load Subnets
    this.loadSubnetsSelect('move_user_subnet_id');
    $(jqId("move_user_subnet_id")).val(user.artefact.subnet_id);
    // Submit Button
    const submit = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'submit_query_btn')
        .attr('type', 'button')
        .text('Move')
        .on('click', function () {
            $(jqId('modal_dialog_wrapper')).addClass('hidden');
            if (user.artefact.subnet_id !== $(jqId("move_user_subnet_id")).val()) {
                self.getSubnet(user.artefact.subnet_id).recalculate_dimensions = true;
                self.getSubnet($(jqId("move_user_subnet_id")).val()).recalculate_dimensions = true;
                user.artefact.subnet_id = $(jqId("move_user_subnet_id")).val();
                user.artefact.compartment_id = self.getSubnet(user.artefact.subnet_id).artefact.compartment_id;
            }
            self.update(this.okitjson);
        });
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}
OkitJsonView.prototype.pasteUser = function(drop_target) {
    const clone = this.copied_artefact.artefact.clone();
    clone.display_name += 'Copy';
    if (this.paste_count) {clone.display_name += `-${this.paste_count}`;}
    this.paste_count += 1;
    clone.id = clone.okit_id;
    if (drop_target.getArtifactReference() === Subnet.getArtifactReference()) {
        clone.subnet_id = drop_target.id;
        clone.compartment_id = drop_target.compartment_id;
    }
    this.okitjson.getUsers().push(clone);
    this.update(this.okitjson);
}
OkitJsonView.prototype.loadUsersSelect = function(select_id, empty_option=false) {
    $(jqId(select_id)).empty();
    const user_select = $(jqId(select_id));
    if (empty_option) {
        user_select.append($('<option>').attr('value', '').text(''));
    }
    for (let user of this.getUsers()) {
        user_select.append($('<option>').attr('value', user.id).text(user.display_name));
    }
}
OkitJsonView.prototype.loadUsersMultiSelect = function(select_id) {
    $(jqId(select_id)).empty();
    const multi_select = d3.select(d3Id(select_id));
    for (let user of this.okitjson.getUsers()) {
        const div = multi_select.append('div');
        div.append('input')
            .attr('type', 'checkbox')
            .attr('id', safeId(user.id))
            .attr('value', user.id);
        div.append('label')
            .attr('for', safeId(user.id))
            .text(user.display_name);
    }
}
