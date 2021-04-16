/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Vm Cluster Network View Javascript');

/*
** Define Vm Cluster Network View Class
*/
class VmClusterNetworkView extends OkitDesignerArtefactView {
    constructor(artefact=null, json_view) {
        if (!json_view.vm_cluster_networks) json_view.vm_cluster_networks = [];
        super(artefact, json_view);
    }
    get attached() {
        if (!this.attached_id) {
            for (let vm_cluster of this.getOkitJson().vm_clusters) {
                if (vm_cluster.vm_cluster_network_id === this.id) {
                    return true;
                }
            }
        }
        return false;
    }
    get parent_id() {return this.attached_id ? this.attached_id : this.artefact.exadata_infrastructure_id;}
    get parent() {return this.attached_id ? this.getJsonView().getVmCluster(this.parent_id) : this.getJsonView().getExadataInfrastructure(this.parent_id);}
    /*
    ** SVG Processing
    */
    /*
    ** Property Sheet Load function
    */
    loadProperties() {
        const self = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/vm_cluster_network.html", () => {loadPropertiesSheet(self.artefact);});
    }
    /*
    ** Load and display Value Proposition
    */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/vm_cluster_network.html");
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return VmClusterNetwork.getArtifactReference();
    }
    static getDropTargets() {
        return [ExadataInfrastructure.getArtifactReference()];
    }
}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropVmClusterNetworkView = function(target) {
    let view_artefact = this.newVmClusterNetwork();
    if (target.type === Compartment.getArtifactReference()) {
        view_artefact.artefact.compartment_id = target.id;
    } else {
        view_artefact.artefact.compartment_id = target.compartment_id;
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newVmClusterNetwork = function(obj) {
    this.getVmClusterNetworks().push(obj ? new VmClusterNetworkView(obj, this) : new VmClusterNetworkView(this.okitjson.newVmClusterNetwork(), this));
    return this.getVmClusterNetworks()[this.getVmClusterNetworks().length - 1];
}
OkitJsonView.prototype.getVmClusterNetworks = function() {
    if (!this.vm_cluster_networks) {
        this.vm_cluster_networks = [];
    }
    return this.vm_cluster_networks;
}
OkitJsonView.prototype.getVmClusterNetwork = function(id='') {
    for (let artefact of this.getVmClusterNetworks()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadVmClusterNetworks = function(vm_cluster_networks) {
    for (const artefact of vm_cluster_networks) {
        this.getVmClusterNetworks().push(new VmClusterNetworkView(new VmClusterNetwork(artefact, this.okitjson), this));
    }
}
OkitJsonView.prototype.moveVmClusterNetwork = function(id) {
    // Build Dialog
    const self = this;
    let vm_cluster_network = this.getVmClusterNetwork(id);
    $(jqId('modal_dialog_title')).text('Move ' + vm_cluster_network.display_name);
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
        .attr('id', 'move_vm_cluster_network_subnet_id');
    // Load Subnets
    this.loadSubnetsSelect('move_vm_cluster_network_subnet_id');
    $(jqId("move_vm_cluster_network_subnet_id")).val(vm_cluster_network.artefact.subnet_id);
    // Submit Button
    const submit = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'submit_query_btn')
        .attr('type', 'button')
        .text('Move')
        .on('click', function () {
            $(jqId('modal_dialog_wrapper')).addClass('hidden');
            if (vm_cluster_network.artefact.subnet_id !== $(jqId("move_vm_cluster_network_subnet_id")).val()) {
                self.getSubnet(vm_cluster_network.artefact.subnet_id).recalculate_dimensions = true;
                self.getSubnet($(jqId("move_vm_cluster_network_subnet_id")).val()).recalculate_dimensions = true;
                vm_cluster_network.artefact.subnet_id = $(jqId("move_vm_cluster_network_subnet_id")).val();
                vm_cluster_network.artefact.compartment_id = self.getSubnet(vm_cluster_network.artefact.subnet_id).artefact.compartment_id;
            }
            self.update(this.okitjson);
        });
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}
OkitJsonView.prototype.pasteVmClusterNetwork = function(drop_target) {
    const clone = this.copied_artefact.artefact.clone();
    clone.display_name += 'Copy';
    if (this.paste_count) {clone.display_name += `-${this.paste_count}`;}
    this.paste_count += 1;
    clone.id = clone.okit_id;
    if (drop_target.getArtifactReference() === Subnet.getArtifactReference()) {
        clone.subnet_id = drop_target.id;
        clone.compartment_id = drop_target.compartment_id;
    }
    this.okitjson.vm_cluster_networks.push(clone);
    this.update(this.okitjson);
}
OkitJsonView.prototype.loadVmClusterNetworksSelect = function(select_id, empty_option=false) {
    $(jqId(select_id)).empty();
    const vm_cluster_network_select = $(jqId(select_id));
    if (empty_option) {
        vm_cluster_network_select.append($('<option>').attr('value', '').text(''));
    }
    for (let vm_cluster_network of this.getVmClusterNetworks()) {
        vm_cluster_network_select.append($('<option>').attr('value', vm_cluster_network.id).text(vm_cluster_network.display_name));
    }
}
OkitJsonView.prototype.loadVmClusterNetworksMultiSelect = function(select_id) {
    $(jqId(select_id)).empty();
    const multi_select = d3.select(d3Id(select_id));
    for (let vm_cluster_network of this.getVmClusterNetworks()) {
        const div = multi_select.append('div');
        div.append('input')
            .attr('type', 'checkbox')
            .attr('id', safeId(vm_cluster_network.id))
            .attr('value', vm_cluster_network.id);
        div.append('label')
            .attr('for', safeId(vm_cluster_network.id))
            .text(vm_cluster_network.display_name);
    }
}
