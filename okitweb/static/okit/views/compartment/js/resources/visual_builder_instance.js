/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Visual Builder Instance View Javascript');

/*
** Define Visual Builder Instance View Class
*/
class VisualBuilderInstanceView extends OkitCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        if (!json_view.visual_builder_instances) json_view.visual_builder_instances = [];
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
        this.properties_sheet = new VisualBuilderInstanceProperties(this.artefact)
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return VisualBuilderInstance.getArtifactReference();
    }
    static getDropTargets() {
        // TODO: Return List of Artefact Drop Targets Parent Object Reference Names e.g. VirtualCloudNetwork for a Internet Gateway
        return [Compartment.getArtifactReference()];
    }
}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropVisualBuilderInstanceView = function(target) {
    let view_artefact = this.newVisualBuilderInstance();
    if (target.type === Compartment.getArtifactReference()) {
        view_artefact.artefact.compartment_id = target.id;
    } else {
        view_artefact.artefact.compartment_id = target.compartment_id;
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newVisualBuilderInstance = function(obj) {
    this.getVisualBuilderInstances().push(obj ? new VisualBuilderInstanceView(obj, this) : new VisualBuilderInstanceView(this.okitjson.newVisualBuilderInstance(), this));
    return this.getVisualBuilderInstances()[this.getVisualBuilderInstances().length - 1];
}
OkitJsonView.prototype.getVisualBuilderInstances = function() {
    if (!this.visual_builder_instances) {
        this.visual_builder_instances = [];
    }
    return this.visual_builder_instances;
}
OkitJsonView.prototype.getVisualBuilderInstance = function(id='') {
    for (let artefact of this.getVisualBuilderInstances()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadVisualBuilderInstances = function(visual_builder_instances) {
    for (const artefact of visual_builder_instances) {
        this.getVisualBuilderInstances().push(new VisualBuilderInstanceView(new VisualBuilderInstance(artefact, this.okitjson), this));
    }
}
OkitJsonView.prototype.moveVisualBuilderInstance = function(id) {
    // Build Dialog
    const self = this;
    let visual_builder_instance = this.getVisualBuilderInstance(id);
    $(jqId('modal_dialog_title')).text('Move ' + visual_builder_instance.display_name);
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
        .attr('id', 'move_visual_builder_instance_subnet_id');
    // Load Subnets
    this.loadSubnetsSelect('move_visual_builder_instance_subnet_id');
    $(jqId("move_visual_builder_instance_subnet_id")).val(visual_builder_instance.artefact.subnet_id);
    // Submit Button
    const submit = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'submit_query_btn')
        .attr('type', 'button')
        .text('Move')
        .on('click', function () {
            $(jqId('modal_dialog_wrapper')).addClass('hidden');
            if (visual_builder_instance.artefact.subnet_id !== $(jqId("move_visual_builder_instance_subnet_id")).val()) {
                self.getSubnet(visual_builder_instance.artefact.subnet_id).recalculate_dimensions = true;
                self.getSubnet($(jqId("move_visual_builder_instance_subnet_id")).val()).recalculate_dimensions = true;
                visual_builder_instance.artefact.subnet_id = $(jqId("move_visual_builder_instance_subnet_id")).val();
                visual_builder_instance.artefact.compartment_id = self.getSubnet(visual_builder_instance.artefact.subnet_id).artefact.compartment_id;
            }
            self.update(this.okitjson);
        });
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}
OkitJsonView.prototype.pasteVisualBuilderInstance = function(drop_target) {
    const clone = this.copied_artefact.artefact.clone();
    clone.display_name += 'Copy';
    if (this.paste_count) {clone.display_name += `-${this.paste_count}`;}
    this.paste_count += 1;
    clone.id = clone.okit_id;
    if (drop_target.getArtifactReference() === Subnet.getArtifactReference()) {
        clone.subnet_id = drop_target.id;
        clone.compartment_id = drop_target.compartment_id;
    }
    this.okitjson.getVisualBuilderInstances().push(clone);
    this.update(this.okitjson);
}
OkitJsonView.prototype.loadVisualBuilderInstancesSelect = function(select_id, empty_option=false) {
    $(jqId(select_id)).empty();
    const visual_builder_instance_select = $(jqId(select_id));
    if (empty_option) {
        visual_builder_instance_select.append($('<option>').attr('value', '').text(''));
    }
    for (let visual_builder_instance of this.getVisualBuilderInstances()) {
        visual_builder_instance_select.append($('<option>').attr('value', visual_builder_instance.id).text(visual_builder_instance.display_name));
    }
}
OkitJsonView.prototype.loadVisualBuilderInstancesMultiSelect = function(select_id) {
    $(jqId(select_id)).empty();
    const multi_select = d3.select(d3Id(select_id));
    for (let visual_builder_instance of this.getVisualBuilderInstances()) {
        const div = multi_select.append('div');
        div.append('input')
            .attr('type', 'checkbox')
            .attr('id', safeId(visual_builder_instance.id))
            .attr('value', visual_builder_instance.id);
        div.append('label')
            .attr('for', safeId(visual_builder_instance.id))
            .text(visual_builder_instance.display_name);
    }
}
