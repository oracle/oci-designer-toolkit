/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Designer SecurityList View Javascript');

/*
** Define SecurityList View Artifact Class
 */
class SecurityListView extends OkitDesignerArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
    }

    get attached() {
        if (!this.attached_id) {
            for (let subnet of this.getOkitJson().subnets) {
                if (subnet.security_list_ids.includes(this.id)) {
                    return true;
                }
            }
        }
        return false;
    }
    get parent_id() {return this.attached_id ? this.attached_id : this.artefact.vcn_id;}
    get parent() {return this.attached_id ? this.getJsonView().getSubnet(this.parent_id) : this.getJsonView().getVirtualCloudNetwork(this.parent_id);}

    /*
     ** SVG Processing
     */

    /*
    ** Property Sheet Load function
     */
    loadProperties() {
        let me = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/security_list.html", () => {
            // Load Referenced Ids
            // Load Properties
            loadPropertiesSheet(me.artefact);
            // Egress Rules
            me.loadEgressRules();
            // Ingress Rules
            me.loadIngressRules();
            // Add Handler to Add Button
            $(jqId('add_egress_rule')).on('click', () => {me.addEgressRule();});
            $(jqId('add_ingress_rule')).on('click', () => {me.addIngressRule();});
        });
    }

    loadEgressRules() {
        // Empty Existing Rules
        $(jqId('egress_rules_table_body')).empty();
        // Egress Rules
        let rule_num = 1;
        for (let security_rule of this.artefact.egress_security_rules) {
            this.addSecurityRuleHtml(security_rule, rule_num, 'egress');
            rule_num += 1;
        }
    }

    loadIngressRules() {
        // Empty Existing Rules
        $(jqId('ingress_rules_table_body')).empty();
        // Ingress Rules
        let rule_num = 1;
        for (let security_rule of this.artefact.ingress_security_rules) {
            this.addSecurityRuleHtml(security_rule, rule_num, 'ingress');
            rule_num += 1;
        }
    }

    addEgressRule() {
        let new_rule = { "protocol": "all", "is_stateless": false, description: "", destination_type: "CIDR_BLOCK", destination: "0.0.0.0/0"};
        this.egress_security_rules.push(new_rule);
        this.loadEgressRules();
        displayOkitJson();
    }

    addIngressRule() {
        let new_rule = { "protocol": "all", "is_stateless": false, description: "", source_type: "CIDR_BLOCK", source: "0.0.0.0/0"};
        this.ingress_security_rules.push(new_rule);
        this.loadIngressRules();
        displayOkitJson();
    }

    deleteEgressRule(rule_num) {
        this.egress_security_rules.splice(rule_num, 1);
        this.loadEgressRules();
        displayOkitJson();
    }

    deleteIngressRule(rule_num) {
        this.ingress_security_rules.splice(rule_num, 1);
        this.loadIngressRules();
        displayOkitJson();
    }

    addSecurityRuleHtml(access_rule, rule_num, access_type) {
        let me = this;
        // Default to ingress rules
        let rules_table_body = d3.select('#ingress_rules_table_body');
        let source_dest = 'source';
        let source_dest_title = 'Source';
        if (access_type === 'egress') {
            rules_table_body = d3.select('#egress_rules_table_body');
            source_dest = 'destination';
            source_dest_title = 'Destination';
        }
        let row = rules_table_body.append('div').attr('class', 'tr');
        let cell = row.append('div').attr('class', 'td')
            .attr("id", "rule_" + rule_num);
        let rule_table = cell.append('div').attr('class', 'table okit-table okit-properties-table')
            .attr("id", access_type + "_rule_table_" + rule_num);
        // First Row with Delete Button
        let rule_cell = row.append('div').attr('class', 'td');
        rule_cell.append('button')
            .attr("type", "button")
            .attr("class", "okit-delete-button")
            .text("X")
            .on('click', function() {
                if (access_type === 'egress') {
                    me.deleteEgressRule(rule_num - 1);
                    me.loadEgressRules();
                } else {
                    me.deleteIngressRule(rule_num - 1);
                    me.loadIngressRules();
                }
                displayOkitJson();
            });
        // Destination / Source Type
        let rule_row = rule_table.append('div').attr('class', 'tr');
        rule_row.append('div').attr('class', 'td')
            .text(source_dest_title + " Type");
        rule_cell = rule_row.append('div').attr('class', 'td');
        let type_select = rule_cell.append('select')
            .attr("class", "property-value")
            .attr("id", source_dest + "_type" + rule_num + access_type)
            .on("change", function() {
                access_rule[source_dest + '_type'] = this.options[this.selectedIndex].value;
                displayOkitJson();
            });
        type_select.append('option')
            .attr("value", 'CIDR_BLOCK')
            .text('CIDR');
        type_select.append('option')
            .attr("value", 'SERVICE_CIDR_BLOCK')
            .text('Service');
        type_select.node().value = access_rule[source_dest + '_type'];
        // Stateful
        rule_row = rule_table.append('div').attr('class', 'tr');
        rule_row.append('div').attr('class', 'td');
        rule_cell = rule_row.append('div').attr('class', 'td');
        rule_cell.append('input')
            .attr("type", "checkbox")
            .attr("id", "is_stateless" + rule_num + access_type)
            .attr("name", "is_stateless")
            .on("change", function() {
                access_rule['is_stateless'] = this.checked;
                displayOkitJson();
            });
        $(jqId("is_stateless" + rule_num + access_type)).prop('checked', access_rule.is_stateless);
        rule_cell.append('label')
            .attr('for', "is_stateless" + rule_num + access_type)
            .attr("class", "property-value")
            .text('Stateless');
        // Destination / Source
        rule_row = rule_table.append('div').attr('class', 'tr');
        rule_row.append('div').attr('class', 'td')
            .text(source_dest_title);
        rule_cell = rule_row.append('div').attr('class', 'td');
        rule_cell.append('input')
            .attr("type", "text")
            .attr("class", "property-value")
            .attr("id", source_dest + rule_num + access_type)
            .attr("name", source_dest)
            .attr("value", access_rule[source_dest])
            .on("change", function() {
                access_rule[source_dest] = this.value;
                displayOkitJson();
            });
        // Add Protocol
        rule_row = rule_table.append('div').attr('class', 'tr');
        rule_row.append('div').attr('class', 'td')
            .text("Protocol");
        rule_cell = rule_row.append('div').attr('class', 'td');
        let protocol_select = rule_cell.append('select')
            .attr("class", "property-value")
            .attr("id", "protocol" + rule_num + access_type)
            .on("change", function() {
                access_rule['protocol'] = this.options[this.selectedIndex].value;
                // Hide
                // IMCP
                $(jqId('imcp_code_' + rule_num + access_type)).addClass('collapsed');
                $(jqId('imcp_type_' + rule_num + access_type)).addClass('collapsed');
                // TCP
                $(jqId('tcp_source_port_' + rule_num + access_type)).addClass('collapsed');
                $(jqId('tcp_destination_port_' + rule_num + access_type)).addClass('collapsed');
                // UDP
                $(jqId('udp_source_port_' + rule_num + access_type)).addClass('collapsed');
                $(jqId('udp_destination_port_' + rule_num + access_type)).addClass('collapsed');
                // Show
                if (access_rule.protocol == '1') {
                    // IMCP
                    $(jqId('imcp_code_' + rule_num + access_type)).removeClass('collapsed');
                    $(jqId('imcp_type_' + rule_num + access_type)).removeClass('collapsed');
                } else if (access_rule.protocol == '6') {
                    // TCP
                    $(jqId('tcp_source_port_' + rule_num + access_type)).removeClass('collapsed');
                    $(jqId('tcp_destination_port_' + rule_num + access_type)).removeClass('collapsed');
                } else if (access_rule.protocol == '17') {
                    // UDP
                    $(jqId('udp_source_port_' + rule_num + access_type)).removeClass('collapsed');
                    $(jqId('udp_destination_port_' + rule_num + access_type)).removeClass('collapsed');
                }
                displayOkitJson();
            });
        // Add Protocol Options
        let protocols = {
            'All': 'all',
            'ICMP': '1',
            'TCP': '6',
            'UDP': '17'
        };
        for (let key in protocols) {
            if (protocols.hasOwnProperty(key)) {
                let opt = protocol_select.append('option')
                    .attr("value", protocols[key])
                    .text(key);
                if (access_rule['protocol'] == protocols[key]) {
                    opt.attr("selected", "selected");
                }
            }
        }
        if (access_rule['protocol'] == '') {
            access_rule['protocol'] = protocol_select.node().options[protocol_select.node().selectedIndex].value;
        }
        // TCP Options
        this.addPortRangeHtml('tcp', access_rule, rule_num, access_type, rule_table);
        // UDP Options
        this.addPortRangeHtml('udp', access_rule, rule_num, access_type, rule_table);
        // IMCP Options
        this.addImcpHtml(access_rule, rule_num, access_type, rule_table);
        // Description
        rule_row = rule_table.append('div').attr('class', 'tr');
        rule_row.append('div').attr('class', 'td')
            .text("Description");
        rule_cell = rule_row.append('div').attr('class', 'td');
        rule_cell.append('input')
            .attr("type", "text")
            .attr("class", "property-value")
            .attr("id", "description" + rule_num + access_type)
            .attr("name", "description")
            .attr("value", access_rule['description'])
            .on("change", function() {
                access_rule['description'] = this.value;
                displayOkitJson();
            });
        // Show Appropriate Protocol rows
        if (access_rule.protocol == '1') {
            // IMCP
            $(jqId('imcp_code_' + rule_num + access_type)).removeClass('collapsed');
            $(jqId('imcp_type_' + rule_num + access_type)).removeClass('collapsed');
        } else if (access_rule.protocol == '6') {
            // TCP
            $(jqId('tcp_source_port_' + rule_num + access_type)).removeClass('collapsed');
            $(jqId('tcp_destination_port_' + rule_num + access_type)).removeClass('collapsed');
        } else if (access_rule.protocol == '17') {
            // UDP
            $(jqId('udp_source_port_' + rule_num + access_type)).removeClass('collapsed');
            $(jqId('udp_destination_port_' + rule_num + access_type)).removeClass('collapsed');
        }
    }

    addPortRangeHtml(type, access_rule, rule_num, access_type, rule_table) {
        let options = type + '_options';
        // Check if values are null and if so define empty
        if (access_rule[options] == null) {
            access_rule[options] = {source_port_range: {min: '', max: ''}, destination_port_range: {min: '', max: ''}};
        } else {
            if (access_rule[options].source_port_range == null) {
                access_rule[options].source_port_range = {min: '', max: ''};
            }
            if (access_rule[options].destination_port_range == null) {
                access_rule[options].destination_port_range = {min: '', max: ''};
            }
        }
        // Source Port
        let rule_row = rule_table.append('div')
            .attr('class', 'tr collapsed')
            .attr('id', type + '_source_port_' + rule_num + access_type);
        rule_row.append('div').attr('class', 'td')
            .text("Source Port Range");
        let rule_cell = rule_row.append('div').attr('class', 'td property-min-max-range');
        let cell_div = rule_cell.append('div').attr('class', 'tr');
        cell_div.append('div').attr('class', 'td').append('label').text('Min:');
        cell_div.append('div').attr('class', 'td').append('input')
            .attr("type", "text")
            .attr("class", "property-value property-min-max")
            .attr("id", type + '_source_port_min_' + rule_num + access_type)
            .attr("name", "source_port_min")
            .attr("value", access_rule[options].source_port_range.min)
            .on("change", function() {
                access_rule[options].source_port_range.min = this.value;
                displayOkitJson();
            });
        cell_div.append('div').attr('class', 'td').append('label').text('Max:');
        cell_div.append('div').attr('class', 'td').append('input')
            .attr("type", "text")
            .attr("class", "property-value property-min-max")
            .attr("id", type + '_source_port_max_' + rule_num + access_type)
            .attr("name", "source_port_max")
            .attr("value", access_rule[options].source_port_range.max)
            .on("change", function() {
                access_rule[options].source_port_range.max = this.value;
                displayOkitJson();
            });
        // Destination Port
        rule_row = rule_table.append('div')
            .attr('class', 'tr collapsed')
            .attr('id', type + '_destination_port_' + rule_num + access_type);
        rule_row.append('div').attr('class', 'td')
            .text("Destination Port Range");
        rule_cell = rule_row.append('div').attr('class', 'td property-min-max-range');
        cell_div = rule_cell.append('div').attr('class', 'tr');
        cell_div.append('div').attr('class', 'td').append('label').text('Min:');
        cell_div.append('div').attr('class', 'td').append('input')
            .attr("type", "text")
            .attr("class", "property-value property-min-max")
            .attr("id", type + '_destination_port_min_' + rule_num + access_type)
            .attr("name", "destination_port_min")
            .attr("value", access_rule[options].destination_port_range.min)
            .on("change", function() {
                access_rule[options].destination_port_range.min = this.value;
                displayOkitJson();
            });
        cell_div.append('div').attr('class', 'td').append('label').text('Max:');
        cell_div.append('div').attr('class', 'td').append('input')
            .attr("type", "text")
            .attr("class", "property-value property-min-max")
            .attr("id", type + '_destination_port_max_' + rule_num + access_type)
            .attr("name", "destination_port_max")
            .attr("value", access_rule[options].destination_port_range.max)
            .on("change", function() {
                access_rule[options].destination_port_range.max = this.value;
                displayOkitJson();
            });
    }

    addImcpHtml(access_rule, rule_num, access_type, rule_table) {
        // Check if values are null and if so define empty
        if (access_rule.icmp_options == null) {
            access_rule.icmp_options = {code: '', type: ''};
        }
        // Type
        let rule_row = rule_table.append('div')
            .attr('class', 'tr collapsed')
            .attr('id', 'imcp_type_' + rule_num + access_type);
        rule_row.append('div').attr('class', 'td')
            .text('Type');
        let rule_cell = rule_row.append('div').attr('class', 'td');
        let type_select = rule_cell.append('select')
            .attr("class", "property-value")
            .attr("id", "type" + rule_num + access_type)
            .on("change", function() {
                access_rule.icmp_options.type = this.options[this.selectedIndex].value;
                displayOkitJson();
            });
        type_select.append('option')
            .attr("value", '')
            .text('');
        for (let i=0; i<17; i++) {
            type_select.append('option')
                .attr("value", i)
                .text(i);
        }
        type_select.node().value = access_rule.icmp_options.type;
        // Code
        rule_row = rule_table.append('div')
            .attr('class', 'tr collapsed')
            .attr('id', 'imcp_code_' + rule_num + access_type);
        rule_row.append('div').attr('class', 'td')
            .text('Code');
        rule_cell = rule_row.append('div').attr('class', 'td');
        let code_select = rule_cell.append('select')
            .attr("class", "property-value")
            .attr("id", "code" + rule_num + access_type)
            .on("change", function() {
                access_rule.icmp_options.code = this.options[this.selectedIndex].value;
                displayOkitJson();
            });
        code_select.append('option')
            .attr("value", '')
            .text('');
        for (let i=0; i<255; i++) {
            code_select.append('option')
                .attr("value", i)
                .text(i);
        }
        code_select.node().value = access_rule.icmp_options.code;
    }

    /*
    ** Load and display Value Proposition
     */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/security_list.html");
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return SecurityList.getArtifactReference();
    }

    static getDropTargets() {
        return [VirtualCloudNetwork.getArtifactReference(), Subnet.getArtifactReference()];
    }

}