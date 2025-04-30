/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Exadata Infrastructure View Javascript');

/*
** Define Exadata Infrastructure View Class
*/
class ExadataInfrastructureView extends OkitContainerCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        if (!json_view.exadata_infrastructures) json_view.exadata_infrastructures = [];
        super(artefact, json_view);
    }
    get parent_id() {return this.artefact.compartment_id;}
    get parent() {return this.getJsonView().getCompartment(this.parent_id);}
    get children() {return [...this.json_view.getVmClusters(), ...this.json_view.getVmClusterNetwroks()].filter(child => child.parent_id === this.artefact.id);}
    get info_text() {return this.artefact.shape;}
    /*
    ** SVG Processing
    */
    /*
    ** Property Sheet Load function
    */
    loadProperties() {
        const self = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/exadata_infrastructure.html", () => {loadPropertiesSheet(self.artefact);});
    }
    /*
    ** Load and display Value Proposition
    */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/exadata_infrastructure.html");
    }
    /*
    ** Child Artifact Functions
     */
    getTopArtifacts() {
        return [VmClusterNetwork.getArtifactReference()];
    }
    getContainerArtifacts() {
        return [VmCluster.getArtifactReference()];
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return ExadataInfrastructure.getArtifactReference();
    }
    static getDropTargets() {
        return [Compartment.getArtifactReference()];
    }
}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropExadataInfrastructureView = function(target) {
    let view_artefact = this.newExadataInfrastructure();
    if (target.type === Compartment.getArtifactReference()) {
        view_artefact.artefact.compartment_id = target.id;
    } else {
        view_artefact.artefact.compartment_id = target.compartment_id;
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newExadataInfrastructure = function(obj) {
    this.getExadataInfrastructures().push(obj ? new ExadataInfrastructureView(obj, this) : new ExadataInfrastructureView(this.okitjson.newExadataInfrastructure(), this));
    return this.getExadataInfrastructures()[this.getExadataInfrastructures().length - 1];
}
OkitJsonView.prototype.getExadataInfrastructures = function() {
    if (!this.exadata_infrastructures) {
        this.exadata_infrastructures = [];
    }
    return this.exadata_infrastructures;
}
OkitJsonView.prototype.getExadataInfrastructure = function(id='') {
    for (let artefact of this.getExadataInfrastructures()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadExadataInfrastructures = function(exadata_infrastructures) {
    for (const artefact of exadata_infrastructures) {
        this.getExadataInfrastructures().push(new ExadataInfrastructureView(new ExadataInfrastructure(artefact, this.okitjson), this));
    }
}
OkitJsonView.prototype.moveExadataInfrastructure = function(id) {
    // Build Dialog
    const self = this;
    let exadata_infrastructure = this.getExadataInfrastructure(id);
    $(jqId('modal_dialog_title')).text('Move ' + exadata_infrastructure.display_name);
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
        .attr('id', 'move_exadata_infrastructure_subnet_id');
    // Load Subnets
    this.loadSubnetsSelect('move_exadata_infrastructure_subnet_id');
    $(jqId("move_exadata_infrastructure_subnet_id")).val(exadata_infrastructure.artefact.subnet_id);
    // Submit Button
    const submit = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'submit_query_btn')
        .attr('type', 'button')
        .text('Move')
        .on('click', function () {
            $(jqId('modal_dialog_wrapper')).addClass('hidden');
            if (exadata_infrastructure.artefact.subnet_id !== $(jqId("move_exadata_infrastructure_subnet_id")).val()) {
                self.getSubnet(exadata_infrastructure.artefact.subnet_id).recalculate_dimensions = true;
                self.getSubnet($(jqId("move_exadata_infrastructure_subnet_id")).val()).recalculate_dimensions = true;
                exadata_infrastructure.artefact.subnet_id = $(jqId("move_exadata_infrastructure_subnet_id")).val();
                exadata_infrastructure.artefact.compartment_id = self.getSubnet(exadata_infrastructure.artefact.subnet_id).artefact.compartment_id;
            }
            self.update(this.okitjson);
        });
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}
OkitJsonView.prototype.pasteExadataInfrastructure = function(drop_target) {
    const clone = this.copied_artefact.artefact.clone();
    clone.display_name += 'Copy';
    if (this.paste_count) {clone.display_name += `-${this.paste_count}`;}
    this.paste_count += 1;
    clone.id = clone.okit_id;
    if (drop_target.getArtifactReference() === Subnet.getArtifactReference()) {
        clone.subnet_id = drop_target.id;
        clone.compartment_id = drop_target.compartment_id;
    }
    this.okitjson.getExadataInfrastructures().push(clone);
    this.update(this.okitjson);
}
OkitJsonView.prototype.loadExadataInfrastructuresSelect = function(select_id, empty_option=false) {
    $(jqId(select_id)).empty();
    const exadata_infrastructure_select = $(jqId(select_id));
    if (empty_option) {
        exadata_infrastructure_select.append($('<option>').attr('value', '').text(''));
    }
    for (let exadata_infrastructure of this.getExadataInfrastructures()) {
        exadata_infrastructure_select.append($('<option>').attr('value', exadata_infrastructure.id).text(exadata_infrastructure.display_name));
    }
}
OkitJsonView.prototype.loadExadataInfrastructuresMultiSelect = function(select_id) {
    $(jqId(select_id)).empty();
    const multi_select = d3.select(d3Id(select_id));
    for (let exadata_infrastructure of this.getExadataInfrastructures()) {
        const div = multi_select.append('div');
        div.append('input')
            .attr('type', 'checkbox')
            .attr('id', safeId(exadata_infrastructure.id))
            .attr('value', exadata_infrastructure.id);
        div.append('label')
            .attr('for', safeId(exadata_infrastructure.id))
            .text(exadata_infrastructure.display_name);
    }
}
