/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded NoSQL Database View Javascript');

/*
** Define NoSQL Database View Class
*/
class NosqlDatabaseView extends OkitCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        if (!json_view.nosql_databases) json_view.nosql_databases = [];
        super(artefact, json_view);
    }
    // TODO: Change as appropriate
    get parent_id() {return this.artefact.compartment_id;}
    get parent() {return this.getJsonView().getCompartment(this.parent_id);}
    /*
    ** SVG Processing
    */
    /*
    ** Property Sheet Load function
    */
    newPropertiesSheet() {
        this.properties_sheet = new NosqlDatabaseProperties(this.artefact)
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return NosqlDatabase.getArtifactReference();
    }
    static getDropTargets() {
        // TODO: Return List of Artefact Drop Targets Parent Object Reference Names e.g. VirtualCloudNetwork for a Internet Gateway
        return [Compartment.getArtifactReference()];
    }
}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropNosqlDatabaseView = function(target) {
    let view_artefact = this.newNosqlDatabase();
    if (target.type === Compartment.getArtifactReference()) {
        view_artefact.artefact.compartment_id = target.id;
    } else {
        view_artefact.artefact.compartment_id = target.compartment_id;
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newNosqlDatabase = function(obj) {
    this.getNosqlDatabases().push(obj ? new NosqlDatabaseView(obj, this) : new NosqlDatabaseView(this.okitjson.newNosqlDatabase(), this));
    return this.getNosqlDatabases()[this.getNosqlDatabases().length - 1];
}
OkitJsonView.prototype.getNosqlDatabases = function() {
    if (!this.nosql_databases) {
        this.nosql_databases = [];
    }
    return this.nosql_databases;
}
OkitJsonView.prototype.getNosqlDatabase = function(id='') {
    // for (let artefact of this.getNosqlDatabases()) {
    //     if (artefact.id === id) {
    //         return artefact;
    //     }
    // }
    return this.getNosqlDatabases().find(r => r.id === id);
}
OkitJsonView.prototype.loadNosqlDatabases = function(nosql_databases) {
    for (const artefact of nosql_databases) {
        this.getNosqlDatabases().push(new NosqlDatabaseView(new NosqlDatabase(artefact, this.okitjson), this));
    }
}
OkitJsonView.prototype.moveNosqlDatabase = function(id) {
    // Build Dialog
    const self = this;
    let nosql_database = this.getNosqlDatabase(id);
    $(jqId('modal_dialog_title')).text('Move ' + nosql_database.display_name);
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
        .attr('id', 'move_nosql_database_subnet_id');
    // Load Subnets
    this.loadSubnetsSelect('move_nosql_database_subnet_id');
    $(jqId("move_nosql_database_subnet_id")).val(nosql_database.artefact.subnet_id);
    // Submit Button
    const submit = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'submit_query_btn')
        .attr('type', 'button')
        .text('Move')
        .on('click', function () {
            $(jqId('modal_dialog_wrapper')).addClass('hidden');
            if (nosql_database.artefact.subnet_id !== $(jqId("move_nosql_database_subnet_id")).val()) {
                self.getSubnet(nosql_database.artefact.subnet_id).recalculate_dimensions = true;
                self.getSubnet($(jqId("move_nosql_database_subnet_id")).val()).recalculate_dimensions = true;
                nosql_database.artefact.subnet_id = $(jqId("move_nosql_database_subnet_id")).val();
                nosql_database.artefact.compartment_id = self.getSubnet(nosql_database.artefact.subnet_id).artefact.compartment_id;
            }
            self.update(this.okitjson);
        });
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}
OkitJsonView.prototype.pasteNosqlDatabase = function(drop_target) {
    const clone = this.copied_artefact.artefact.clone();
    clone.display_name += 'Copy';
    if (this.paste_count) {clone.display_name += `-${this.paste_count}`;}
    this.paste_count += 1;
    clone.id = clone.okit_id;
    if (drop_target.getArtifactReference() === Subnet.getArtifactReference()) {
        clone.subnet_id = drop_target.id;
        clone.compartment_id = drop_target.compartment_id;
    }
    this.okitjson.getNosqlDatabases().push(clone);
    this.update(this.okitjson);
}
OkitJsonView.prototype.loadNosqlDatabasesSelect = function(select_id, empty_option=false) {
    $(jqId(select_id)).empty();
    const nosql_database_select = $(jqId(select_id));
    if (empty_option) {
        nosql_database_select.append($('<option>').attr('value', '').text(''));
    }
    for (let nosql_database of this.getNosqlDatabases()) {
        nosql_database_select.append($('<option>').attr('value', nosql_database.id).text(nosql_database.display_name));
    }
}
OkitJsonView.prototype.loadNosqlDatabasesMultiSelect = function(select_id) {
    $(jqId(select_id)).empty();
    const multi_select = d3.select(d3Id(select_id));
    for (let nosql_database of this.getNosqlDatabases()) {
        const div = multi_select.append('div');
        div.append('input')
            .attr('type', 'checkbox')
            .attr('id', safeId(nosql_database.id))
            .attr('value', nosql_database.id);
        div.append('label')
            .attr('for', safeId(nosql_database.id))
            .text(nosql_database.display_name);
    }
}
