/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded SecurityList Properties Javascript');

/*
** Define SecurityList Properties Class
*/
class SecurityListProperties extends OkitResourceProperties {
    constructor (resource) {
        const resource_tabs = ['Rules']
        super(resource, resource_tabs)
    }

    // Build Additional Resource Specific Properties
    buildResource() {
        const self = this
        // VCN
        const [vcn_row, vcn_input] = this.createInput('select', 'Virtual Cloud Network', `${this.id}_vcn_id`, '', (d, i, n) => this.resource.vcn_id = n[i].value)
        this.vcn_id = vcn_input
        this.append(this.core_tbody, vcn_row)
        // Vcn Default
        const [default_row, default_input] = this.createInput('checkbox', 'VCN Default', `${this.id}_default`, '', (d, i, n) => this.resource.default = n[i].checked)
        this.default = default_input
        this.append(this.core_tbody, default_row)
        // Rules
        // Ingress
        const [ir_details, ir_summary, ir_div] = this.createDetailsSection('Ingress', `${self.id}_ingress_rules_details`)
        this.append(this.rules_contents, ir_details)
        this.ingress_rules_div = ir_div
        const [ir_table, ir_thead, ir_tbody] = this.createArrayTable('Rules', `${self.id}_ingress_rules`, '', () => self.addIngressRule())
        this.ingress_rules_tbody = ir_tbody
        this.append(ir_div, ir_table)
        // Egress
        const [er_details, er_summary, er_div] = this.createDetailsSection('Egress', `${self.id}_egress_rules_details`)
        this.append(this.rules_contents, er_details)
        this.egress_rules_div = er_div
        const [er_table, er_thead, er_tbody] = this.createArrayTable('Rules', `${self.id}_egress_rules`, '', () => self.addEgressRule())
        this.egress_rules_tbody = er_tbody
        this.append(er_div, er_table)
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
        this.loadIngressRules()
        this.loadEgressRules()
    }
    // Ingress Rules
    loadIngressRules() {
        this.ingress_rules_tbody.selectAll('*').remove()
        this.resource.ingress_security_rules.forEach((e, i) => this.addIngressRuleHtml(e, i+1))
        this.ingress_rule_idx = this.resource.ingress_security_rules.length;
    }
    addIngressRuleHtml(rule, idx) {
        const self = this
        const id = `${this.id}_ingress_rule`
        const [row, div] = this.createDeleteRow(id, idx, () => this.deleteIngressRule(id, idx, rule))
        this.append(this.ingress_rules_tbody, row)
        const [rule_details, rule_summary, rule_div] = this.createDetailsSection('Rule', `${id}_details`, idx)
        this.append(div, rule_details)
        const [rule_table, rule_thead, rule_tbody] = this.createTable('', `${id}_rule`, '')
        this.append(rule_div, rule_table)
        // Description
        const [desc_row, desc_input] = this.createInput('text', 'Description', `${id}_description`, '', (d, i, n) => rule.description = n[i].value)
        this.append(rule_tbody, desc_row)
        desc_input.property('value', rule.description)
        // Source Type
        const [sdtype_row, sdtype_input] = this.createInput('select', 'Source Type', `${id}_source_type`, idx, (d, i, n) => {rule.source_type = n[i].value = n[i].value; self.showIngressRuleRows(rule, id, idx)})
        this.append(rule_tbody, sdtype_row)
        this.loadSourceDestinationTypeSelect(sdtype_input)
        sdtype_input.property('value', rule.source_type)
        // Source
        const [source_row, source_input] = this.createInput('ipv4_cidr', 'Destination', `${id}_source`, idx, (d, i, n) => {n[i].reportValidity(); rule.source = n[i].value})
        this.append(rule_tbody, source_row)
        source_input.property('value', rule.source)
        // Stateless
        const [stateless_row, stateless_input] = this.createInput('checkbox', 'Stateless', `${id}_is_stateless`, idx, (d, i, n) => rule.is_stateless = n[i].checked)
        this.append(rule_tbody, stateless_row)
        stateless_input.property('checked', rule.is_stateless)
        // Protocol
        const [sdprotocol_row, sdprotocol_input] = this.createInput('select', 'Protocol', `${id}_protocol`, idx, (d, i, n) => {rule.protocol = n[i].value = n[i].value; this.createOptions(rule); self.showIngressRuleRows(rule, id, idx)})
        this.append(rule_tbody, sdprotocol_row)
        this.loadProtocolSelect(sdprotocol_input)
        sdprotocol_input.property('value', rule.protocol)
        // TCP Options
        this.addTcpOptionsHtml(rule_tbody, rule, id, idx)
        // UDP Options
        this.addUdpOptionsHtml(rule_tbody, rule, id, idx)
        // ICMP Options
        this.addIcmpOptionsHtml(rule_tbody, rule, id, idx)
        // Check Display
        this.showIngressRuleRows(rule, id, idx)
    }
    getPortRange(port_range){
        if (port_range) {
            port_range.max = port_range.min.toString() !== port_range.max.toString() ? port_range.max : ''
            const sep = port_range.min.toString() !== '' && port_range.max.toString() !== '' ? '-' : ''
            return `${port_range.min}${sep}${port_range.max}`
        }
        return ''
    }
    setPortRange(port_range, value) {
        if (port_range && value) {
            const ports = value.trim().split('-')
            port_range.min = ports.length > 0 ? ports[0] : ''
            port_range.max = ports.length > 1 && ports[0] !== ports[1] ? ports[1] : ''
        } else if (port_range) {
            port_range.min = ''
            port_range.max = ''
        }
    }
    addTcpOptionsHtml(rule_tbody, rule, rule_id, idx) {
        const id = `${rule_id}_tcp`
        // Source
        const [source_row, source_input] = this.createInput('port_range', 'Source Port Range', `${id}_source_port_range`, idx, (d, i, n) => {n[i].reportValidity(); this.setPortRange(rule.tcp_options.source_port_range, n[i].value)})
        this.append(rule_tbody, source_row)
        if (rule.tcp_options) {source_input.property('value', this.getPortRange(rule.tcp_options.source_port_range))}

        // Destination
        const [destination_row, destination_input] = this.createInput('port_range', 'Destination Port Range', `${id}_destination_port_range`, idx, (d, i, n) => {n[i].reportValidity(); this.setPortRange(rule.tcp_options.destination_port_range, n[i].value)})
        this.append(rule_tbody, destination_row)
        if (rule.tcp_options) {destination_input.property('value', this.getPortRange(rule.tcp_options.destination_port_range))}
    }
    addUdpOptionsHtml(rule_tbody, rule, rule_id, idx) {
        const id = `${rule_id}_udp`
        // Source
        const [source_row, source_input] = this.createInput('port_range', 'Source Port Range', `${id}_source_port_range`, idx, (d, i, n) => {n[i].reportValidity(); this.setPortRange(rule.udp_options.source_port_range, n[i].value)})
        this.append(rule_tbody, source_row)
        if (rule.udp_options) {source_input.property('value', this.getPortRange(rule.udp_options.source_port_range))}

        // Destination
        const [destination_row, destination_input] = this.createInput('port_range', 'Destination Port Range', `${id}_destination_port_range`, idx, (d, i, n) => {n[i].reportValidity(); this.setPortRange(rule.udp_options.destination_port_range, n[i].value)})
        this.append(rule_tbody, destination_row)
        if (rule.udp_options) {destination_input.property('value', this.getPortRange(rule.udp_options.destination_port_range))}
    }
    addIcmpOptionsHtml(rule_tbody, rule, rule_id, idx) {
        const id = `${rule_id}_icmp`
        // Type
        const [type_row, type_input] = this.createInput('number', 'Type', `${id}_type`, idx, (d, i, n) => rule.icmp_options.type = n[i].value)
        this.append(rule_tbody, type_row)
        if (rule.icmp_options) type_input.property('value', rule.icmp_options.type)
        // Code
        const [code_row, code_input] = this.createInput('number', 'Code', `${id}_code`, idx, (d, i, n) => rule.icmp_options.code = n[i].value)
        this.append(rule_tbody, code_row)
        if (rule.icmp_options) code_input.property('value', rule.icmp_options.code)
    }
    addIngressRule() {
        const rule = this.resource.newIngressRule();
        this.resource.ingress_security_rules.push(rule);
        this.ingress_rule_idx += 1
        this.addIngressRuleHtml(rule, this.ingress_rule_idx);
    }
    deleteIngressRule(id, idx, rule) {
        this.resource.ingress_security_rules = this.resource.ingress_security_rules.filter((e) => e !== rule)
        $(`#${id}${idx}_row`).remove()
    }
    showIngressRuleRows(rule, id, idx) {
        const tcp_source_id = `${id}_tcp_source_port_range`
        const tcp_destination_id = `${id}_tcp_destination_port_range`
        const udp_source_id = `${id}_udp_source_port_range`
        const udp_destination_id = `${id}_udp_destination_port_range`
        const icmp_type_id = `${id}_icmp_type`
        const icmp_code_id = `${id}_icmp_code`
        // Hide All
        this.hideProperty(tcp_source_id, idx)
        this.hideProperty(tcp_destination_id, idx)
        this.hideProperty(udp_source_id, idx)
        this.hideProperty(udp_destination_id, idx)
        this.hideProperty(icmp_type_id, idx)
        this.hideProperty(icmp_code_id, idx)
        // Show
        if (rule.target_type !== 'private_ip') {
        } else {
            this.showProperty(`${id}_destination_type`, idx)
        }
        if (rule.protocol === '1') {
            // ICMP
            this.showProperty(icmp_type_id, idx)
            this.showProperty(icmp_code_id, idx)
       } else if (rule.protocol === '6') {
           // 'TCP'
           this.showProperty(tcp_source_id, idx)
           this.showProperty(tcp_destination_id, idx)
     } else if (rule.protocol === '17') {
           // 'UDP'
           this.showProperty(udp_source_id, idx)
           this.showProperty(udp_destination_id, idx)
     }
    }
    // Egress Rules
    loadEgressRules() {
        this.egress_rules_tbody.selectAll('*').remove()
        this.resource.egress_security_rules.forEach((e, i) => this.addEgressRuleHtml(e, i+1))
        this.egress_rule_idx = this.resource.egress_security_rules.length;
    }
    addEgressRuleHtml(rule, idx) {
        const self = this
        const id = `${this.id}_egress_rule`
        const [row, div] = this.createDeleteRow(id, idx, () => this.deleteEgressRule(id, idx, rule))
        this.append(this.egress_rules_tbody, row)
        const [rule_details, rule_summary, rule_div] = this.createDetailsSection('Rule', `${id}_details`, idx)
        this.append(div, rule_details)
        const [rule_table, rule_thead, rule_tbody] = this.createTable('', `${id}_rule`, '')
        this.append(rule_div, rule_table)
        // Description
        const [desc_row, desc_input] = this.createInput('text', 'Description', `${id}_description`, '', (d, i, n) => rule.description = n[i].value)
        this.append(rule_tbody, desc_row)
        desc_input.property('value', rule.description)
        // Source Type
        const [sdtype_row, sdtype_input] = this.createInput('select', 'Source Type', `${id}_source_type`, idx, (d, i, n) => {rule.source_type = n[i].value = n[i].value; self.showEgressRuleRows(rule, id, idx)})
        this.append(rule_tbody, sdtype_row)
        this.loadSourceDestinationTypeSelect(sdtype_input)
        sdtype_input.property('value', rule.source_type)
        // Source
        const [source_row, source_input] = this.createInput('ipv4_cidr', 'Destination', `${id}_source`, idx, (d, i, n) => {n[i].reportValidity(); rule.source = n[i].value})
        this.append(rule_tbody, source_row)
        source_input.property('value', rule.source)
        // Stateless
        const [stateless_row, stateless_input] = this.createInput('checkbox', 'Stateless', `${id}_is_stateless`, idx, (d, i, n) => rule.is_stateless = n[i].checked)
        this.append(rule_tbody, stateless_row)
        stateless_input.property('checked', rule.is_stateless)
        // Protocol
        const [sdprotocol_row, sdprotocol_input] = this.createInput('select', 'Protocol', `${id}_protocol`, idx, (d, i, n) => {rule.protocol = n[i].value = n[i].value; this.createOptions(rule); self.showEgressRuleRows(rule, id, idx)})
        this.append(rule_tbody, sdprotocol_row)
        this.loadProtocolSelect(sdprotocol_input)
        sdprotocol_input.property('value', rule.protocol)
        // TCP Options
        this.addTcpOptionsHtml(rule_tbody, rule, id, idx)
        // UDP Options
        this.addUdpOptionsHtml(rule_tbody, rule, id, idx)
        // ICMP Options
        this.addIcmpOptionsHtml(rule_tbody, rule, id, idx)
        // Check Display
        this.showEgressRuleRows(rule, id, idx)

    }
    addEgressRule() {
        const rule = this.resource.newEgressRule();
        this.resource.egress_security_rules.push(rule);
        this.egress_rule_idx += 1
        this.addEgressRuleHtml(rule, this.egress_rule_idx);
    }
    deleteEgressRule(id, idx, rule) {
        this.resource.egress_security_rules = this.resource.egress_security_rules.filter((e) => e !== rule)
        $(`#${id}${idx}_row`).remove()
    }
    showEgressRuleRows(rule, id, idx) {
        this.showIngressRuleRows(rule, id, idx)
    }
    // Common
    createOptions(rule) {
        if (rule.protocol === '1') {
             // ICMP
             delete rule.tcp_options
             delete rule.udp_options
             if (!rule.icmp_options) rule.icmp_options = this.resource.newIcmpOptions()
        } else if (rule.protocol === '6') {
            // 'TCP'
            if (!rule.tcp_options) rule.tcp_options = this.resource.newTcpOptions()
            delete rule.udp_options
            delete rule.icmp_options
       } else if (rule.protocol === '17') {
            // 'UDP'
            delete rule.tcp_options
            if (!rule.udp_options) rule.udp_options = this.resource.newUdpOptions()
            delete rule.icmp_options
       } else {
            // All
            delete rule.tcp_options
            delete rule.udp_options
            delete rule.icmp_options
       }
    }
    loadSourceDestinationTypeSelect(select) {
        const types_map = new Map([
            ['CIDR Block', 'CIDR_BLOCK'],
            ['Service', 'SERVICE_CIDR_BLOCK'],
        ]);
        this.loadSelectFromMap(select, types_map)
    }
    loadProtocolSelect(select) {
        const map = new Map([
            ['All', 'all'],
            ['ICMP', '1'],
            ['TCP', '6'],
            ['UDP', '17']
        ])
        this.loadSelectFromMap(select, map)
    }
}
