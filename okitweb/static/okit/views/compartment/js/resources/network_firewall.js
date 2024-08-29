/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Network Firewall View Javascript');

/*
** Define Network Firewall View Class
*/
class NetworkFirewallView extends OkitCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        if (!json_view.network_firewalls) json_view.network_firewalls = [];
        super(artefact, json_view);
    }
    get parent_id() {
        let subnet = this.getJsonView().getSubnet(this.subnet_id);
        if (subnet && subnet.compartment_id === this.artefact.compartment_id) {
            return this.subnet_id;
        } else {
            return this.compartment_id;
        }
    }
    get parent() {return this.getJsonView().getSubnet(this.parent_id) ? this.getJsonView().getSubnet(this.parent_id) : this.getJsonView().getCompartment(this.parent_id);}
    /*
    ** SVG Processing
    */
    getLinks() {return super.getLinks().filter((id) => id !== this.resource.network_firewall_policy_id)}
    /*
    ** Property Sheet Load function
    */
    newPropertiesSheet() {
        this.properties_sheet = new NetworkFirewallProperties(this.artefact)
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return NetworkFirewall.getArtifactReference();
    }
    static getDropTargets() {
        return [Compartment.getArtifactReference(), Subnet.getArtifactReference()];
    }
}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropNetworkFirewallView = function(target) {
    let view_artefact = this.newNetworkFirewall();
    if (target.type === Subnet.getArtifactReference()) {
        view_artefact.getArtefact().subnet_id = target.id;
        view_artefact.getArtefact().compartment_id = target.compartment_id;
    } else if (target.type === Compartment.getArtifactReference()) {
        view_artefact.getArtefact().compartment_id = target.id;
    } else {
        view_artefact.getArtefact().compartment_id = target.compartment_id;
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newNetworkFirewall = function(obj) {
    this.getNetworkFirewalls().push(obj ? new NetworkFirewallView(obj, this) : new NetworkFirewallView(this.okitjson.newNetworkFirewall(), this));
    return this.getNetworkFirewalls()[this.getNetworkFirewalls().length - 1];
}
OkitJsonView.prototype.getNetworkFirewalls = function() {
    if (!this.network_firewalls) this.network_firewalls = [];
    return this.network_firewalls;
}
OkitJsonView.prototype.getNetworkFirewall = function(id='') {
    return this.getNetworkFirewalls().find(r => r.id === id)
}
OkitJsonView.prototype.loadNetworkFirewalls = function(network_firewalls) {
    for (const artefact of network_firewalls) {
        this.getNetworkFirewalls().push(new NetworkFirewallView(new NetworkFirewall(artefact, this.okitjson), this));
    }
}
OkitJsonView.prototype.moveNetworkFirewall = function(id) {
    // Build Dialog
    const self = this;
    let network_firewall = this.getNetworkFirewall(id);
    $(jqId('modal_dialog_title')).text('Move ' + network_firewall.display_name);
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
        .attr('id', 'move_network_firewall_subnet_id');
    // Load Subnets
    this.loadSubnetsSelect('move_network_firewall_subnet_id');
    $(jqId("move_network_firewall_subnet_id")).val(network_firewall.artefact.subnet_id);
    // Submit Button
    const submit = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'submit_query_btn')
        .attr('type', 'button')
        .text('Move')
        .on('click', function () {
            $(jqId('modal_dialog_wrapper')).addClass('hidden');
            if (network_firewall.artefact.subnet_id !== $(jqId("move_network_firewall_subnet_id")).val()) {
                self.getSubnet(network_firewall.artefact.subnet_id).recalculate_dimensions = true;
                self.getSubnet($(jqId("move_network_firewall_subnet_id")).val()).recalculate_dimensions = true;
                network_firewall.artefact.subnet_id = $(jqId("move_network_firewall_subnet_id")).val();
                network_firewall.artefact.compartment_id = self.getSubnet(network_firewall.artefact.subnet_id).artefact.compartment_id;
            }
            self.update(this.okitjson);
        });
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}
OkitJsonView.prototype.pasteNetworkFirewall = function(drop_target) {
    const clone = this.copied_artefact.artefact.clone();
    clone.display_name += 'Copy';
    if (this.paste_count) {clone.display_name += `-${this.paste_count}`;}
    this.paste_count += 1;
    clone.id = clone.okit_id;
    if (drop_target.getArtifactReference() === Subnet.getArtifactReference()) {
        clone.subnet_id = drop_target.id;
        clone.compartment_id = drop_target.compartment_id;
    }
    this.okitjson.getNetworkFirewalls().push(clone);
    this.update(this.okitjson);
}
OkitJsonView.prototype.loadNetworkFirewallsSelect = function(select_id, empty_option=false) {
    $(jqId(select_id)).empty();
    const network_firewall_select = $(jqId(select_id));
    if (empty_option) {
        network_firewall_select.append($('<option>').attr('value', '').text(''));
    }
    for (let network_firewall of this.getNetworkFirewalls()) {
        network_firewall_select.append($('<option>').attr('value', network_firewall.id).text(network_firewall.display_name));
    }
}
OkitJsonView.prototype.loadNetworkFirewallsMultiSelect = function(select_id) {
    $(jqId(select_id)).empty();
    const multi_select = d3.select(d3Id(select_id));
    for (let network_firewall of this.getNetworkFirewalls()) {
        const div = multi_select.append('div');
        div.append('input')
            .attr('type', 'checkbox')
            .attr('id', safeId(network_firewall.id))
            .attr('value', network_firewall.id);
        div.append('label')
            .attr('for', safeId(network_firewall.id))
            .text(network_firewall.display_name);
    }
}
