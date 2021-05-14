/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Analytics Instance View Javascript');

/*
** Define Analytics Instance View Class
*/
class AnalyticsInstanceView extends OkitArtefactView {
    constructor(artefact=null, json_view) {
        if (!json_view.analytics_instances) json_view.analytics_instances = [];
        super(artefact, json_view);
    }
    // -- Reference
    get parent_id() {
        let primary_subnet = this.getJsonView().getSubnet(this.subnet_id);
        if (primary_subnet && primary_subnet.compartment_id === this.artefact.compartment_id) {
            return this.subnet_id;
        } else {
            return this.compartment_id;
        }
    }
    get parent() {return this.getJsonView().getSubnet(this.parent_id) ? this.getJsonView().getSubnet(this.parent_id) : this.getJsonView().getCompartment(this.parent_id);}
    // Direct Subnet Access
    get subnet_id() {return this.artefact.network_endpoint_details.subnet_id;}
    set subnet_id(id) {this.artefact.network_endpoint_details.subnet_id = id;}
    /*
    ** SVG Processing
    */
    /*
    ** Property Sheet Load function
    */
    loadProperties() {
        const self = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/analytics_instance.html", () => {loadPropertiesSheet(self.artefact);});
    }
    /*
    ** Load and display Value Proposition
    */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/analytics_instance.html");
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return AnalyticsInstance.getArtifactReference();
    }
    static getDropTargets() {
        return [Compartment.getArtifactReference(), Subnet.getArtifactReference()];
    }
}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropAnalyticsInstanceView = function(target) {
    let view_artefact = this.newAnalyticsInstance();
    if (target.type === Subnet.getArtifactReference()) {
        view_artefact.getArtefact().subnet_id = target.id;
        view_artefact.getArtefact().compartment_id = target.compartment_id;
    } else if (target.type === Compartment.getArtifactReference()) {
        view_artefact.getArtefact().compartment_id = target.id;
    }
view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newAnalyticsInstance = function(obj) {
    this.getAnalyticsInstances().push(obj ? new AnalyticsInstanceView(obj, this) : new AnalyticsInstanceView(this.okitjson.newAnalyticsInstance(), this));
    return this.getAnalyticsInstances()[this.getAnalyticsInstances().length - 1];
}
OkitJsonView.prototype.getAnalyticsInstances = function() {
    if (!this.analytics_instances) {
        this.analytics_instances = [];
    }
    return this.analytics_instances;
}
OkitJsonView.prototype.getAnalyticsInstance = function(id='') {
    for (let artefact of this.getAnalyticsInstances()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadAnalyticsInstances = function(analytics_instances) {
    for (const artefact of analytics_instances) {
        this.getAnalyticsInstances().push(new AnalyticsInstanceView(new AnalyticsInstance(artefact, this.okitjson), this));
    }
}
OkitJsonView.prototype.moveAnalyticsInstance = function(id) {
    // Build Dialog
    const self = this;
    let analytics_instance = this.getAnalyticsInstance(id);
    $(jqId('modal_dialog_title')).text('Move ' + analytics_instance.display_name);
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
        .attr('id', 'move_analytics_instance_subnet_id');
    // Load Subnets
    this.loadSubnetsSelect('move_analytics_instance_subnet_id');
    $(jqId("move_analytics_instance_subnet_id")).val(analytics_instance.artefact.subnet_id);
    // Submit Button
    const submit = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'submit_query_btn')
        .attr('type', 'button')
        .text('Move')
        .on('click', function () {
            $(jqId('modal_dialog_wrapper')).addClass('hidden');
            if (analytics_instance.artefact.subnet_id !== $(jqId("move_analytics_instance_subnet_id")).val()) {
                self.getSubnet(analytics_instance.artefact.subnet_id).recalculate_dimensions = true;
                self.getSubnet($(jqId("move_analytics_instance_subnet_id")).val()).recalculate_dimensions = true;
                analytics_instance.artefact.subnet_id = $(jqId("move_analytics_instance_subnet_id")).val();
                analytics_instance.artefact.compartment_id = self.getSubnet(analytics_instance.artefact.subnet_id).artefact.compartment_id;
            }
            self.update(this.okitjson);
        });
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}
OkitJsonView.prototype.pasteAnalyticsInstance = function(drop_target) {
    const clone = this.copied_artefact.artefact.clone();
    clone.display_name += 'Copy';
    if (this.paste_count) {clone.display_name += `-${this.paste_count}`;}
    this.paste_count += 1;
    clone.id = clone.okit_id;
    if (drop_target.getArtifactReference() === Subnet.getArtifactReference()) {
        clone.subnet_id = drop_target.id;
        clone.compartment_id = drop_target.compartment_id;
    }
    this.okitjson.analytics_instances.push(clone);
    this.update(this.okitjson);
}
OkitJsonView.prototype.loadAnalyticsInstancesSelect = function(select_id, empty_option=false) {
    $(jqId(select_id)).empty();
    const analytics_instance_select = $(jqId(select_id));
    if (empty_option) {
        analytics_instance_select.append($('<option>').attr('value', '').text(''));
    }
    for (let analytics_instance of this.getAnalyticsInstances()) {
        analytics_instance_select.append($('<option>').attr('value', analytics_instance.id).text(analytics_instance.display_name));
    }
}
OkitJsonView.prototype.loadAnalyticsInstancesMultiSelect = function(select_id) {
    $(jqId(select_id)).empty();
    const multi_select = d3.select(d3Id(select_id));
    for (let analytics_instance of this.getAnalyticsInstances()) {
        const div = multi_select.append('div');
        div.append('input')
            .attr('type', 'checkbox')
            .attr('id', safeId(analytics_instance.id))
            .attr('value', analytics_instance.id);
        div.append('label')
            .attr('for', safeId(analytics_instance.id))
            .text(analytics_instance.display_name);
    }
}
