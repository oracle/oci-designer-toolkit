/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Drg View Javascript');

/*
** Define Drg View Class
*/
class DrgView extends OkitArtefactView {
    constructor(artefact=null, json_view) {
        if (!json_view.drgs) json_view.drgs = [];
        super(artefact, json_view);
        this.route_table_idx = 0;
        this.route_rule_idx = [0];
    }
    get parent_id() {return this.artefact.compartment_id;}
    get parent() {return this.getJsonView().getCompartment(this.parent_id);}
    /*
    ** SVG Processing
    */
    /*
    ** Property Sheet Load function
    */
    loadProperties() {
        const self = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/drg.html", () => {
            const drt_tbody = self.addPropertyHTML('drg_route_tables', 'array', 'Route Tables', 'route_tables', '', () => self.addRouteTable())
            loadPropertiesSheet(self.artefact);
            self.loadRouteTables();
        });
    }

    loadRouteTables() {
        this.artefact.route_tables.forEach((e, i) => this.addRouteTableHtml(e, i+1))
        this.route_table_idx = this.artefact.route_tables.length
        this.route_rule_idx = Array.from({length: this.route_table_idx + 1}, () => 1)
        console.info('Route Table Index', this.route_table_idx)
        console.info('Route Rules Index', this.route_rule_idx)
    }
    addRouteTable() {
        console.info('Adding Route Table');
        const route_table = this.artefact.newRouteTable();
        this.artefact.route_tables.push(route_table);
        // const idx = this.artefact.route_tables.length;
        this.route_table_idx += 1
        if (this.route_rule_idx.length <= this.route_table_idx) this.route_rule_idx.push(1)
        console.info('Route Table Index', this.route_table_idx)
        console.info('Route Rules Index', this.route_rule_idx)
        this.addRouteTableHtml(route_table, this.route_table_idx);
    }
    addRouteTableHtml(route_table, idx) {
        const self = this
        const id = 'route_table';
        // const row = this.addPropertyHTML('route_tables_tbody', 'row', '', id, idx, () => this.deleteRouteTable(id, idx, route_table));
        const row = this.addPropertyHTML(this.tbodyId('route_tables', ''), 'row', '', id, idx, () => this.deleteRouteTable(id, idx, route_table));
        const details = this.addPropertyHTML(row, 'object-input', 'Route Table', 'rt_display_name', idx, (d, i, n) => route_table.display_name = n[i].value);
        const tbody = this.addPropertyHTML(details, 'properties', '', id, idx);
        let property = undefined
        // Display Name (Text)
        // property = this.addPropertyHTML(tbody, 'text', 'Name', 'display_name', idx, (d, i, n) => route_table.display_name = n[i].value);
        property = d3.select(`#rt_display_name${idx}`)
        property.attr('value', route_table.display_name)
        // property.node().value = route_table.display_name
        // ECMP Enable (Checkbox)
        property = this.addPropertyHTML(tbody, 'checkbox', 'ECMP Enabled', 'is_ecmp_enabled', idx, (d, i, n) => route_table.is_ecmp_enabled = n[i].checked);
        property.attr('checked', route_table.is_ecmp_enabled)
        property.node().checked = route_table.is_ecmp_enabled
        // Distribution (Select)
        property = this.addPropertyHTML(tbody, 'select', 'Route Distribution', 'import_drg_route_distribution_id', idx, (d, i, n) => route_table.import_drg_route_distribution_id = n[i].value);
        this.loadRouteDistribution(property)
        property.attr('value', route_table.import_drg_route_distribution_id)
        property.node().value = route_table.import_drg_route_distribution_id
        // Rules
        property = this.addPropertyHTML(details, 'array', 'Rules', 'route_rules', idx, () => self.addRouteRule(route_table, idx))
        self.loadRouteRules(route_table, idx)
    }
    deleteRouteTable(id, idx, route_table) {
        this.artefact.route_tables = this.artefact.route_tables.filter((rt) => rt !== route_table)
        $(`#${id}${idx}_row`).remove()
    }
    loadRouteRules(route_table, rt_idx) {
        route_table.rules.forEach((e, i) => this.addRouteRuleHtml(e, i+1, route_table, rt_idx))
        this.route_rule_idx[rt_idx] = route_table.rules.length
        console.info('Route Table Index', this.route_table_idx)
        console.info('Route Rules Index', this.route_rule_idx)
    }
    addRouteRule(route_table, rt_idx) {
        console.info('Add Route Rule', rt_idx)
        const route_rule = this.artefact.newRouteRule();
        route_table.rules.push(route_rule);
        this.route_rule_idx[rt_idx] += 1;
        console.info('Route Table Index', this.route_table_idx)
        console.info('Route Rules Index', this.route_rule_idx)
        this.addRouteRuleHtml(route_rule, this.route_rule_idx[rt_idx], route_table, rt_idx)
    }
    addRouteRuleHtml(route_rule, idx, route_table, rt_idx) {
        const self = this
        const id = this.tbodyId('route_rule', rt_idx);
        const row = this.addPropertyHTML(this.tbodyId('route_rules', rt_idx), 'row', '', id, idx, () => this.deleteRouteRule(id, idx, route_rule, route_table));
        // const details = this.addPropertyHTML(row, 'object-input', 'Route Rule', 'rt_display_name', idx, (d, i, n) => route_table.display_name = n[i].value);
        const details = this.addPropertyHTML(row, 'object', 'Rule', id, idx);
        const tbody = this.addPropertyHTML(details, 'properties', '', id, idx);
        let property = undefined
        // Destination (CIDR)
        property = this.addPropertyHTML(tbody, 'ipv4_cidr', 'Destination', 'destination', idx, (d, i, n) => {n[i].reportValidity(); route_rule.destination = n[i].value});
        property.attr('value', route_rule.destination)
        // DRG Attachment (Select)
        property = this.addPropertyHTML(tbody, 'select', 'Next Hop', 'next_hop_drg_attachment_id', idx, (d, i, n) => route_rule.next_hop_drg_attachment_id = n[i].value);
        this.loadDrgAttachment(property)
        property.attr('value', route_rule.next_hop_drg_attachment_id)
        property.node().value = route_rule.next_hop_drg_attachment_id
    }
    deleteRouteRule(id, idx, route_rule, route_table) {
        route_table.rules = route_table.rules.filter((rr) => rr !== route_rule)
        $(`#${id}${idx}_row`).remove()

    }    
    loadRouteDistribution(parent) {}
    loadDrgAttachment(parent) {}
    /*
    ** Load and display Value Proposition
    */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/drg.html");
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return Drg.getArtifactReference();
    }
    static getDropTargets() {
        return [Compartment.getArtifactReference()];
    }
}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropDrgView = function(target) {
    let view_artefact = this.newDrg();
    if (target.type === Compartment.getArtifactReference()) {
        view_artefact.artefact.compartment_id = target.id;
    } else {
        view_artefact.artefact.compartment_id = target.compartment_id;
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newDrg = function(obj) {
    this.getDrgs().push(obj ? new DrgView(obj, this) : new DrgView(this.okitjson.newDrg(), this));
    return this.getDrgs()[this.getDrgs().length - 1];
}
OkitJsonView.prototype.getDrgs = function() {
    if (!this.drgs) {
        this.drgs = [];
    }
    return this.drgs;
}
OkitJsonView.prototype.getDrg = function(id='') {
    for (let artefact of this.getDrgs()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadDrgs = function(drgs) {
    for (const artefact of drgs) {
        this.getDrgs().push(new DrgView(new Drg(artefact, this.okitjson), this));
    }
}
OkitJsonView.prototype.moveDrg = function(id) {
    // Build Dialog
    const self = this;
    let drg = this.getDrg(id);
    $(jqId('modal_dialog_title')).text('Move ' + drg.display_name);
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
        .attr('id', 'move_drg_subnet_id');
    // Load Subnets
    this.loadSubnetsSelect('move_drg_subnet_id');
    $(jqId("move_drg_subnet_id")).val(drg.artefact.subnet_id);
    // Submit Button
    const submit = d3.select(d3Id('modal_dialog_footer')).append('div').append('button')
        .attr('id', 'submit_query_btn')
        .attr('type', 'button')
        .text('Move')
        .on('click', function () {
            $(jqId('modal_dialog_wrapper')).addClass('hidden');
            if (drg.artefact.subnet_id !== $(jqId("move_drg_subnet_id")).val()) {
                self.getSubnet(drg.artefact.subnet_id).recalculate_dimensions = true;
                self.getSubnet($(jqId("move_drg_subnet_id")).val()).recalculate_dimensions = true;
                drg.artefact.subnet_id = $(jqId("move_drg_subnet_id")).val();
                drg.artefact.compartment_id = self.getSubnet(drg.artefact.subnet_id).artefact.compartment_id;
            }
            self.update(this.okitjson);
        });
    $(jqId('modal_dialog_wrapper')).removeClass('hidden');
}
OkitJsonView.prototype.pasteDrg = function(drop_target) {
    const clone = this.copied_artefact.artefact.clone();
    clone.display_name += 'Copy';
    if (this.paste_count) {clone.display_name += `-${this.paste_count}`;}
    this.paste_count += 1;
    clone.id = clone.okit_id;
    if (drop_target.getArtifactReference() === Subnet.getArtifactReference()) {
        clone.subnet_id = drop_target.id;
        clone.compartment_id = drop_target.compartment_id;
    }
    this.okitjson.drgs.push(clone);
    this.update(this.okitjson);
}
OkitJsonView.prototype.loadDrgsSelect = function(select_id, empty_option=false) {
    $(jqId(select_id)).empty();
    const drg_select = $(jqId(select_id));
    if (empty_option) {
        drg_select.append($('<option>').attr('value', '').text(''));
    }
    for (let drg of this.getDrgs()) {
        drg_select.append($('<option>').attr('value', drg.id).text(drg.display_name));
    }
}
OkitJsonView.prototype.loadDrgsMultiSelect = function(select_id) {
    $(jqId(select_id)).empty();
    const multi_select = d3.select(d3Id(select_id));
    for (let drg of this.getDrgs()) {
        const div = multi_select.append('div');
        div.append('input')
            .attr('type', 'checkbox')
            .attr('id', safeId(drg.id))
            .attr('value', drg.id);
        div.append('label')
            .attr('for', safeId(drg.id))
            .text(drg.display_name);
    }
}
