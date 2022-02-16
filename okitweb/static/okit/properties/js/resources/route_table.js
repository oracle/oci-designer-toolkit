/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded RouteTable Properties Javascript');

/*
** Define RouteTable Properties Class
*/
class RouteTableProperties extends OkitResourceProperties {
    constructor (resource) {
        const resource_tabs = []
        super(resource, resource_tabs)
    }

    // Build Additional Resource Specific Properties
    buildResource() {
        const self = this
        // VCN
        const [vcn_row, vcn_input] = this.createInput('select', 'Virtual Cloud Network', `${self.id}_vcn_id`, '', (d, i, n) => self.resource.vcn_id = n[i].value)
        this.vcn_id = vcn_input
        this.append(this.core_tbody, vcn_row)
        // Vcn Default
        const [default_row, default_input] = this.createInput('checkbox', 'VCN Default', `${self.id}_default`, '', (d, i, n) => self.resource.default = n[i].checked)
        this.default = default_input
        this.append(this.core_tbody, default_row)
        // Rules
        const [rules_details, rules_summary, rules_div] = this.createDetailsSection('Route Rules', `${self.id}_rules_details`)
        this.append(this.properties_contents, rules_details)
        this.rules_div = rules_div
        const [rules_table, rules_thead, rules_tbody] = this.createArrayTable('Rules', `${self.id}_rules`, '', () => self.addRule())
        this.rules_tbody = rules_tbody
        this.append(rules_div, rules_table)
    }

    // Load Additional Resource Specific Properties
    loadResource() {
        // Load Reference Selects
        this.loadSelect(this.vcn_id, 'virtual_cloud_network', true)
        // Assign Values
        this.vcn_id.property('value', this.resource.vcn_id)
        this.default.property('checked', this.resource.default)
        this.loadRules()
    }
    loadRules() {
        this.rules_tbody.selectAll('*').remove()
        this.resource.route_rules.forEach((e, i) => this.addRuleHtml(e, i+1))
        this.rule_idx = this.resource.route_rules.length;
    }
    addRuleHtml(rule, idx) {
        const self = this
        const id = `${self.id}_rule`
        const network_entity_id = `${id}_network_entity_id`
        const [row, div] = this.createDeleteRow(id, idx, () => this.deleteRule(id, idx, rule))
        this.append(this.rules_tbody, row)
        const [rule_details, rule_summary, rule_div] = this.createDetailsSection('Rule', `${id}_rule_details`, idx)
        this.append(div, rule_details)
        const [rule_table, rule_thead, rule_tbody] = this.createTable('', `${id}_rule`, '')
        this.append(rule_div, rule_table)
        // Target Type
        const [tt_row, tt_input] = this.createInput('select', 'Target Type', `${id}_target_type`, idx, (d, i, n) => {rule.target_type = n[i].value = n[i].value; self.showRuleRows(rule, id, idx); this.loadNetworkEntitySelect(rule, network_entity_id, idx)})
        this.append(rule_tbody, tt_row)
        this.loadTargetTypeSelect(tt_input)
        tt_input.property('value', rule.target_type)
        // Destination Type
        const [dt_row, dt_input] = this.createInput('select', 'Destination Type', `${id}_destination_type`, idx, (d, i, n) => {rule.destination_type = n[i].value = n[i].value; self.showRuleRows(rule, id, idx)})
        this.append(rule_tbody, dt_row)
        this.loadDestinationTypeSelect(dt_input)
        dt_input.property('value', rule.destination_type)
        // Destination
        const [destination_row, destination_input] = this.createInput('ipv4_cidr', 'Destination', `${id}_destination`, idx, (d, i, n) => {n[i].reportValidity(); rule.destination = n[i].value})
        this.append(rule_tbody, destination_row)
        destination_input.property('value', rule.destination)
        // Network Entity
        const [ne_row, ne_input] = this.createInput('select', 'Network Entity', network_entity_id, idx, (d, i, n) => {rule.network_entity_id = n[i].value = n[i].value; self.showRuleRows(rule, id, idx)})
        this.append(rule_tbody, ne_row)
        this.loadNetworkEntitySelect(rule, network_entity_id, idx)
        ne_input.property('value', rule.network_entity_id)
        // Description
        const [desc_row, desc_input] = this.createInput('text', 'Description', `${self.id}_description`, '', (d, i, n) => rule.description = n[i].value)
        this.append(rule_tbody, desc_row)
        desc_input.property('value', rule.description)
        // Check Display
        this.showRuleRows(rule, id, idx)
    }
    addRule() {
        const rule = this.resource.newRule();
        this.resource.route_rules.push(rule);
        this.rule_idx += 1
        this.addRuleHtml(rule, this.rule_idx);
    }
    deleteRule(id, idx, rule) {
        this.resource.route_rules = this.resource.route_rules.filter((e) => e !== rule)
        $(`#${id}${idx}_row`).remove()
    }
    loadTargetTypeSelect(select) {
        const types_map = new Map([
            ['Internet Gateway', 'internet_gateway'],
            ['NAT Gateway', 'nat_gateway'],
            ['Local Peering Gateway', 'local_peering_gateway'],
            ['Dynamic Routing Gateway', this.resource.getOkitJson().metadata.platform === 'pca' ? 'dynamic_routing_gateways' : 'drg_attachment'],
            // ['Dynamic Routing Gateway', 'drg_attachment'],
            // ['Dynamic Routing Gateway', 'dynamic_routing_gateways'], // Needed when PCA is available
            ['Private IP', 'private_ip'],
            ['Service Gateway', 'service_gateway'],
        ]);
        this.loadSelectFromMap(select, types_map)
    }
    loadDestinationTypeSelect(select) {
        const types_map = new Map([
            ['CIDR Block', 'CIDR_BLOCK'],
            ['Service', 'SERVICE_CIDR_BLOCK'],
        ]);
        this.loadSelectFromMap(select, types_map)
    }
    loadNetworkEntitySelect(rule, id, idx) {
        const select = d3.select(`#${this.inputId(id, idx)}`)
        const selected_id = this.loadSelect(select, rule.target_type, false)
        if (rule.target_type !== 'local_peering_gateway' || rule.network_entity_id === '' || !rule.network_entity_id) rule.network_entity_id = selected_id
        // this.loadSelect(select, rule.target_type, false, this.vcn_filter)
    }
    showRuleRows(rule, id, idx) {
        if (rule.target_type !== 'private_ip') {
            this.hideProperty(`${id}_destination_type`, idx)
            if (rule.target_type !== 'service_gateway') {
                this.showProperty(`${id}_destination`, idx)
            } else {
                this.hideProperty(`${id}_destination`, idx)
            }
        } else {
            this.showProperty(`${id}_destination_type`, idx)
        }
    }
}
