/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Autoscaling Configuration View Javascript');

/*
** Define Autoscaling Configuration View Class
*/
class AutoscalingConfigurationView extends OkitCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        if (!json_view.autoscaling_configurations) json_view.autoscaling_configurations = [];
        super(artefact, json_view);
    }
    // TODO: Change as appropriate
    get parent_id() {return this.artefact.compartment_id;}
    /*
    ** SVG Processing
    */
    /*
    ** Property Sheet Load function
    */
    newPropertiesSheet() {
        this.properties_sheet = new AutoscalingConfigurationProperties(this.artefact)
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return AutoscalingConfiguration.getArtifactReference();
    }
    static getDropTargets() {
        return [Compartment.getArtifactReference()];
    }
}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropAutoscalingConfigurationView = function(target) {
    let view_artefact = this.newAutoscalingConfiguration();
    if (target.type === Compartment.getArtifactReference()) {
        view_artefact.artefact.compartment_id = target.id;
    } else {
        view_artefact.artefact.compartment_id = target.compartment_id;
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newAutoscalingConfiguration = function(obj) {
    this.getAutoscalingConfigurations().push(obj ? new AutoscalingConfigurationView(obj, this) : new AutoscalingConfigurationView(this.okitjson.newAutoscalingConfiguration(), this));
    return this.getAutoscalingConfigurations()[this.getAutoscalingConfigurations().length - 1];
}
OkitJsonView.prototype.getAutoscalingConfigurations = function() {
    if (!this.autoscaling_configurations) this.autoscaling_configurations = [];
    return this.autoscaling_configurations;
}
OkitJsonView.prototype.getAutoscalingConfiguration = function(id='') {
    return this.getAutoscalingConfigurations().find(r => r.id === id)
}
OkitJsonView.prototype.loadAutoscalingConfigurations = function(autoscaling_configurations) {
    for (const artefact of autoscaling_configurations) {
        this.getAutoscalingConfigurations().push(new AutoscalingConfigurationView(new AutoscalingConfiguration(artefact, this.okitjson), this));
    }
}
OkitJsonView.prototype.moveAutoscalingConfiguration = function(id) {
    // Build Dialog
    const self = this;
    let autoscaling_configuration = this.getAutoscalingConfiguration(id);
    $(jqId('modal_dialog_title')).text('Move ' + autoscaling_configuration.display_name);
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
        .attr('id', 'move_autoscaling_configuration_subnet_id');
    // Load Subnets
    this.loadSubnetsSelect('move_autoscaling_configuration_subnet_id');
    $(jqId("move_autoscaling_configuration_subnet_id")).val(autoscaling_configuration.artefact.subnet_id);
    // Submit Button
    const submit = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'submit_query_btn')
        .attr('type', 'button')
        .text('Move')
        .on('click', function () {
            $(jqId('modal_dialog_wrapper')).addClass('hidden');
            if (autoscaling_configuration.artefact.subnet_id !== $(jqId("move_autoscaling_configuration_subnet_id")).val()) {
                self.getSubnet(autoscaling_configuration.artefact.subnet_id).recalculate_dimensions = true;
                self.getSubnet($(jqId("move_autoscaling_configuration_subnet_id")).val()).recalculate_dimensions = true;
                autoscaling_configuration.artefact.subnet_id = $(jqId("move_autoscaling_configuration_subnet_id")).val();
                autoscaling_configuration.artefact.compartment_id = self.getSubnet(autoscaling_configuration.artefact.subnet_id).artefact.compartment_id;
            }
            self.update(this.okitjson);
        });
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}
OkitJsonView.prototype.pasteAutoscalingConfiguration = function(drop_target) {
    const clone = this.copied_artefact.artefact.clone();
    clone.display_name += 'Copy';
    if (this.paste_count) {clone.display_name += `-${this.paste_count}`;}
    this.paste_count += 1;
    clone.id = clone.okit_id;
    if (drop_target.getArtifactReference() === Subnet.getArtifactReference()) {
        clone.subnet_id = drop_target.id;
        clone.compartment_id = drop_target.compartment_id;
    }
    this.okitjson.getAutoscalingConfigurations().push(clone);
    this.update(this.okitjson);
}
OkitJsonView.prototype.loadAutoscalingConfigurationsSelect = function(select_id, empty_option=false) {
    $(jqId(select_id)).empty();
    const autoscaling_configuration_select = $(jqId(select_id));
    if (empty_option) {
        autoscaling_configuration_select.append($('<option>').attr('value', '').text(''));
    }
    for (let autoscaling_configuration of this.getAutoscalingConfigurations()) {
        autoscaling_configuration_select.append($('<option>').attr('value', autoscaling_configuration.id).text(autoscaling_configuration.display_name));
    }
}
OkitJsonView.prototype.loadAutoscalingConfigurationsMultiSelect = function(select_id) {
    $(jqId(select_id)).empty();
    const multi_select = d3.select(d3Id(select_id));
    for (let autoscaling_configuration of this.getAutoscalingConfigurations()) {
        const div = multi_select.append('div');
        div.append('input')
            .attr('type', 'checkbox')
            .attr('id', safeId(autoscaling_configuration.id))
            .attr('value', autoscaling_configuration.id);
        div.append('label')
            .attr('for', safeId(autoscaling_configuration.id))
            .text(autoscaling_configuration.display_name);
    }
}
