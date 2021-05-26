/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Integration Instance View Javascript');

/*
** Define Integration Instance View Class
*/
class IntegrationInstanceView extends OkitArtefactView {
    constructor(artefact=null, json_view) {
        if (!json_view.integration_instances) json_view.integration_instances = [];
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
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/integration_instance.html", () => {loadPropertiesSheet(self.artefact);});
    }
    /*
    ** Load and display Value Proposition
    */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/integration_instance.html");
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return IntegrationInstance.getArtifactReference();
    }
    static getDropTargets() {
        return [Compartment.getArtifactReference()];
    }
}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropIntegrationInstanceView = function(target) {
    let view_artefact = this.newIntegrationInstance();
    if (target.type === Compartment.getArtifactReference()) {
        view_artefact.artefact.compartment_id = target.id;
    } else {
        view_artefact.artefact.compartment_id = target.compartment_id;
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newIntegrationInstance = function(obj) {
    this.getIntegrationInstances().push(obj ? new IntegrationInstanceView(obj, this) : new IntegrationInstanceView(this.okitjson.newIntegrationInstance(), this));
    return this.getIntegrationInstances()[this.getIntegrationInstances().length - 1];
}
OkitJsonView.prototype.getIntegrationInstances = function() {
    if (!this.integration_instances) {
        this.integration_instances = [];
    }
    return this.integration_instances;
}
OkitJsonView.prototype.getIntegrationInstance = function(id='') {
    for (let artefact of this.getIntegrationInstances()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadIntegrationInstances = function(integration_instances) {
    for (const artefact of integration_instances) {
        this.getIntegrationInstances().push(new IntegrationInstanceView(new IntegrationInstance(artefact, this.okitjson), this));
    }
}
OkitJsonView.prototype.moveIntegrationInstance = function(id) {
    // Build Dialog
    const self = this;
    let integration_instance = this.getIntegrationInstance(id);
    $(jqId('modal_dialog_title')).text('Move ' + integration_instance.display_name);
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
        .attr('id', 'move_integration_instance_subnet_id');
    // Load Subnets
    this.loadSubnetsSelect('move_integration_instance_subnet_id');
    $(jqId("move_integration_instance_subnet_id")).val(integration_instance.artefact.subnet_id);
    // Submit Button
    const submit = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'submit_query_btn')
        .attr('type', 'button')
        .text('Move')
        .on('click', function () {
            $(jqId('modal_dialog_wrapper')).addClass('hidden');
            if (integration_instance.artefact.subnet_id !== $(jqId("move_integration_instance_subnet_id")).val()) {
                self.getSubnet(integration_instance.artefact.subnet_id).recalculate_dimensions = true;
                self.getSubnet($(jqId("move_integration_instance_subnet_id")).val()).recalculate_dimensions = true;
                integration_instance.artefact.subnet_id = $(jqId("move_integration_instance_subnet_id")).val();
                integration_instance.artefact.compartment_id = self.getSubnet(integration_instance.artefact.subnet_id).artefact.compartment_id;
            }
            self.update(this.okitjson);
        });
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}
OkitJsonView.prototype.pasteIntegrationInstance = function(drop_target) {
    const clone = this.copied_artefact.artefact.clone();
    clone.display_name += 'Copy';
    if (this.paste_count) {clone.display_name += `-${this.paste_count}`;}
    this.paste_count += 1;
    clone.id = clone.okit_id;
    if (drop_target.getArtifactReference() === Subnet.getArtifactReference()) {
        clone.subnet_id = drop_target.id;
        clone.compartment_id = drop_target.compartment_id;
    }
    this.okitjson.integration_instances.push(clone);
    this.update(this.okitjson);
}
OkitJsonView.prototype.loadIntegrationInstancesSelect = function(select_id, empty_option=false) {
    $(jqId(select_id)).empty();
    const integration_instance_select = $(jqId(select_id));
    if (empty_option) {
        integration_instance_select.append($('<option>').attr('value', '').text(''));
    }
    for (let integration_instance of this.getIntegrationInstances()) {
        integration_instance_select.append($('<option>').attr('value', integration_instance.id).text(integration_instance.display_name));
    }
}
OkitJsonView.prototype.loadIntegrationInstancesMultiSelect = function(select_id) {
    $(jqId(select_id)).empty();
    const multi_select = d3.select(d3Id(select_id));
    for (let integration_instance of this.getIntegrationInstances()) {
        const div = multi_select.append('div');
        div.append('input')
            .attr('type', 'checkbox')
            .attr('id', safeId(integration_instance.id))
            .attr('value', integration_instance.id);
        div.append('label')
            .attr('for', safeId(integration_instance.id))
            .text(integration_instance.display_name);
    }
}
