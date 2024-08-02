/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Network Load Balancer View Javascript');

/*
** Define Network Load Balancer View Class
*/
class NetworkLoadBalancerView extends OkitCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        if (!json_view.network_load_balancers) json_view.network_load_balancers = [];
        super(artefact, json_view);
    }
    get parent_id() {
        const subnet = this.getJsonView().getSubnet(this.artefact.subnet_id)
        return (subnet && subnet.compartment_id === this.artefact.compartment_id) ? this.artefact.subnet_id : this.artefact.compartment_id
    }
    get parent() {return this.getJsonView().getSubnet(this.parent_id) ? this.getJsonView().getSubnet(this.parent_id) : this.getJsonView().getCompartment(this.parent_id);}
    /*
    ** SVG Processing
    */
    // Draw Connections
    drawConnections() {
        if (!this.artefact.backend_sets) this.artefact.backend_sets = []
        this.artefact.backend_sets.forEach((backend_set) => {
            backend_set.backends.forEach((backend) => {if (backend.target_id) this.drawConnection(this.id, backend.target_id)})
        })
    }
    /*
    ** Property Sheet Load function
    */
    newPropertiesSheet() {
        this.properties_sheet = new NetworkLoadBalancerProperties(this.artefact)
    }
    /*
    ** Load and display Value Proposition
    */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/network_load_balancer.html");
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return NetworkLoadBalancer.getArtifactReference();
    }
    static getDropTargets() {
        return [Subnet.getArtifactReference(), Compartment.getArtifactReference()];
    }
}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropNetworkLoadBalancerView = function(target) {
    let view_artefact = this.newNetworkLoadBalancer();
    if (target.type === Compartment.getArtifactReference()) {
        view_artefact.artefact.compartment_id = target.id;
    }
    else if (target.type === Subnet.getArtifactReference()) {
        view_artefact.artefact.compartment_id = target.compartment_id;
        view_artefact.artefact.subnet_id = target.id;
        view_artefact.artefact.is_private = this.getSubnet(target.id).prohibit_public_ip_on_vnic;
        view_artefact.artefact.is_preserve_source_destination = this.getSubnet(target.id).prohibit_public_ip_on_vnic;
    } else {
        view_artefact.artefact.compartment_id = target.compartment_id;
        view_artefact.artefact.subnet_id = target.id;
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newNetworkLoadBalancer = function(obj) {
    this.getNetworkLoadBalancers().push(obj ? new NetworkLoadBalancerView(obj, this) : new NetworkLoadBalancerView(this.okitjson.newNetworkLoadBalancer(), this));
    return this.getNetworkLoadBalancers()[this.getNetworkLoadBalancers().length - 1];
}
OkitJsonView.prototype.getNetworkLoadBalancers = function() {
    if (!this.network_load_balancers) {
        this.network_load_balancers = [];
    }
    return this.network_load_balancers;
}
OkitJsonView.prototype.getNetworkLoadBalancer = function(id='') {
    for (let artefact of this.getNetworkLoadBalancers()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadNetworkLoadBalancers = function(network_load_balancers) {
    for (const artefact of network_load_balancers) {
        this.getNetworkLoadBalancers().push(new NetworkLoadBalancerView(new NetworkLoadBalancer(artefact, this.okitjson), this));
    }
}
OkitJsonView.prototype.moveNetworkLoadBalancer = function(id) {
    // Build Dialog
    const self = this;
    let network_load_balancer = this.getNetworkLoadBalancer(id);
    $(jqId('modal_dialog_title')).text('Move ' + network_load_balancer.display_name);
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
        .attr('id', 'move_network_load_balancer_subnet_id');
    // Load Subnets
    this.loadSubnetsSelect('move_network_load_balancer_subnet_id');
    $(jqId("move_network_load_balancer_subnet_id")).val(network_load_balancer.artefact.subnet_id);
    // Submit Button
    const submit = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'submit_query_btn')
        .attr('type', 'button')
        .text('Move')
        .on('click', function () {
            $(jqId('modal_dialog_wrapper')).addClass('hidden');
            if (network_load_balancer.artefact.subnet_id !== $(jqId("move_network_load_balancer_subnet_id")).val()) {
                self.getSubnet(network_load_balancer.artefact.subnet_id).recalculate_dimensions = true;
                self.getSubnet($(jqId("move_network_load_balancer_subnet_id")).val()).recalculate_dimensions = true;
                network_load_balancer.artefact.subnet_id = $(jqId("move_network_load_balancer_subnet_id")).val();
                network_load_balancer.artefact.compartment_id = self.getSubnet(network_load_balancer.artefact.subnet_id).artefact.compartment_id;
            }
            self.update(this.okitjson);
        });
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}
OkitJsonView.prototype.pasteNetworkLoadBalancer = function(drop_target) {
    const clone = this.copied_artefact.artefact.clone();
    clone.display_name += 'Copy';
    if (this.paste_count) {clone.display_name += `-${this.paste_count}`;}
    this.paste_count += 1;
    clone.id = clone.okit_id;
    if (drop_target.getArtifactReference() === Subnet.getArtifactReference()) {
        clone.subnet_id = drop_target.id;
        clone.compartment_id = drop_target.compartment_id;
    }
    this.okitjson.getNetworkLoadBalancers().push(clone);
    this.update(this.okitjson);
}
OkitJsonView.prototype.loadNetworkLoadBalancersSelect = function(select_id, empty_option=false) {
    $(jqId(select_id)).empty();
    const network_load_balancer_select = $(jqId(select_id));
    if (empty_option) {
        network_load_balancer_select.append($('<option>').attr('value', '').text(''));
    }
    for (let network_load_balancer of this.getNetworkLoadBalancers()) {
        network_load_balancer_select.append($('<option>').attr('value', network_load_balancer.id).text(network_load_balancer.display_name));
    }
}
OkitJsonView.prototype.loadNetworkLoadBalancersMultiSelect = function(select_id) {
    $(jqId(select_id)).empty();
    const multi_select = d3.select(d3Id(select_id));
    for (let network_load_balancer of this.getNetworkLoadBalancers()) {
        const div = multi_select.append('div');
        div.append('input')
            .attr('type', 'checkbox')
            .attr('id', safeId(network_load_balancer.id))
            .attr('value', network_load_balancer.id);
        div.append('label')
            .attr('for', safeId(network_load_balancer.id))
            .text(network_load_balancer.display_name);
    }
}
