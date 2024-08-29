/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.debug('Loaded SecurityList Properties Javascript');

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
        const vcn = this.createInput('select', 'Virtual Cloud Network', `${this.id}_vcn_id`, '', (d, i, n) => this.resource.vcn_id = n[i].value)
        this.vcn_id = vcn.input
        this.append(this.core_tbody, vcn.row)
        // Vcn Default
        const vcn_default = this.createInput('checkbox', 'VCN Default', `${this.id}_default`, '', (d, i, n) => this.resource.default = n[i].checked)
        this.default = vcn_default.input
        this.append(this.core_tbody, vcn_default.row)
        // Rules
        // Ingress
        const ird = this.createDetailsSection('Ingress', `${self.id}_ingress_rules_details`)
        this.append(this.rules_contents, ird.details)
        this.ingress_rules_div = ird.div
        const irt = this.createArrayTable('Rules', `${self.id}_ingress_rules`, '', () => self.addIngressRule())
        this.ingress_rules_tbody = irt.tbody
        this.append(this.ingress_rules_div, irt.table)
        // Egress
        const erd = this.createDetailsSection('Egress', `${self.id}_egress_rules_details`)
        this.append(this.rules_contents, erd.details)
        this.egress_rules_div = erd.div
        const ert = this.createArrayTable('Rules', `${self.id}_egress_rules`, '', () => self.addEgressRule())
        this.egress_rules_tbody = ert.tbody
        this.append(this.egress_rules_div, ert.table)
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
        const delete_row = this.createDeleteRow(id, idx, () => this.deleteIngressRule(id, idx, rule))
        this.append(this.ingress_rules_tbody, delete_row.row)
        const rd = this.createDetailsSection('Rule', `${id}_details`, idx, (d, i, n) => this.toggleSummaryText(n, i, rule))
        this.append(delete_row.div, rd.details)
        const rt = this.createTable('', `${id}_rule`, '')
        this.append(rd.div, rt.table)
        // Description
        const desc = this.createInput('text', 'Description', `${id}_description`, '', (d, i, n) => rule.description = n[i].value)
        this.append(rt.tbody, desc.row)
        desc.input.property('value', rule.description)
        // Source Type
        const sdtype = this.createInput('select', 'Source Type', `${id}_source_type`, idx, (d, i, n) => {rule.source_type = n[i].value; self.showProtocolRuleRows(rule, id, idx)})
        this.append(rt.tbody, sdtype.row)
        this.loadSourceDestinationTypeSelect(sdtype.input)
        sdtype.input.property('value', rule.source_type)
        // Source
        const source = this.createInput('ipv4_cidr', 'Source', `${id}_source`, idx, (d, i, n) => {n[i].reportValidity(); rule.source = n[i].value})
        this.append(rt.tbody, source.row)
        source.input.property('value', rule.source)
        // Stateless
        const stateless = this.createInput('checkbox', 'Stateless', `${id}_is_stateless`, idx, (d, i, n) => rule.is_stateless = n[i].checked)
        this.append(rt.tbody, stateless.row)
        stateless.input.property('checked', rule.is_stateless)
        // Protocol
        const sdprotocol = this.createInput('select', 'Protocol', `${id}_protocol`, idx, (d, i, n) => {rule.protocol = n[i].value; this.createOptions(rule); self.showProtocolRuleRows(rule, id, idx)})
        this.append(rt.tbody, sdprotocol.row)
        this.loadProtocolSelect(sdprotocol.input)
        sdprotocol.input.property('value', rule.protocol)
        // TCP Options
        this.addTcpOptionsHtml(rt.tbody, rule, id, idx)
        // UDP Options
        this.addUdpOptionsHtml(rt.tbody, rule, id, idx)
        // ICMP Options
        this.addIcmpOptionsHtml(rt.tbody, rule, id, idx)
        // Check Display
        this.showProtocolRuleRows(rule, id, idx)
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
    // Egress Rules
    loadEgressRules() {
        this.egress_rules_tbody.selectAll('*').remove()
        this.resource.egress_security_rules.forEach((e, i) => this.addEgressRuleHtml(e, i+1))
        this.egress_rule_idx = this.resource.egress_security_rules.length;
    }
    addEgressRuleHtml(rule, idx) {
        const self = this
        const id = `${this.id}_egress_rule`
        const delete_row = this.createDeleteRow(id, idx, () => this.deleteEgressRule(id, idx, rule))
        this.append(this.egress_rules_tbody, delete_row.row)
        const rd = this.createDetailsSection('Rule', `${id}_details`, idx, (d, i, n) => this.toggleSummaryText(n, i, rule))
        this.append(delete_row.div, rd.details)
        const rt = this.createTable('', `${id}_rule`, '')
        this.append(rd.div, rt.table)
        // Description
        const desc = this.createInput('text', 'Description', `${id}_description`, '', (d, i, n) => rule.description = n[i].value)
        this.append(rt.tbody, desc.row)
        desc.input.property('value', rule.description)
        // Destination Type
        const sdtype = this.createInput('select', 'Destination Type', `${id}_destination_type`, idx, (d, i, n) => {rule.destination_type = n[i].value; self.showProtocolRuleRows(rule, id, idx)})
        this.append(rt.tbody, sdtype.row)
        this.loadSourceDestinationTypeSelect(sdtype.input)
        sdtype.input.property('value', rule.destination_type)
        // Destination
        const destination = this.createInput('ipv4_cidr', 'Destination', `${id}_destination`, idx, (d, i, n) => {n[i].reportValidity(); rule.destination = n[i].value})
        this.append(rt.tbody, destination.row)
        destination.input.property('value', rule.destination)
        // Stateless
        const stateless = this.createInput('checkbox', 'Stateless', `${id}_is_stateless`, idx, (d, i, n) => rule.is_stateless = n[i].checked)
        this.append(rt.tbody, stateless.row)
        stateless.input.property('checked', rule.is_stateless)
        // Protocol
        const sdprotocol = this.createInput('select', 'Protocol', `${id}_protocol`, idx, (d, i, n) => {rule.protocol = n[i].value; this.createOptions(rule); self.showProtocolRuleRows(rule, id, idx)})
        this.append(rt.tbody, sdprotocol.row)
        this.loadProtocolSelect(sdprotocol.input)
        sdprotocol.input.property('value', rule.protocol)
        // TCP Options
        this.addTcpOptionsHtml(rt.tbody, rule, id, idx)
        // UDP Options
        this.addUdpOptionsHtml(rt.tbody, rule, id, idx)
        // ICMP Options
        this.addIcmpOptionsHtml(rt.tbody, rule, id, idx)
        // Check Display
        this.showProtocolRuleRows(rule, id, idx)

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
    // Common
    toggleSummaryText(n, i, rule) {
        const summary_label = n[i].querySelector('summary > label')
        let source_dest = ''
        if (rule.source) {
            source_dest = `Source ${rule.source_type.split('_')[0]} ${rule.source}`
        } else {
            source_dest = `Destination ${rule.destination_type.split('_')[0]} ${rule.destination}`
        }
        const all_range = (range) => range === '' ? 'All' : range
        const tcp = rule.tcp_options ? `TCP Source: ${all_range(this.getPortRange(rule.tcp_options.source_port_range))} / Destination: ${all_range(this.getPortRange(rule.tcp_options.destination_port_range))}` : ''
        const udp = rule.udp_options ? `UDP Source: ${all_range(this.getPortRange(rule.udp_options.source_port_range))} / Destination: ${all_range(this.getPortRange(rule.udp_options.destination_port_range))}` : ''
        const icmp = rule.icmp_options ? `ICMP Type: ${rule.icmp_options.type} Code: ${rule.icmp_options.code ? rule.icmp_options.code : ''}` : ''
        const protocol = rule.protocol.toString() === 'all' ? 'All' : `${tcp}${udp}${icmp}`
        const innerText = n[i].open ? 'Rule' : `${source_dest} ${protocol}`
        summary_label.innerText = innerText
    }
    showProtocolRuleRows(rule, id, idx) {
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
    getPortRange(port_range){
        if (port_range) {
            const min = port_range.min.toString()
            const max = port_range.min.toString() !== port_range.max.toString() ? port_range.max : ''
            const sep = min.toString() !== '' && max.toString() !== '' ? '-' : ''
            return `${min}${sep}${max}`
        }
        return ''
    }
    setPortRange(port_range, value) {
        if (port_range && value) {
            const ports = value.trim().split('-')
            port_range.min = ports.length > 0 ? ports[0] : ''
            port_range.max = ports.length > 1 ? ports[1] : port_range.min
            // port_range.max = ports.length > 1 && ports[0] !== ports[1] ? ports[1] : ''
        } else if (port_range) {
            port_range.min = ''
            port_range.max = ''
        }
    }
    addTcpOptionsHtml(rule_tbody, rule, rule_id, idx) {
        const id = `${rule_id}_tcp`
        // Source
        const source = this.createInput('port_range', 'Source Port Range', `${id}_source_port_range`, idx, (d, i, n) => {n[i].reportValidity(); this.setPortRange(rule.tcp_options.source_port_range, n[i].value)})
        this.append(rule_tbody, source.row)
        if (rule.tcp_options) {source.input.property('value', this.getPortRange(rule.tcp_options.source_port_range))}

        // Destination
        const destination = this.createInput('port_range', 'Destination Port Range', `${id}_destination_port_range`, idx, (d, i, n) => {n[i].reportValidity(); this.setPortRange(rule.tcp_options.destination_port_range, n[i].value)})
        this.append(rule_tbody, destination.row)
        if (rule.tcp_options) {destination.input.property('value', this.getPortRange(rule.tcp_options.destination_port_range))}
    }
    addUdpOptionsHtml(rule_tbody, rule, rule_id, idx) {
        const id = `${rule_id}_udp`
        // Source
        const source = this.createInput('port_range', 'Source Port Range', `${id}_source_port_range`, idx, (d, i, n) => {n[i].reportValidity(); this.setPortRange(rule.udp_options.source_port_range, n[i].value)})
        this.append(rule_tbody, source.row)
        if (rule.udp_options) {source.input.property('value', this.getPortRange(rule.udp_options.source_port_range))}

        // Destination
        const destination = this.createInput('port_range', 'Destination Port Range', `${id}_destination_port_range`, idx, (d, i, n) => {n[i].reportValidity(); this.setPortRange(rule.udp_options.destination_port_range, n[i].value)})
        this.append(rule_tbody, destination.row)
        if (rule.udp_options) {destination.input.property('value', this.getPortRange(rule.udp_options.destination_port_range))}
    }
    addIcmpOptionsHtml(rule_tbody, rule, rule_id, idx) {
        const id = `${rule_id}_icmp`
        // Type
        const type = this.createInput('number', 'Type', `${id}_type`, idx, (d, i, n) => rule.icmp_options.type = n[i].value, {min: 0})
        this.append(rule_tbody, type.row)
        if (rule.icmp_options) type.input.property('value', rule.icmp_options.type)
        // Code
        const code = this.createInput('number', 'Code', `${id}_code`, idx, (d, i, n) => rule.icmp_options.code = n[i].value, {min: 0})
        this.append(rule_tbody, code.row)
        if (rule.icmp_options) code.input.property('value', rule.icmp_options.code)
    }
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
