/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Db Home View Javascript');

/*
** Define Db Home View Class
*/
class DbHomeView extends OkitContainerCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        if (!json_view.db_homes) json_view.db_homes = [];
        super(artefact, json_view);
    }
    get parent_id() {return this.artefact.vm_cluster_id;}
    get parent() {return this.getJsonView().getVmCluster(this.parent_id);}
    get info_text() {return this.artefact.db_version;}
    /*
    ** SVG Processing
    */
    /*
    ** Property Sheet Load function
    */
    loadProperties() {
        const self = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/db_home.html", () => {loadPropertiesSheet(self.artefact);});
    }
    /*
    ** Load and display Value Proposition
    */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/db_home.html");
    }
    /*
    ** Child Artifact Functions
     */
    getTopArtifacts() {
        return [Database.getArtifactReference()];
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return DbHome.getArtifactReference();
    }
    static getDropTargets() {
        // TODO: Return List of Artefact Drop Targets Parent Object Reference Names e.g. VirtualCloudNetwork for a Internet Gateway
        return [VmCluster.getArtifactReference()];
    }
}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropDbHomeView = function(target) {
    let view_artefact = this.newDbHome();
    if (target.type === Compartment.getArtifactReference()) {
        view_artefact.artefact.compartment_id = target.id;
    } else {
        view_artefact.artefact.compartment_id = target.compartment_id;
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newDbHome = function(obj) {
    this.getDbHomes().push(obj ? new DbHomeView(obj, this) : new DbHomeView(this.okitjson.newDbHome(), this));
    return this.getDbHomes()[this.getDbHomes().length - 1];
}
OkitJsonView.prototype.getDbHomes = function() {
    if (!this.db_homes) {
        this.db_homes = [];
    }
    return this.db_homes;
}
OkitJsonView.prototype.getDbHome = function(id='') {
    for (let artefact of this.getDbHomes()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadDbHomes = function(db_homes) {
    for (const artefact of db_homes) {
        this.getDbHomes().push(new DbHomeView(new DbHome(artefact, this.okitjson), this));
    }
}
OkitJsonView.prototype.moveDbHome = function(id) {
    // Build Dialog
    const self = this;
    let db_home = this.getDbHome(id);
    $(jqId('modal_dialog_title')).text('Move ' + db_home.display_name);
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
        .attr('id', 'move_db_home_subnet_id');
    // Load Subnets
    this.loadSubnetsSelect('move_db_home_subnet_id');
    $(jqId("move_db_home_subnet_id")).val(db_home.artefact.subnet_id);
    // Submit Button
    const submit = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'submit_query_btn')
        .attr('type', 'button')
        .text('Move')
        .on('click', function () {
            $(jqId('modal_dialog_wrapper')).addClass('hidden');
            if (db_home.artefact.subnet_id !== $(jqId("move_db_home_subnet_id")).val()) {
                self.getSubnet(db_home.artefact.subnet_id).recalculate_dimensions = true;
                self.getSubnet($(jqId("move_db_home_subnet_id")).val()).recalculate_dimensions = true;
                db_home.artefact.subnet_id = $(jqId("move_db_home_subnet_id")).val();
                db_home.artefact.compartment_id = self.getSubnet(db_home.artefact.subnet_id).artefact.compartment_id;
            }
            self.update(this.okitjson);
        });
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}
OkitJsonView.prototype.pasteDbHome = function(drop_target) {
    const clone = this.copied_artefact.artefact.clone();
    clone.display_name += 'Copy';
    if (this.paste_count) {clone.display_name += `-${this.paste_count}`;}
    this.paste_count += 1;
    clone.id = clone.okit_id;
    if (drop_target.getArtifactReference() === Subnet.getArtifactReference()) {
        clone.subnet_id = drop_target.id;
        clone.compartment_id = drop_target.compartment_id;
    }
    this.okitjson.getDbHomes().push(clone);
    this.update(this.okitjson);
}
OkitJsonView.prototype.loadDbHomesSelect = function(select_id, empty_option=false) {
    $(jqId(select_id)).empty();
    const db_home_select = $(jqId(select_id));
    if (empty_option) {
        db_home_select.append($('<option>').attr('value', '').text(''));
    }
    for (let db_home of this.getDbHomes()) {
        db_home_select.append($('<option>').attr('value', db_home.id).text(db_home.display_name));
    }
}
OkitJsonView.prototype.loadDbHomesMultiSelect = function(select_id) {
    $(jqId(select_id)).empty();
    const multi_select = d3.select(d3Id(select_id));
    for (let db_home of this.getDbHomes()) {
        const div = multi_select.append('div');
        div.append('input')
            .attr('type', 'checkbox')
            .attr('id', safeId(db_home.id))
            .attr('value', db_home.id);
        div.append('label')
            .attr('for', safeId(db_home.id))
            .text(db_home.display_name);
    }
}
