/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Instance Configuration View Javascript');

/*
** Define Instance Configuration View Class
*/
class InstanceConfigurationView extends OkitCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        if (!json_view.instance_configurations) json_view.instance_configurations = [];
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
        this.properties_sheet = new InstanceConfigurationProperties(this.artefact)
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return InstanceConfiguration.getArtifactReference();
    }
    static getDropTargets() {
        return [Subnet.getArtifactReference(), Compartment.getArtifactReference()];
    }
}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropInstanceConfigurationView = function(target) {
    let view_artefact = this.newInstanceConfiguration();
    if (target.type === Subnet.getArtifactReference()) {
        view_artefact.getArtefact().primary_vnic.subnet_id = target.id;
        view_artefact.artefact.primary_vnic.assign_public_ip = !this.getSubnet(target.id).prohibit_public_ip_on_vnic;
        view_artefact.getArtefact().compartment_id = target.compartment_id;
    } else if (target.type === Compartment.getArtifactReference()) {
        view_artefact.getArtefact().compartment_id = target.id;
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newInstanceConfiguration = function(obj) {
    this.getInstanceConfigurations().push(obj ? new InstanceConfigurationView(obj, this) : new InstanceConfigurationView(this.okitjson.newInstanceConfiguration(), this));
    return this.getInstanceConfigurations()[this.getInstanceConfigurations().length - 1];
}
OkitJsonView.prototype.getInstanceConfigurations = function() {
    if (!this.instance_configurations) this.instance_configurations = [];
    return this.instance_configurations;
}
OkitJsonView.prototype.getInstanceConfiguration = function(id='') {
    return this.getInstanceConfigurations().find(r => r.id === id)
}
OkitJsonView.prototype.loadInstanceConfigurations = function(instance_configurations) {
    for (const artefact of instance_configurations) {
        this.getInstanceConfigurations().push(new InstanceConfigurationView(new InstanceConfiguration(artefact, this.okitjson), this));
    }
}
OkitJsonView.prototype.moveInstanceConfiguration = function(id) {
    // Build Dialog
    const self = this;
    let instance_configuration = this.getInstanceConfiguration(id);
    $(jqId('modal_dialog_title')).text('Move ' + instance_configuration.display_name);
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
        .attr('id', 'move_instance_configuration_subnet_id');
    // Load Subnets
    this.loadSubnetsSelect('move_instance_configuration_subnet_id');
    $(jqId("move_instance_configuration_subnet_id")).val(instance_configuration.artefact.subnet_id);
    // Submit Button
    const submit = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'submit_query_btn')
        .attr('type', 'button')
        .text('Move')
        .on('click', function () {
            $(jqId('modal_dialog_wrapper')).addClass('hidden');
            if (instance_configuration.artefact.subnet_id !== $(jqId("move_instance_configuration_subnet_id")).val()) {
                self.getSubnet(instance_configuration.artefact.subnet_id).recalculate_dimensions = true;
                self.getSubnet($(jqId("move_instance_configuration_subnet_id")).val()).recalculate_dimensions = true;
                instance_configuration.artefact.subnet_id = $(jqId("move_instance_configuration_subnet_id")).val();
                instance_configuration.artefact.compartment_id = self.getSubnet(instance_configuration.artefact.subnet_id).artefact.compartment_id;
            }
            self.update(this.okitjson);
        });
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}
OkitJsonView.prototype.pasteInstanceConfiguration = function(drop_target) {
    const clone = this.copied_artefact.artefact.clone();
    clone.display_name += 'Copy';
    if (this.paste_count) {clone.display_name += `-${this.paste_count}`;}
    this.paste_count += 1;
    clone.id = clone.okit_id;
    if (drop_target.getArtifactReference() === Subnet.getArtifactReference()) {
        clone.subnet_id = drop_target.id;
        clone.compartment_id = drop_target.compartment_id;
    }
    this.okitjson.getInstanceConfigurations().push(clone);
    this.update(this.okitjson);
}
OkitJsonView.prototype.loadInstanceConfigurationsSelect = function(select_id, empty_option=false) {
    $(jqId(select_id)).empty();
    const instance_configuration_select = $(jqId(select_id));
    if (empty_option) {
        instance_configuration_select.append($('<option>').attr('value', '').text(''));
    }
    for (let instance_configuration of this.getInstanceConfigurations()) {
        instance_configuration_select.append($('<option>').attr('value', instance_configuration.id).text(instance_configuration.display_name));
    }
}
OkitJsonView.prototype.loadInstanceConfigurationsMultiSelect = function(select_id) {
    $(jqId(select_id)).empty();
    const multi_select = d3.select(d3Id(select_id));
    for (let instance_configuration of this.getInstanceConfigurations()) {
        const div = multi_select.append('div');
        div.append('input')
            .attr('type', 'checkbox')
            .attr('id', safeId(instance_configuration.id))
            .attr('value', instance_configuration.id);
        div.append('label')
            .attr('for', safeId(instance_configuration.id))
            .text(instance_configuration.display_name);
    }
}
