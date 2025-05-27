/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Database View Javascript');

/*
** Define Database View Class
*/
class DatabaseView extends OkitCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        if (!json_view.databases) json_view.databases = [];
        super(artefact, json_view);
    }
    get parent_id() {return this.artefact.db_home_id;}
    get parent() {return this.getJsonView().getDbHome(this.parent_id);}
    /*
    ** SVG Processing
    */
    /*
    ** Property Sheet Load function
    */
    loadProperties() {
        const self = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/database.html", () => {loadPropertiesSheet(self.artefact);});
    }
    /*
    ** Load and display Value Proposition
    */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/database.html");
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return Database.getArtifactReference();
    }
    static getDropTargets() {
        // TODO: Return List of Artefact Drop Targets Parent Object Reference Names e.g. VirtualCloudNetwork for a Internet Gateway
        return [VirtualCloudNetwork.getArtifactReference()];
    }
}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropDatabaseView = function(target) {
    let view_artefact = this.newDatabase();
    if (target.type === Compartment.getArtifactReference()) {
        view_artefact.artefact.compartment_id = target.id;
    } else {
        view_artefact.artefact.compartment_id = target.compartment_id;
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newDatabase = function(obj) {
    this.getDatabases().push(obj ? new DatabaseView(obj, this) : new DatabaseView(this.okitjson.newDatabase(), this));
    return this.getDatabases()[this.getDatabases().length - 1];
}
OkitJsonView.prototype.getDatabases = function() {
    if (!this.databases) {
        this.databases = [];
    }
    return this.databases;
}
OkitJsonView.prototype.getDatabase = function(id='') {
    for (let artefact of this.getDatabases()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadDatabases = function(databases) {
    for (const artefact of databases) {
        this.getDatabases().push(new DatabaseView(new Database(artefact, this.okitjson), this));
    }
}
OkitJsonView.prototype.moveDatabase = function(id) {
    // Build Dialog
    const self = this;
    let database = this.getDatabase(id);
    $(jqId('modal_dialog_title')).text('Move ' + database.display_name);
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
        .attr('id', 'move_database_subnet_id');
    // Load Subnets
    this.loadSubnetsSelect('move_database_subnet_id');
    $(jqId("move_database_subnet_id")).val(database.artefact.subnet_id);
    // Submit Button
    const submit = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'submit_query_btn')
        .attr('type', 'button')
        .text('Move')
        .on('click', function () {
            $(jqId('modal_dialog_wrapper')).addClass('hidden');
            if (database.artefact.subnet_id !== $(jqId("move_database_subnet_id")).val()) {
                self.getSubnet(database.artefact.subnet_id).recalculate_dimensions = true;
                self.getSubnet($(jqId("move_database_subnet_id")).val()).recalculate_dimensions = true;
                database.artefact.subnet_id = $(jqId("move_database_subnet_id")).val();
                database.artefact.compartment_id = self.getSubnet(database.artefact.subnet_id).artefact.compartment_id;
            }
            self.update(this.okitjson);
        });
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}
OkitJsonView.prototype.pasteDatabase = function(drop_target) {
    const clone = this.copied_artefact.artefact.clone();
    clone.display_name += 'Copy';
    if (this.paste_count) {clone.display_name += `-${this.paste_count}`;}
    this.paste_count += 1;
    clone.id = clone.okit_id;
    if (drop_target.getArtifactReference() === Subnet.getArtifactReference()) {
        clone.subnet_id = drop_target.id;
        clone.compartment_id = drop_target.compartment_id;
    }
    this.okitjson.getDatabases().push(clone);
    this.update(this.okitjson);
}
OkitJsonView.prototype.loadDatabasesSelect = function(select_id, empty_option=false) {
    $(jqId(select_id)).empty();
    const database_select = $(jqId(select_id));
    if (empty_option) {
        database_select.append($('<option>').attr('value', '').text(''));
    }
    for (let database of this.getDatabases()) {
        database_select.append($('<option>').attr('value', database.id).text(database.display_name));
    }
}
OkitJsonView.prototype.loadDatabasesMultiSelect = function(select_id) {
    $(jqId(select_id)).empty();
    const multi_select = d3.select(d3Id(select_id));
    for (let database of this.getDatabases()) {
        const div = multi_select.append('div');
        div.append('input')
            .attr('type', 'checkbox')
            .attr('id', safeId(database.id))
            .attr('value', database.id);
        div.append('label')
            .attr('for', safeId(database.id))
            .text(database.display_name);
    }
}
