/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded RouteTable Properties Javascript');

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
        const vcn = this.createInput('select', 'Virtual Cloud Network', `${self.id}_vcn_id`, '', (d, i, n) => self.resource.vcn_id = n[i].value)
        this.vcn_id = vcn.input
        this.append(this.core_tbody, vcn.row)
        // Vcn Default
        const vcn_default = this.createInput('checkbox', 'VCN Default', `${self.id}_default`, '', (d, i, n) => self.resource.default = n[i].checked)
        this.default = vcn_default.input
        this.append(this.core_tbody, vcn_default.row)
        // Rules
        const rd = this.createDetailsSection('Route Rules', `${self.id}_rules_details`)
        this.append(this.properties_contents, rd.details)
        this.rules_div = rd.div
        const rt = this.createArrayTable('Rules', `${self.id}_rules`, '', () => self.addRule())
        this.rules_tbody = rt.tbody
        this.append(rd.div, rt.table)
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
        const delete_row = this.createDeleteRow(id, idx, () => this.deleteRule(id, idx, rule))
        this.append(this.rules_tbody, delete_row.row)
        const rd = this.createDetailsSection('Rule', `${id}_rule_details`, idx)
        this.append(delete_row.div, rd.details)
        const rt = this.createTable('', `${id}_rule`, '')
        this.append(rd.div, rt.table)
        // Target Type
        const tt = this.createInput('select', 'Target Type', `${id}_target_type`, idx, (d, i, n) => {rule.target_type = n[i].value; self.showRuleRows(rule, id, idx); this.loadNetworkEntitySelect(rule, `${id}_network_entity_id`, idx)})
        this.append(rt.tbody, tt.row)
        this.loadTargetTypeSelect(tt.input)
        tt.input.property('value', rule.target_type)
        // Destination Type
        const dt = this.createInput('select', 'Destination Type', `${id}_destination_type`, idx, (d, i, n) => {rule.destination_type = n[i].value; self.showRuleRows(rule, id, idx)})
        this.append(rt.tbody, dt.row)
        this.loadDestinationTypeSelect(dt.input)
        dt.input.property('value', rule.destination_type)
        // Service Destination
        const service_dest = this.createInput('select', 'Destination', `${id}_service_destination`, idx, (d, i, n) => {rule.destination = n[i].value})
        this.append(rt.tbody, service_dest.row)
        this.loadServiceDestinationSelect(service_dest.input)
        service_dest.input.property('value', rule.destination)
        // Destination
        const destination = this.createInput('ipv4_cidr', 'Destination', `${id}_destination`, idx, (d, i, n) => {n[i].reportValidity(); rule.destination = n[i].value})
        this.append(rt.tbody, destination.row)
        destination.input.property('value', rule.destination)
        // Network Entity
        const ne = this.createInput('select', 'Network Entity', `${id}_network_entity_id`, idx, (d, i, n) => {rule.network_entity_id = n[i].value; console.info('Network Entity Id', rule.network_entity_id); self.showRuleRows(rule, id, idx)})
        this.append(rt.tbody, ne.row)
        this.loadNetworkEntitySelect(rule, `${id}_network_entity_id`, idx)
        ne.input.property('value', rule.network_entity_id)
        // Description
        const desc = this.createInput('text', 'Description', `${id}_description`, '', (d, i, n) => rule.description = n[i].value)
        this.append(rt.tbody, desc.row)
        desc.input.property('value', rule.description)
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
            // ['Dynamic Routing Gateway', this.resource.getOkitJson().metadata.platform === 'pca' ? 'dynamic_routing_gateways' : 'drg_attachment'],
            ['Dynamic Routing Gateway', this.resource.isPCA() || this.resource.isC3() ? 'dynamic_routing_gateways' : 'drg_attachment'], // Reverted DRG
            // ['Dynamic Routing Gateway', this.resource.isPCA() || this.resource.isC3() ? 'dynamic_routing_gateway_attachment' : 'drg_attachment'],
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
    loadServiceDestinationSelect(select) {
        const types_map = new Map([ // Map to Terraform Local Variable Names
            ['All Services', 'all_services_destination'],
            ['Object Storage Service', 'objectstorage_services_destination'],
        ]);
        this.loadSelectFromMap(select, types_map)
    }
    loadNetworkEntitySelect(rule, id, idx) {
        const select = d3.select(`#${this.inputId(id, idx)}`)
        const selected_id = this.loadSelect(select, rule.target_type, false, rule.target_type === 'dynamic_routing_gateways' ? () => true : this.vcn_filter, '', rule.target_type === 'drg_attachment' ? 'drg_id' : 'id')
        if (rule.target_type !== 'local_peering_gateway' && (rule.network_entity_id === '' || !rule.network_entity_id)) rule.network_entity_id = selected_id
    }
    showRuleRows(rule, id, idx) {
        if (rule.target_type !== 'private_ip') {
            this.hideProperty(`${id}_destination_type`, idx)
            if (rule.target_type !== 'service_gateway') {
                this.showProperty(`${id}_destination`, idx)
                this.hideProperty(`${id}_service_destination`, idx)
            } else {
                this.hideProperty(`${id}_destination`, idx)
                this.showProperty(`${id}_service_destination`, idx)
            }
            rule.destination = rule.target_type === 'service_gateway' && !['all_services_destination', 'objectstorage_services_destination'].includes(rule.destination) ? 'all_services_destination' : rule.destination
            rule.destination_type = rule.target_type === 'service_gateway' ?  'SERVICE_CIDR_BLOCK' : 'CIDR_BLOCK'
            this.setPropertyValue(`${id}_destination`, idx, rule.destination)
        } else {
            this.showProperty(`${id}_destination_type`, idx)
        }
    }
}
