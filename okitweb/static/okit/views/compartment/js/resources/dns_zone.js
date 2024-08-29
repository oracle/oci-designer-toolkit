/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded Dns Zone View Javascript');

/*
** Define Dns Zone View Class
*/
class DnsZoneView extends OkitCompartmentArtefactView {
    constructor(artefact=null, json_view) {
        if (!json_view.dns_zones) json_view.dns_zones = [];
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
        this.properties_sheet = new DnsZoneProperties(this.artefact)
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return DnsZone.getArtifactReference();
    }
    static getDropTargets() {
        // TODO: Return List of Artefact Drop Targets Parent Object Reference Names e.g. VirtualCloudNetwork for a Internet Gateway
        return [Compartment.getArtifactReference()];
    }
}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropDnsZoneView = function(target) {
    let view_artefact = this.newDnsZone();
    if (target.type === Compartment.getArtifactReference()) {
        view_artefact.artefact.compartment_id = target.id;
    } else {
        view_artefact.artefact.compartment_id = target.compartment_id;
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newDnsZone = function(obj) {
    this.getDnsZones().push(obj ? new DnsZoneView(obj, this) : new DnsZoneView(this.okitjson.newDnsZone(), this));
    return this.getDnsZones()[this.getDnsZones().length - 1];
}
OkitJsonView.prototype.getDnsZones = function() {
    if (!this.dns_zones) this.dns_zones = [];
    return this.dns_zones;
}
OkitJsonView.prototype.getDnsZone = function(id='') {
    return this.getDnsZones().find(r => r.id === id)
}
OkitJsonView.prototype.loadDnsZones = function(dns_zones) {
    for (const artefact of dns_zones) {
        this.getDnsZones().push(new DnsZoneView(new DnsZone(artefact, this.okitjson), this));
    }
}
OkitJsonView.prototype.moveDnsZone = function(id) {
    // Build Dialog
    const self = this;
    let dns_zone = this.getDnsZone(id);
    $(jqId('modal_dialog_title')).text('Move ' + dns_zone.display_name);
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
        .attr('id', 'move_dns_zone_subnet_id');
    // Load Subnets
    this.loadSubnetsSelect('move_dns_zone_subnet_id');
    $(jqId("move_dns_zone_subnet_id")).val(dns_zone.artefact.subnet_id);
    // Submit Button
    const submit = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'submit_query_btn')
        .attr('type', 'button')
        .text('Move')
        .on('click', function () {
            $(jqId('modal_dialog_wrapper')).addClass('hidden');
            if (dns_zone.artefact.subnet_id !== $(jqId("move_dns_zone_subnet_id")).val()) {
                self.getSubnet(dns_zone.artefact.subnet_id).recalculate_dimensions = true;
                self.getSubnet($(jqId("move_dns_zone_subnet_id")).val()).recalculate_dimensions = true;
                dns_zone.artefact.subnet_id = $(jqId("move_dns_zone_subnet_id")).val();
                dns_zone.artefact.compartment_id = self.getSubnet(dns_zone.artefact.subnet_id).artefact.compartment_id;
            }
            self.update(this.okitjson);
        });
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}
OkitJsonView.prototype.pasteDnsZone = function(drop_target) {
    const clone = this.copied_artefact.artefact.clone();
    clone.display_name += 'Copy';
    if (this.paste_count) {clone.display_name += `-${this.paste_count}`;}
    this.paste_count += 1;
    clone.id = clone.okit_id;
    if (drop_target.getArtifactReference() === Subnet.getArtifactReference()) {
        clone.subnet_id = drop_target.id;
        clone.compartment_id = drop_target.compartment_id;
    }
    this.okitjson.getDnsZones().push(clone);
    this.update(this.okitjson);
}
OkitJsonView.prototype.loadDnsZonesSelect = function(select_id, empty_option=false) {
    $(jqId(select_id)).empty();
    const dns_zone_select = $(jqId(select_id));
    if (empty_option) {
        dns_zone_select.append($('<option>').attr('value', '').text(''));
    }
    for (let dns_zone of this.getDnsZones()) {
        dns_zone_select.append($('<option>').attr('value', dns_zone.id).text(dns_zone.display_name));
    }
}
OkitJsonView.prototype.loadDnsZonesMultiSelect = function(select_id) {
    $(jqId(select_id)).empty();
    const multi_select = d3.select(d3Id(select_id));
    for (let dns_zone of this.getDnsZones()) {
        const div = multi_select.append('div');
        div.append('input')
            .attr('type', 'checkbox')
            .attr('id', safeId(dns_zone.id))
            .attr('value', dns_zone.id);
        div.append('label')
            .attr('for', safeId(dns_zone.id))
            .text(dns_zone.display_name);
    }
}
