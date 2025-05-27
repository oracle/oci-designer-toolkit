/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Web Application Firewall View Javascript');

/*
** Define Web Application Firewall View Class
*/
class WebApplicationFirewallView extends OkitCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        if (!json_view.web_application_firewalls) json_view.web_application_firewalls = [];
        super(artefact, json_view);
    }
    // TODO: Change as appropriate
    get parent_id() {return this.artefact.compartment_id;}
    get parent() {return this.getJsonView().getCompartment(this.parent_id);}
    /*
    ** SVG Processing
    */
    /*
    ** Property Sheet Load function
    */
    newPropertiesSheet() {
        this.properties_sheet = new WebApplicationFirewallProperties(this.artefact)
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return WebApplicationFirewall.getArtifactReference();
    }
    static getDropTargets() {
        return [Compartment.getArtifactReference()];
    }
}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropWebApplicationFirewallView = function(target) {
    let view_artefact = this.newWebApplicationFirewall();
    if (target.type === Compartment.getArtifactReference()) {
        view_artefact.artefact.compartment_id = target.id;
    } else {
        view_artefact.artefact.compartment_id = target.compartment_id;
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newWebApplicationFirewall = function(obj) {
    this.getWebApplicationFirewalls().push(obj ? new WebApplicationFirewallView(obj, this) : new WebApplicationFirewallView(this.okitjson.newWebApplicationFirewall(), this));
    return this.getWebApplicationFirewalls()[this.getWebApplicationFirewalls().length - 1];
}
OkitJsonView.prototype.getWebApplicationFirewalls = function() {
    if (!this.web_application_firewalls) this.web_application_firewalls = [];
    return this.web_application_firewalls;
}
OkitJsonView.prototype.getWebApplicationFirewall = function(id='') {
    return this.getWebApplicationFirewalls().find(r => r.id === id)
}
OkitJsonView.prototype.loadWebApplicationFirewalls = function(web_application_firewalls) {
    for (const artefact of web_application_firewalls) {
        this.getWebApplicationFirewalls().push(new WebApplicationFirewallView(new WebApplicationFirewall(artefact, this.okitjson), this));
    }
}
OkitJsonView.prototype.moveWebApplicationFirewall = function(id) {
    // Build Dialog
    const self = this;
    let web_application_firewall = this.getWebApplicationFirewall(id);
    $(jqId('modal_dialog_title')).text('Move ' + web_application_firewall.display_name);
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
        .attr('id', 'move_web_application_firewall_subnet_id');
    // Load Subnets
    this.loadSubnetsSelect('move_web_application_firewall_subnet_id');
    $(jqId("move_web_application_firewall_subnet_id")).val(web_application_firewall.artefact.subnet_id);
    // Submit Button
    const submit = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'submit_query_btn')
        .attr('type', 'button')
        .text('Move')
        .on('click', function () {
            $(jqId('modal_dialog_wrapper')).addClass('hidden');
            if (web_application_firewall.artefact.subnet_id !== $(jqId("move_web_application_firewall_subnet_id")).val()) {
                self.getSubnet(web_application_firewall.artefact.subnet_id).recalculate_dimensions = true;
                self.getSubnet($(jqId("move_web_application_firewall_subnet_id")).val()).recalculate_dimensions = true;
                web_application_firewall.artefact.subnet_id = $(jqId("move_web_application_firewall_subnet_id")).val();
                web_application_firewall.artefact.compartment_id = self.getSubnet(web_application_firewall.artefact.subnet_id).artefact.compartment_id;
            }
            self.update(this.okitjson);
        });
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}
OkitJsonView.prototype.pasteWebApplicationFirewall = function(drop_target) {
    const clone = this.copied_artefact.artefact.clone();
    clone.display_name += 'Copy';
    if (this.paste_count) {clone.display_name += `-${this.paste_count}`;}
    this.paste_count += 1;
    clone.id = clone.okit_id;
    if (drop_target.getArtifactReference() === Subnet.getArtifactReference()) {
        clone.subnet_id = drop_target.id;
        clone.compartment_id = drop_target.compartment_id;
    }
    this.okitjson.getWebApplicationFirewalls().push(clone);
    this.update(this.okitjson);
}
OkitJsonView.prototype.loadWebApplicationFirewallsSelect = function(select_id, empty_option=false) {
    $(jqId(select_id)).empty();
    const web_application_firewall_select = $(jqId(select_id));
    if (empty_option) {
        web_application_firewall_select.append($('<option>').attr('value', '').text(''));
    }
    for (let web_application_firewall of this.getWebApplicationFirewalls()) {
        web_application_firewall_select.append($('<option>').attr('value', web_application_firewall.id).text(web_application_firewall.display_name));
    }
}
OkitJsonView.prototype.loadWebApplicationFirewallsMultiSelect = function(select_id) {
    $(jqId(select_id)).empty();
    const multi_select = d3.select(d3Id(select_id));
    for (let web_application_firewall of this.getWebApplicationFirewalls()) {
        const div = multi_select.append('div');
        div.append('input')
            .attr('type', 'checkbox')
            .attr('id', safeId(web_application_firewall.id))
            .attr('value', web_application_firewall.id);
        div.append('label')
            .attr('for', safeId(web_application_firewall.id))
            .text(web_application_firewall.display_name);
    }
}
