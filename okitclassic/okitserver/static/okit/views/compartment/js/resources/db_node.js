/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Db Node View Javascript');

/*
** Define Db Node View Class
*/
class DbNodeView extends OkitCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        if (!json_view.db_nodes) json_view.db_nodes = [];
        super(artefact, json_view);
    }
    get parent_id() {return this.artefact.vm_cluster_id;}
    get parent() {return this.getJsonView().getVmCluster(this.parent_id);}
    /*
    ** SVG Processing
    */
    /*
    ** Property Sheet Load function
    */
    loadProperties() {
        const self = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/db_node.html", () => {loadPropertiesSheet(self.artefact);});
    }
    /*
    ** Load and display Value Proposition
    */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/db_node.html");
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return DbNode.getArtifactReference();
    }
    static getDropTargets() {
        // TODO: Return List of Artefact Drop Targets Parent Object Reference Names e.g. VirtualCloudNetwork for a Internet Gateway
        return [VirtualCloudNetwork.getArtifactReference()];
    }
}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropDbNodeView = function(target) {
    let view_artefact = this.newDbNode();
    if (target.type === Compartment.getArtifactReference()) {
        view_artefact.artefact.compartment_id = target.id;
    } else {
        view_artefact.artefact.compartment_id = target.compartment_id;
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newDbNode = function(obj) {
    this.getDbNodes().push(obj ? new DbNodeView(obj, this) : new DbNodeView(this.okitjson.newDbNode(), this));
    return this.getDbNodes()[this.getDbNodes().length - 1];
}
OkitJsonView.prototype.getDbNodes = function() {
    if (!this.db_nodes) {
        this.db_nodes = [];
    }
    return this.db_nodes;
}
OkitJsonView.prototype.getDbNode = function(id='') {
    for (let artefact of this.getDbNodes()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadDbNodes = function(db_nodes) {
    for (const artefact of db_nodes) {
        this.getDbNodes().push(new DbNodeView(new DbNode(artefact, this.okitjson), this));
    }
}
OkitJsonView.prototype.moveDbNode = function(id) {
    // Build Dialog
    const self = this;
    let db_node = this.getDbNode(id);
    $(jqId('modal_dialog_title')).text('Move ' + db_node.display_name);
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
        .attr('id', 'move_db_node_subnet_id');
    // Load Subnets
    this.loadSubnetsSelect('move_db_node_subnet_id');
    $(jqId("move_db_node_subnet_id")).val(db_node.artefact.subnet_id);
    // Submit Button
    const submit = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'submit_query_btn')
        .attr('type', 'button')
        .text('Move')
        .on('click', function () {
            $(jqId('modal_dialog_wrapper')).addClass('hidden');
            if (db_node.artefact.subnet_id !== $(jqId("move_db_node_subnet_id")).val()) {
                self.getSubnet(db_node.artefact.subnet_id).recalculate_dimensions = true;
                self.getSubnet($(jqId("move_db_node_subnet_id")).val()).recalculate_dimensions = true;
                db_node.artefact.subnet_id = $(jqId("move_db_node_subnet_id")).val();
                db_node.artefact.compartment_id = self.getSubnet(db_node.artefact.subnet_id).artefact.compartment_id;
            }
            self.update(this.okitjson);
        });
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}
OkitJsonView.prototype.pasteDbNode = function(drop_target) {
    const clone = this.copied_artefact.artefact.clone();
    clone.display_name += 'Copy';
    if (this.paste_count) {clone.display_name += `-${this.paste_count}`;}
    this.paste_count += 1;
    clone.id = clone.okit_id;
    if (drop_target.getArtifactReference() === Subnet.getArtifactReference()) {
        clone.subnet_id = drop_target.id;
        clone.compartment_id = drop_target.compartment_id;
    }
    this.okitjson.getDbNodes().push(clone);
    this.update(this.okitjson);
}
OkitJsonView.prototype.loadDbNodesSelect = function(select_id, empty_option=false) {
    $(jqId(select_id)).empty();
    const db_node_select = $(jqId(select_id));
    if (empty_option) {
        db_node_select.append($('<option>').attr('value', '').text(''));
    }
    for (let db_node of this.getDbNodes()) {
        db_node_select.append($('<option>').attr('value', db_node.id).text(db_node.display_name));
    }
}
OkitJsonView.prototype.loadDbNodesMultiSelect = function(select_id) {
    $(jqId(select_id)).empty();
    const multi_select = d3.select(d3Id(select_id));
    for (let db_node of this.getDbNodes()) {
        const div = multi_select.append('div');
        div.append('input')
            .attr('type', 'checkbox')
            .attr('id', safeId(db_node.id))
            .attr('value', db_node.id);
        div.append('label')
            .attr('for', safeId(db_node.id))
            .text(db_node.display_name);
    }
}
