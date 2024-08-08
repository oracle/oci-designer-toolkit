/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Data Integration Workspace View Javascript');

/*
** Define Data Integration Workspace View Class
*/
class DataIntegrationWorkspaceView extends OkitCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        if (!json_view.data_integration_workspaces) json_view.data_integration_workspaces = [];
        super(artefact, json_view);
    }
    get parent_id() {return this.artefact.subnet_id && this.artefact.subnet_id !== '' ? this.artefact.subnet_id : this.artefact.compartment_id;}
    get parent() {return this.artefact.subnet_id && this.artefact.subnet_id !== '' ? this.getJsonView().getSubnet(this.parent_id) : this.getJsonView().getCompartment(this.parent_id);}
    /*
    ** SVG Processing
    */
    /*
    ** Property Sheet Load function
    */
    newPropertiesSheet() {
        this.properties_sheet = new DataIntegrationWorkspaceProperties(this.artefact)
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return DataIntegrationWorkspace.getArtifactReference();
    }
    static getDropTargets() {
        return [Subnet.getArtifactReference(), Compartment.getArtifactReference()];
    }
}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropDataIntegrationWorkspaceView = function(target) {
    let view_artefact = this.newDataIntegrationWorkspace();
    if (target.type === Subnet.getArtifactReference()) {
        const subnet = this.getSubnet(target.id)
        view_artefact.getArtefact().subnet_id = target.id;
        view_artefact.getArtefact().vcn_id = subnet.vcn_id;
        view_artefact.artefact.is_private_network_enabled = true;
        view_artefact.getArtefact().compartment_id = target.compartment_id;
    } else if (target.type === Compartment.getArtifactReference()) {
        view_artefact.artefact.compartment_id = target.id;
        view_artefact.artefact.is_private_network_enabled = false;
    } else {
        view_artefact.artefact.compartment_id = target.compartment_id;
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newDataIntegrationWorkspace = function(obj) {
    this.getDataIntegrationWorkspaces().push(obj ? new DataIntegrationWorkspaceView(obj, this) : new DataIntegrationWorkspaceView(this.okitjson.newDataIntegrationWorkspace(), this));
    return this.getDataIntegrationWorkspaces()[this.getDataIntegrationWorkspaces().length - 1];
}
OkitJsonView.prototype.getDataIntegrationWorkspaces = function() {
    if (!this.data_integration_workspaces) {
        this.data_integration_workspaces = [];
    }
    return this.data_integration_workspaces;
}
OkitJsonView.prototype.getDataIntegrationWorkspace = function(id='') {
    for (let artefact of this.getDataIntegrationWorkspaces()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadDataIntegrationWorkspaces = function(data_integration_workspaces) {
    for (const artefact of data_integration_workspaces) {
        this.getDataIntegrationWorkspaces().push(new DataIntegrationWorkspaceView(new DataIntegrationWorkspace(artefact, this.okitjson), this));
    }
}
OkitJsonView.prototype.moveDataIntegrationWorkspace = function(id) {
    // Build Dialog
    const self = this;
    let data_integration_workspace = this.getDataIntegrationWorkspace(id);
    $(jqId('modal_dialog_title')).text('Move ' + data_integration_workspace.display_name);
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
        .attr('id', 'move_data_integration_workspace_subnet_id');
    // Load Subnets
    this.loadSubnetsSelect('move_data_integration_workspace_subnet_id');
    $(jqId("move_data_integration_workspace_subnet_id")).val(data_integration_workspace.artefact.subnet_id);
    // Submit Button
    const submit = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'submit_query_btn')
        .attr('type', 'button')
        .text('Move')
        .on('click', function () {
            $(jqId('modal_dialog_wrapper')).addClass('hidden');
            if (data_integration_workspace.artefact.subnet_id !== $(jqId("move_data_integration_workspace_subnet_id")).val()) {
                self.getSubnet(data_integration_workspace.artefact.subnet_id).recalculate_dimensions = true;
                self.getSubnet($(jqId("move_data_integration_workspace_subnet_id")).val()).recalculate_dimensions = true;
                data_integration_workspace.artefact.subnet_id = $(jqId("move_data_integration_workspace_subnet_id")).val();
                data_integration_workspace.artefact.compartment_id = self.getSubnet(data_integration_workspace.artefact.subnet_id).artefact.compartment_id;
            }
            self.update(this.okitjson);
        });
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}
OkitJsonView.prototype.pasteDataIntegrationWorkspace = function(drop_target) {
    const clone = this.copied_artefact.artefact.clone();
    clone.display_name += 'Copy';
    if (this.paste_count) {clone.display_name += `-${this.paste_count}`;}
    this.paste_count += 1;
    clone.id = clone.okit_id;
    if (drop_target.getArtifactReference() === Subnet.getArtifactReference()) {
        clone.subnet_id = drop_target.id;
        clone.compartment_id = drop_target.compartment_id;
    }
    this.okitjson.getDataIntegrationWorkspaces().push(clone);
    this.update(this.okitjson);
}
OkitJsonView.prototype.loadDataIntegrationWorkspacesSelect = function(select_id, empty_option=false) {
    $(jqId(select_id)).empty();
    const data_integration_workspace_select = $(jqId(select_id));
    if (empty_option) {
        data_integration_workspace_select.append($('<option>').attr('value', '').text(''));
    }
    for (let data_integration_workspace of this.getDataIntegrationWorkspaces()) {
        data_integration_workspace_select.append($('<option>').attr('value', data_integration_workspace.id).text(data_integration_workspace.display_name));
    }
}
OkitJsonView.prototype.loadDataIntegrationWorkspacesMultiSelect = function(select_id) {
    $(jqId(select_id)).empty();
    const multi_select = d3.select(d3Id(select_id));
    for (let data_integration_workspace of this.getDataIntegrationWorkspaces()) {
        const div = multi_select.append('div');
        div.append('input')
            .attr('type', 'checkbox')
            .attr('id', safeId(data_integration_workspace.id))
            .attr('value', data_integration_workspace.id);
        div.append('label')
            .attr('for', safeId(data_integration_workspace.id))
            .text(data_integration_workspace.display_name);
    }
}
