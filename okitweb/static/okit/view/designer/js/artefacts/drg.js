/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Drg View Javascript');

/*
** Define Drg View Class
*/
class DrgView extends OkitArtefactView {
    constructor(artefact=null, json_view) {
        if (!json_view.drgs) json_view.drgs = [];
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
    loadProperties() {
        const self = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/drg.html", () => {loadPropertiesSheet(self.artefact);});
    }
    /*
    ** Load and display Value Proposition
    */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/drg.html");
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return Drg.getArtifactReference();
    }
    static getDropTargets() {
        // TODO: Return List of Artefact Drop Targets Parent Object Reference Names e.g. VirtualCloudNetwork for a Internet Gateway
        return [Compartment.getArtifactReference()];
    }
}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropDrgView = function(target) {
    let view_artefact = this.newDrg();
    if (target.type === Compartment.getArtifactReference()) {
        view_artefact.artefact.compartment_id = target.id;
    } else {
        view_artefact.artefact.compartment_id = target.compartment_id;
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newDrg = function(obj) {
    this.getDrgs().push(obj ? new DrgView(obj, this) : new DrgView(this.okitjson.newDrg(), this));
    return this.getDrgs()[this.getDrgs().length - 1];
}
OkitJsonView.prototype.getDrgs = function() {
    if (!this.drgs) {
        this.drgs = [];
    }
    return this.drgs;
}
OkitJsonView.prototype.getDrg = function(id='') {
    for (let artefact of this.getDrgs()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadDrgs = function(drgs) {
    for (const artefact of drgs) {
        this.getDrgs().push(new DrgView(new Drg(artefact, this.okitjson), this));
    }
}
OkitJsonView.prototype.moveDrg = function(id) {
    // Build Dialog
    const self = this;
    let drg = this.getDrg(id);
    $(jqId('modal_dialog_title')).text('Move ' + drg.display_name);
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
        .attr('id', 'move_drg_subnet_id');
    // Load Subnets
    this.loadSubnetsSelect('move_drg_subnet_id');
    $(jqId("move_drg_subnet_id")).val(drg.artefact.subnet_id);
    // Submit Button
    const submit = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'submit_query_btn')
        .attr('type', 'button')
        .text('Move')
        .on('click', function () {
            $(jqId('modal_dialog_wrapper')).addClass('hidden');
            if (drg.artefact.subnet_id !== $(jqId("move_drg_subnet_id")).val()) {
                self.getSubnet(drg.artefact.subnet_id).recalculate_dimensions = true;
                self.getSubnet($(jqId("move_drg_subnet_id")).val()).recalculate_dimensions = true;
                drg.artefact.subnet_id = $(jqId("move_drg_subnet_id")).val();
                drg.artefact.compartment_id = self.getSubnet(drg.artefact.subnet_id).artefact.compartment_id;
            }
            self.update(this.okitjson);
        });
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}
OkitJsonView.prototype.pasteDrg = function(drop_target) {
    const clone = this.copied_artefact.artefact.clone();
    clone.display_name += 'Copy';
    if (this.paste_count) {clone.display_name += `-${this.paste_count}`;}
    this.paste_count += 1;
    clone.id = clone.okit_id;
    if (drop_target.getArtifactReference() === Subnet.getArtifactReference()) {
        clone.subnet_id = drop_target.id;
        clone.compartment_id = drop_target.compartment_id;
    }
    this.okitjson.drgs.push(clone);
    this.update(this.okitjson);
}
OkitJsonView.prototype.loadDrgsSelect = function(select_id, empty_option=false) {
    $(jqId(select_id)).empty();
    const drg_select = $(jqId(select_id));
    if (empty_option) {
        drg_select.append($('<option>').attr('value', '').text(''));
    }
    for (let drg of this.getDrgs()) {
        drg_select.append($('<option>').attr('value', drg.id).text(drg.display_name));
    }
}
OkitJsonView.prototype.loadDrgsMultiSelect = function(select_id) {
    $(jqId(select_id)).empty();
    const multi_select = d3.select(d3Id(select_id));
    for (let drg of this.getDrgs()) {
        const div = multi_select.append('div');
        div.append('input')
            .attr('type', 'checkbox')
            .attr('id', safeId(drg.id))
            .attr('value', drg.id);
        div.append('label')
            .attr('for', safeId(drg.id))
            .text(drg.display_name);
    }
}
