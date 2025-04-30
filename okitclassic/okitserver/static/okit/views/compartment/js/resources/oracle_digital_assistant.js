/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Oracle Digital Assistant View Javascript');

/*
** Define Oracle Digital Assistant View Class
*/
class OracleDigitalAssistantView extends OkitCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        if (!json_view.oracle_digital_assistants) json_view.oracle_digital_assistants = [];
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
    newPropertiesSheet() {
        this.properties_sheet = new OracleDigitalAssistantProperties(this.artefact)
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return OracleDigitalAssistant.getArtifactReference();
    }
    static getDropTargets() {
        // TODO: Return List of Artefact Drop Targets Parent Object Reference Names e.g. VirtualCloudNetwork for a Internet Gateway
        return [Compartment.getArtifactReference()];
    }
}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropOracleDigitalAssistantView = function(target) {
    let view_artefact = this.newOracleDigitalAssistant();
    if (target.type === Compartment.getArtifactReference()) {
        view_artefact.artefact.compartment_id = target.id;
    } else {
        view_artefact.artefact.compartment_id = target.compartment_id;
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newOracleDigitalAssistant = function(obj) {
    this.getOracleDigitalAssistants().push(obj ? new OracleDigitalAssistantView(obj, this) : new OracleDigitalAssistantView(this.okitjson.newOracleDigitalAssistant(), this));
    return this.getOracleDigitalAssistants()[this.getOracleDigitalAssistants().length - 1];
}
OkitJsonView.prototype.getOracleDigitalAssistants = function() {
    if (!this.oracle_digital_assistants) {
        this.oracle_digital_assistants = [];
    }
    return this.oracle_digital_assistants;
}
OkitJsonView.prototype.getOracleDigitalAssistant = function(id='') {
    for (let artefact of this.getOracleDigitalAssistants()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadOracleDigitalAssistants = function(oracle_digital_assistants) {
    for (const artefact of oracle_digital_assistants) {
        this.getOracleDigitalAssistants().push(new OracleDigitalAssistantView(new OracleDigitalAssistant(artefact, this.okitjson), this));
    }
}
OkitJsonView.prototype.moveOracleDigitalAssistant = function(id) {
    // Build Dialog
    const self = this;
    let oracle_digital_assistant = this.getOracleDigitalAssistant(id);
    $(jqId('modal_dialog_title')).text('Move ' + oracle_digital_assistant.display_name);
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
        .attr('id', 'move_oracle_digital_assistant_subnet_id');
    // Load Subnets
    this.loadSubnetsSelect('move_oracle_digital_assistant_subnet_id');
    $(jqId("move_oracle_digital_assistant_subnet_id")).val(oracle_digital_assistant.artefact.subnet_id);
    // Submit Button
    const submit = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'submit_query_btn')
        .attr('type', 'button')
        .text('Move')
        .on('click', function () {
            $(jqId('modal_dialog_wrapper')).addClass('hidden');
            if (oracle_digital_assistant.artefact.subnet_id !== $(jqId("move_oracle_digital_assistant_subnet_id")).val()) {
                self.getSubnet(oracle_digital_assistant.artefact.subnet_id).recalculate_dimensions = true;
                self.getSubnet($(jqId("move_oracle_digital_assistant_subnet_id")).val()).recalculate_dimensions = true;
                oracle_digital_assistant.artefact.subnet_id = $(jqId("move_oracle_digital_assistant_subnet_id")).val();
                oracle_digital_assistant.artefact.compartment_id = self.getSubnet(oracle_digital_assistant.artefact.subnet_id).artefact.compartment_id;
            }
            self.update(this.okitjson);
        });
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}
OkitJsonView.prototype.pasteOracleDigitalAssistant = function(drop_target) {
    const clone = this.copied_artefact.artefact.clone();
    clone.display_name += 'Copy';
    if (this.paste_count) {clone.display_name += `-${this.paste_count}`;}
    this.paste_count += 1;
    clone.id = clone.okit_id;
    if (drop_target.getArtifactReference() === Subnet.getArtifactReference()) {
        clone.subnet_id = drop_target.id;
        clone.compartment_id = drop_target.compartment_id;
    }
    this.okitjson.getOracleDigitalAssistants().push(clone);
    this.update(this.okitjson);
}
OkitJsonView.prototype.loadOracleDigitalAssistantsSelect = function(select_id, empty_option=false) {
    $(jqId(select_id)).empty();
    const oracle_digital_assistant_select = $(jqId(select_id));
    if (empty_option) {
        oracle_digital_assistant_select.append($('<option>').attr('value', '').text(''));
    }
    for (let oracle_digital_assistant of this.getOracleDigitalAssistants()) {
        oracle_digital_assistant_select.append($('<option>').attr('value', oracle_digital_assistant.id).text(oracle_digital_assistant.display_name));
    }
}
OkitJsonView.prototype.loadOracleDigitalAssistantsMultiSelect = function(select_id) {
    $(jqId(select_id)).empty();
    const multi_select = d3.select(d3Id(select_id));
    for (let oracle_digital_assistant of this.getOracleDigitalAssistants()) {
        const div = multi_select.append('div');
        div.append('input')
            .attr('type', 'checkbox')
            .attr('id', safeId(oracle_digital_assistant.id))
            .attr('value', oracle_digital_assistant.id);
        div.append('label')
            .attr('for', safeId(oracle_digital_assistant.id))
            .text(oracle_digital_assistant.display_name);
    }
}
