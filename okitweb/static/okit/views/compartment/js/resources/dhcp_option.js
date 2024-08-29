/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Dhcp Option View Javascript');

/*
** Define Dhcp Option View Class
*/
class DhcpOptionView extends OkitCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        if (!json_view.dhcp_options) json_view.dhcp_options = [];
        super(artefact, json_view);
    }
    get attached() {
        if (!this.attached_id) {
            for (let subnet of this.getOkitJson().getSubnets()) {
                if (subnet.dhcp_options_id === this.id) {
                    return true;
                }
            }
        }
        return false;
    }
    get parent_id() {return this.attached_id ? this.attached_id : this.artefact.vcn_id;}
    get parent() {return this.attached_id ? this.getJsonView().getSubnet(this.parent_id) : this.getJsonView().getVirtualCloudNetwork(this.parent_id);}
    get vcn_name() {return this.getJsonView().getVirtualCloudNetwork(this.vcn_id).display_name}
    /*
    ** SVG Processing
    */
    /*
    ** Property Sheet Load function
    */
    newPropertiesSheet() {
        this.properties_sheet = new DhcpOptionProperties(this.artefact)
    }

    /*
    ** Load and display Value Proposition
    */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/dhcp_option.html");
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return DhcpOption.getArtifactReference();
    }
    static getDropTargets() {
        return [VirtualCloudNetwork.getArtifactReference(), Subnet.getArtifactReference()];
    }
}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropDhcpOptionView = function(target) {
    let view_artefact = this.newDhcpOption();
    if (target.type === VirtualCloudNetwork.getArtifactReference()) {
        view_artefact.getArtefact().vcn_id = target.id;
        view_artefact.getArtefact().compartment_id = target.compartment_id;
    } else if (target.type === Subnet.getArtifactReference()) {
        const subnet = this.getOkitJson().getSubnet(target.id)
        view_artefact.getArtefact().vcn_id = subnet.vcn_id;
        view_artefact.getArtefact().compartment_id = target.id;
        subnet.dhcp_options_id = view_artefact.id;
    } else if (target.type === Compartment.getArtifactReference()) {
        view_artefact.getArtefact().compartment_id = target.id;
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newDhcpOption = function(obj) {
    this.getDhcpOptions().push(obj ? new DhcpOptionView(obj, this) : new DhcpOptionView(this.okitjson.newDhcpOption(), this));
    return this.getDhcpOptions()[this.getDhcpOptions().length - 1];
}
OkitJsonView.prototype.getDhcpOptions = function() {
    if (!this.dhcp_options) {
        this.dhcp_options = [];
    }
    return this.dhcp_options;
}
OkitJsonView.prototype.getDhcpOption = function(id='') {
    for (let artefact of this.getDhcpOptions()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadDhcpOptions = function(dhcp_options) {
    for (const artefact of dhcp_options) {
        this.getDhcpOptions().push(new DhcpOptionView(new DhcpOption(artefact, this.okitjson), this));
    }
}
OkitJsonView.prototype.moveDhcpOption = function(id) {
    // Build Dialog
    const self = this;
    let dhcp_option = this.getDhcpOption(id);
    $(jqId('modal_dialog_title')).text('Move ' + dhcp_option.display_name);
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
        .attr('id', 'move_dhcp_option_subnet_id');
    // Load Subnets
    this.loadSubnetsSelect('move_dhcp_option_subnet_id');
    $(jqId("move_dhcp_option_subnet_id")).val(dhcp_option.artefact.subnet_id);
    // Submit Button
    const submit = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'submit_query_btn')
        .attr('type', 'button')
        .text('Move')
        .on('click', function () {
            $(jqId('modal_dialog_wrapper')).addClass('hidden');
            if (dhcp_option.artefact.subnet_id !== $(jqId("move_dhcp_option_subnet_id")).val()) {
                self.getSubnet(dhcp_option.artefact.subnet_id).recalculate_dimensions = true;
                self.getSubnet($(jqId("move_dhcp_option_subnet_id")).val()).recalculate_dimensions = true;
                dhcp_option.artefact.subnet_id = $(jqId("move_dhcp_option_subnet_id")).val();
                dhcp_option.artefact.compartment_id = self.getSubnet(dhcp_option.artefact.subnet_id).artefact.compartment_id;
            }
            self.update(this.okitjson);
        });
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}
OkitJsonView.prototype.pasteDhcpOption = function(drop_target) {
    const clone = this.copied_artefact.artefact.clone();
    clone.display_name += 'Copy';
    if (this.paste_count) {clone.display_name += `-${this.paste_count}`;}
    this.paste_count += 1;
    clone.id = clone.okit_id;
    if (drop_target.getArtifactReference() === Subnet.getArtifactReference()) {
        clone.subnet_id = drop_target.id;
        clone.compartment_id = drop_target.compartment_id;
    }
    this.okitjson.getDhcpOptions().push(clone);
    this.update(this.okitjson);
}
OkitJsonView.prototype.loadDhcpOptionsSelect = function(select_id, empty_option=false) {
    $(jqId(select_id)).empty();
    const dhcp_option_select = $(jqId(select_id));
    if (empty_option) {
        dhcp_option_select.append($('<option>').attr('value', '').text(''));
    }
    for (let dhcp_option of this.getDhcpOptions()) {
        dhcp_option_select.append($('<option>').attr('value', dhcp_option.id).text(dhcp_option.display_name));
    }
}
OkitJsonView.prototype.loadDhcpOptionsMultiSelect = function(select_id) {
    $(jqId(select_id)).empty();
    const multi_select = d3.select(d3Id(select_id));
    for (let dhcp_option of this.getDhcpOptions()) {
        const div = multi_select.append('div');
        div.append('input')
            .attr('type', 'checkbox')
            .attr('id', safeId(dhcp_option.id))
            .attr('value', dhcp_option.id);
        div.append('label')
            .attr('for', safeId(dhcp_option.id))
            .text(dhcp_option.display_name);
    }
}
