/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Vm Cluster View Javascript');

/*
** Define Vm Cluster View Class
*/
class VmClusterView extends OkitContainerCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        if (!json_view.vm_clusters) json_view.vm_clusters = [];
        super(artefact, json_view);
    }
    get parent_id() {return this.artefact.exadata_infrastructure_id;}
    get parent() {return this.getJsonView().getExadataInfrastructure(this.parent_id);}
    get info_text() {return `${this.artefact.cpus_enabled} cpus / ${this.artefact.data_storage_size_in_tbs} Tbs`;}
    /*
    ** SVG Processing
    */
    drawAttachments() {
        let attachment_count = 0;
        // Draw Route Table
        if (this.artefact.vm_cluster_network_id !== '') {
            let attachment = new VmClusterNetworkView(this.getJsonView().getOkitJson().getVmClusterNetwork(this.vm_cluster_network_id), this.getJsonView());
            attachment.attached_id = this.id;
            attachment.draw();
            attachment_count += 1;
        }
    }
    /*
    ** Property Sheet Load function
    */
    loadProperties() {
        const self = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/vm_cluster.html", () => {loadPropertiesSheet(self.artefact);});
    }
    /*
    ** Load and display Value Proposition
    */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/vm_cluster.html");
    }
    /*
    ** Dimension Overrides
    */
    getTopEdgeChildrenMaxDimensions() {
        let top_edge_dimensions = {width: 0, height: this.icon_height};
        if (this.artefact.vm_cluster_network_id !== '') {
            const dimensions = this.json_view.getVmClusterNetwork(this.artefact.vm_cluster_network_id).dimensions;
            top_edge_dimensions.width += (dimensions.width + positional_adjustments.spacing.x);
        }
        return top_edge_dimensions;
    }
    /*
    ** Child Artifact Functions
     */
    getTopArtifacts() {
        return [DbNode.getArtifactReference()];
    }
    getTopEdgeArtifacts() {
        return [VmClusterNetwork.getArtifactReference()];
    }
    getContainerArtifacts() {
        return [DbHome.getArtifactReference()];
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return VmCluster.getArtifactReference();
    }
    static getDropTargets() {
        return [ExadataInfrastructure.getArtifactReference()];
    }
}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropVmClusterView = function(target) {
    let view_artefact = this.newVmCluster();
    if (target.type === Compartment.getArtifactReference()) {
        view_artefact.artefact.compartment_id = target.id;
    } else {
        view_artefact.artefact.compartment_id = target.compartment_id;
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newVmCluster = function(obj) {
    this.getVmClusters().push(obj ? new VmClusterView(obj, this) : new VmClusterView(this.okitjson.newVmCluster(), this));
    return this.getVmClusters()[this.getVmClusters().length - 1];
}
OkitJsonView.prototype.getVmClusters = function() {
    if (!this.vm_clusters) {
        this.vm_clusters = [];
    }
    return this.vm_clusters;
}
OkitJsonView.prototype.getVmCluster = function(id='') {
    for (let artefact of this.getVmClusters()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadVmClusters = function(vm_clusters) {
    for (const artefact of vm_clusters) {
        this.getVmClusters().push(new VmClusterView(new VmCluster(artefact, this.okitjson), this));
    }
}
OkitJsonView.prototype.moveVmCluster = function(id) {
    // Build Dialog
    const self = this;
    let vm_cluster = this.getVmCluster(id);
    $(jqId('modal_dialog_title')).text('Move ' + vm_cluster.display_name);
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
        .attr('id', 'move_vm_cluster_subnet_id');
    // Load Subnets
    this.loadSubnetsSelect('move_vm_cluster_subnet_id');
    $(jqId("move_vm_cluster_subnet_id")).val(vm_cluster.artefact.subnet_id);
    // Submit Button
    const submit = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'submit_query_btn')
        .attr('type', 'button')
        .text('Move')
        .on('click', function () {
            $(jqId('modal_dialog_wrapper')).addClass('hidden');
            if (vm_cluster.artefact.subnet_id !== $(jqId("move_vm_cluster_subnet_id")).val()) {
                self.getSubnet(vm_cluster.artefact.subnet_id).recalculate_dimensions = true;
                self.getSubnet($(jqId("move_vm_cluster_subnet_id")).val()).recalculate_dimensions = true;
                vm_cluster.artefact.subnet_id = $(jqId("move_vm_cluster_subnet_id")).val();
                vm_cluster.artefact.compartment_id = self.getSubnet(vm_cluster.artefact.subnet_id).artefact.compartment_id;
            }
            self.update(this.okitjson);
        });
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}
OkitJsonView.prototype.pasteVmCluster = function(drop_target) {
    const clone = this.copied_artefact.artefact.clone();
    clone.display_name += 'Copy';
    if (this.paste_count) {clone.display_name += `-${this.paste_count}`;}
    this.paste_count += 1;
    clone.id = clone.okit_id;
    if (drop_target.getArtifactReference() === Subnet.getArtifactReference()) {
        clone.subnet_id = drop_target.id;
        clone.compartment_id = drop_target.compartment_id;
    }
    this.okitjson.getVmClusters().push(clone);
    this.update(this.okitjson);
}
OkitJsonView.prototype.loadVmClustersSelect = function(select_id, empty_option=false) {
    $(jqId(select_id)).empty();
    const vm_cluster_select = $(jqId(select_id));
    if (empty_option) {
        vm_cluster_select.append($('<option>').attr('value', '').text(''));
    }
    for (let vm_cluster of this.getVmClusters()) {
        vm_cluster_select.append($('<option>').attr('value', vm_cluster.id).text(vm_cluster.display_name));
    }
}
OkitJsonView.prototype.loadVmClustersMultiSelect = function(select_id) {
    $(jqId(select_id)).empty();
    const multi_select = d3.select(d3Id(select_id));
    for (let vm_cluster of this.getVmClusters()) {
        const div = multi_select.append('div');
        div.append('input')
            .attr('type', 'checkbox')
            .attr('id', safeId(vm_cluster.id))
            .attr('value', vm_cluster.id);
        div.append('label')
            .attr('for', safeId(vm_cluster.id))
            .text(vm_cluster.display_name);
    }
}
