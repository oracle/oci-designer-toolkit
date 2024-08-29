/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Cloud Exadata Infrastructure View Javascript');

/*
** Define Cloud Exadata Infrastructure View Class
*/
class ExadataCloudInfrastructureView extends OkitCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        if (!json_view.exadata_cloud_infrastructures) json_view.exadata_cloud_infrastructures = [];
        super(artefact, json_view);
    }

    get parent_id() {
        let primary_subnet = this.getJsonView().getSubnet(this.artefact.subnet_id);
        if (primary_subnet && primary_subnet.compartment_id === this.artefact.compartment_id && this.artefact.create_cluster) {
            return this.artefact.subnet_id;
        } else {
            return this.artefact.compartment_id;
        }
    }
    get parent() {return this.getJsonView().getSubnet(this.parent_id) ? this.getJsonView().getSubnet(this.parent_id) : this.getJsonView().getCompartment(this.parent_id);}
    /*
    ** SVG Processing
    */
    /*
    ** Property Sheet Load function
    */
    newPropertiesSheet() {
        this.properties_sheet = new ExadataCloudInfrastructureProperties(this.artefact)
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return ExadataCloudInfrastructure.getArtifactReference();
    }
    static getDropTargets() {
        // TODO: Return List of Artefact Drop Targets Parent Object Reference Names e.g. VirtualCloudNetwork for a Internet Gateway
        return [Compartment.getArtifactReference()];
    }
}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropExadataCloudInfrastructureView = function(target) {
    let view_artefact = this.newExadataCloudInfrastructure();
    if (target.type === Compartment.getArtifactReference()) {
        view_artefact.artefact.compartment_id = target.id;
    } else {
        view_artefact.artefact.compartment_id = target.compartment_id;
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newExadataCloudInfrastructure = function(obj) {
    this.getExadataCloudInfrastructures().push(obj ? new ExadataCloudInfrastructureView(obj, this) : new ExadataCloudInfrastructureView(this.okitjson.newExadataCloudInfrastructure(), this));
    return this.getExadataCloudInfrastructures()[this.getExadataCloudInfrastructures().length - 1];
}
OkitJsonView.prototype.getExadataCloudInfrastructures = function() {
    if (!this.exadata_cloud_infrastructures) this.exadata_cloud_infrastructures = [];
    return this.exadata_cloud_infrastructures;
}
OkitJsonView.prototype.getExadataCloudInfrastructure = function(id='') {
    return this.getExadataCloudInfrastructures().find(r => r.id === id)
}
OkitJsonView.prototype.loadExadataCloudInfrastructures = function(exadata_cloud_infrastructures) {
    for (const artefact of exadata_cloud_infrastructures) {
        this.getExadataCloudInfrastructures().push(new ExadataCloudInfrastructureView(new ExadataCloudInfrastructure(artefact, this.okitjson), this));
    }
}
OkitJsonView.prototype.moveExadataCloudInfrastructure = function(id) {
    // Build Dialog
    const self = this;
    let cloud_exadata_infrastructure = this.getExadataCloudInfrastructure(id);
    $(jqId('modal_dialog_title')).text('Move ' + cloud_exadata_infrastructure.display_name);
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
        .attr('id', 'move_cloud_exadata_infrastructure_subnet_id');
    // Load Subnets
    this.loadSubnetsSelect('move_cloud_exadata_infrastructure_subnet_id');
    $(jqId("move_cloud_exadata_infrastructure_subnet_id")).val(cloud_exadata_infrastructure.artefact.subnet_id);
    // Submit Button
    const submit = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'submit_query_btn')
        .attr('type', 'button')
        .text('Move')
        .on('click', function () {
            $(jqId('modal_dialog_wrapper')).addClass('hidden');
            if (cloud_exadata_infrastructure.artefact.subnet_id !== $(jqId("move_cloud_exadata_infrastructure_subnet_id")).val()) {
                self.getSubnet(cloud_exadata_infrastructure.artefact.subnet_id).recalculate_dimensions = true;
                self.getSubnet($(jqId("move_cloud_exadata_infrastructure_subnet_id")).val()).recalculate_dimensions = true;
                cloud_exadata_infrastructure.artefact.subnet_id = $(jqId("move_cloud_exadata_infrastructure_subnet_id")).val();
                cloud_exadata_infrastructure.artefact.compartment_id = self.getSubnet(cloud_exadata_infrastructure.artefact.subnet_id).artefact.compartment_id;
            }
            self.update(this.okitjson);
        });
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}
OkitJsonView.prototype.pasteExadataCloudInfrastructure = function(drop_target) {
    const clone = this.copied_artefact.artefact.clone();
    clone.display_name += 'Copy';
    if (this.paste_count) {clone.display_name += `-${this.paste_count}`;}
    this.paste_count += 1;
    clone.id = clone.okit_id;
    if (drop_target.getArtifactReference() === Subnet.getArtifactReference()) {
        clone.subnet_id = drop_target.id;
        clone.compartment_id = drop_target.compartment_id;
    }
    this.okitjson.getExadataCloudInfrastructures().push(clone);
    this.update(this.okitjson);
}
OkitJsonView.prototype.loadExadataCloudInfrastructuresSelect = function(select_id, empty_option=false) {
    $(jqId(select_id)).empty();
    const cloud_exadata_infrastructure_select = $(jqId(select_id));
    if (empty_option) {
        cloud_exadata_infrastructure_select.append($('<option>').attr('value', '').text(''));
    }
    for (let cloud_exadata_infrastructure of this.getExadataCloudInfrastructures()) {
        cloud_exadata_infrastructure_select.append($('<option>').attr('value', cloud_exadata_infrastructure.id).text(cloud_exadata_infrastructure.display_name));
    }
}
OkitJsonView.prototype.loadExadataCloudInfrastructuresMultiSelect = function(select_id) {
    $(jqId(select_id)).empty();
    const multi_select = d3.select(d3Id(select_id));
    for (let cloud_exadata_infrastructure of this.getExadataCloudInfrastructures()) {
        const div = multi_select.append('div');
        div.append('input')
            .attr('type', 'checkbox')
            .attr('id', safeId(cloud_exadata_infrastructure.id))
            .attr('value', cloud_exadata_infrastructure.id);
        div.append('label')
            .attr('for', safeId(cloud_exadata_infrastructure.id))
            .text(cloud_exadata_infrastructure.display_name);
    }
}
