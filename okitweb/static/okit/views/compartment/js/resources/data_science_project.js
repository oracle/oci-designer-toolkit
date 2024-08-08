/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Data Science Project View Javascript');

/*
** Define Data Science Project View Class
*/
class DataScienceProjectView extends OkitCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        if (!json_view.data_science_projects) json_view.data_science_projects = [];
        super(artefact, json_view);
    }
    get parent_id() {return this.artefact.compartment_id;}
    /*
    ** SVG Processing
    */
    /*
    ** Property Sheet Load function
    */
    newPropertiesSheet() {
        this.properties_sheet = new DataScienceProjectProperties(this.artefact)
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return DataScienceProject.getArtifactReference();
    }
    static getDropTargets() {
        return [Compartment.getArtifactReference()];
    }
}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropDataScienceProjectView = function(target) {
    let view_artefact = this.newDataScienceProject();
    if (target.type === Compartment.getArtifactReference()) {
        view_artefact.artefact.compartment_id = target.id;
    } else {
        view_artefact.artefact.compartment_id = target.compartment_id;
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newDataScienceProject = function(obj) {
    this.getDataScienceProjects().push(obj ? new DataScienceProjectView(obj, this) : new DataScienceProjectView(this.okitjson.newDataScienceProject(), this));
    return this.getDataScienceProjects()[this.getDataScienceProjects().length - 1];
}
OkitJsonView.prototype.getDataScienceProjects = function() {
    if (!this.data_science_projects) this.data_science_projects = [];
    return this.data_science_projects;
}
OkitJsonView.prototype.getDataScienceProject = function(id='') {
    return this.getDataScienceProjects().find(r => r.id === id)
}
OkitJsonView.prototype.loadDataScienceProjects = function(data_science_projects) {
    for (const artefact of data_science_projects) {
        this.getDataScienceProjects().push(new DataScienceProjectView(new DataScienceProject(artefact, this.okitjson), this));
    }
}
OkitJsonView.prototype.moveDataScienceProject = function(id) {
    // Build Dialog
    const self = this;
    let data_science_project = this.getDataScienceProject(id);
    $(jqId('modal_dialog_title')).text('Move ' + data_science_project.display_name);
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
        .attr('id', 'move_data_science_project_subnet_id');
    // Load Subnets
    this.loadSubnetsSelect('move_data_science_project_subnet_id');
    $(jqId("move_data_science_project_subnet_id")).val(data_science_project.artefact.subnet_id);
    // Submit Button
    const submit = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'submit_query_btn')
        .attr('type', 'button')
        .text('Move')
        .on('click', function () {
            $(jqId('modal_dialog_wrapper')).addClass('hidden');
            if (data_science_project.artefact.subnet_id !== $(jqId("move_data_science_project_subnet_id")).val()) {
                self.getSubnet(data_science_project.artefact.subnet_id).recalculate_dimensions = true;
                self.getSubnet($(jqId("move_data_science_project_subnet_id")).val()).recalculate_dimensions = true;
                data_science_project.artefact.subnet_id = $(jqId("move_data_science_project_subnet_id")).val();
                data_science_project.artefact.compartment_id = self.getSubnet(data_science_project.artefact.subnet_id).artefact.compartment_id;
            }
            self.update(this.okitjson);
        });
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}
OkitJsonView.prototype.pasteDataScienceProject = function(drop_target) {
    const clone = this.copied_artefact.artefact.clone();
    clone.display_name += 'Copy';
    if (this.paste_count) {clone.display_name += `-${this.paste_count}`;}
    this.paste_count += 1;
    clone.id = clone.okit_id;
    if (drop_target.getArtifactReference() === Subnet.getArtifactReference()) {
        clone.subnet_id = drop_target.id;
        clone.compartment_id = drop_target.compartment_id;
    }
    this.okitjson.getDataScienceProjects().push(clone);
    this.update(this.okitjson);
}
OkitJsonView.prototype.loadDataScienceProjectsSelect = function(select_id, empty_option=false) {
    $(jqId(select_id)).empty();
    const data_science_project_select = $(jqId(select_id));
    if (empty_option) {
        data_science_project_select.append($('<option>').attr('value', '').text(''));
    }
    for (let data_science_project of this.getDataScienceProjects()) {
        data_science_project_select.append($('<option>').attr('value', data_science_project.id).text(data_science_project.display_name));
    }
}
OkitJsonView.prototype.loadDataScienceProjectsMultiSelect = function(select_id) {
    $(jqId(select_id)).empty();
    const multi_select = d3.select(d3Id(select_id));
    for (let data_science_project of this.getDataScienceProjects()) {
        const div = multi_select.append('div');
        div.append('input')
            .attr('type', 'checkbox')
            .attr('id', safeId(data_science_project.id))
            .attr('value', data_science_project.id);
        div.append('label')
            .attr('for', safeId(data_science_project.id))
            .text(data_science_project.display_name);
    }
}
