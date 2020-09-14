/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Designer NetworkSecurityGroup View Javascript');

/*
** Define NetworkSecurityGroup View Artifact Class
 */
class NetworkSecurityGroupView extends OkitDesignerArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
    }

    get parent_id() {return this.attached_id ? this.attached_id : this.artefact.vcn_id;}

    getParent() {
        return this.getJsonView().getVirtualCloudNetwork(this.parent_id);
    }

    getParentId() {
        return this.parent_id;
    }

    /*
     ** SVG Processing
     */
    draw() {
        console.log('Drawing ' + this.getArtifactReference() + ' : ' + this.id + ' [' + this.parent_id + ']');
        console.info(`Hide Attached : ${okitSettings.hide_attached}.`)
        console.info(`Is Attached   : ${this.attached}.`)
        if (!okitSettings.hide_attached || !this.attached) {
            console.info(`${this.display_name} is either not attached and we are displaying attached`);
            let svg = super.draw();
        }
        console.log();
    }

    // Return Artifact Specific Definition.
    getSvgDefinition() {
        let definition = this.newSVGDefinition(this, this.getArtifactReference());
        if (this.getParent()) {
            let first_child = this.getParent().getChildOffset(this.getArtifactReference());
            definition['svg']['x'] = first_child.dx;
            definition['svg']['y'] = first_child.dy;
            definition['svg']['width'] = this.dimensions['width'];
            definition['svg']['height'] = this.dimensions['height'];
            definition['rect']['stroke']['colour'] = stroke_colours.bark;
            definition['rect']['stroke']['dash'] = 1;
        }
        return definition;
    }

    /*
    ** Property Sheet Load function
     */
    loadProperties() {
        let okitJson = this.getOkitJson();
        let me = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/network_security_group.html", () => {
            // Load Referenced Ids
            // Load Properties
            loadPropertiesSheet(me.artefact);
            // Egress Rules
            me.loadSecurityRules();
            // Add Handler to Add Button
            $(jqId('add_security_rule')).on('click', () => {me.addSecurityRule();});
        });
    }

    loadSecurityRules() {
        // Empty Existing Rules
        $(jqId('security_rules_table_body')).empty();
        // Egress Rules
        let rule_num = 1;
        for (let security_rule of this.security_rules) {
            this.addSecurityRuleHtml(security_rule, rule_num);
            rule_num += 1;
        }
    }

    addSecurityRule() {
        let new_rule = {direction: "INGRESS", protocol: "all", is_stateless: false, description: "",
            source_type: "CIDR_BLOCK", source: "0.0.0.0/0",
            destination_type: "CIDR_BLOCK", destination: "0.0.0.0/0"};
        this.security_rules.push(new_rule);
        this.loadSecurityRules();
        displayOkitJson();
    }

    deleteSecurityRule(rule_num) {
        this.security_rules.splice(rule_num, 1);
        this.loadSecurityRules();
        displayOkitJson();
    }

    addSecurityRuleHtml(access_rule, rule_num) {
        let me = this;
        // Default to ingress rules
        let rules_table_body = d3.select('#security_rules_table_body');
        let row = rules_table_body.append('div').attr('class', 'tr');
        let cell = row.append('div').attr('class', 'td')
            .attr("id", "rule_" + rule_num);
        let rule_table = cell.append('div').attr('class', 'table okit-table okit-properties-table')
            .attr("id", "rule_table_" + rule_num);
        // First Row with Delete Button
        let rule_cell = row.append('div').attr('class', 'td');
        rule_cell.append('button')
            .attr("type", "button")
            .attr("class", "okit-delete-button")
            .text("X")
            .on('click', function() {
                me.deleteSecurityRule(rule_num - 1);
                me.loadSecurityRules();
                displayOkitJson();
            });
        // Direction
        let rule_row = rule_table.append('div').attr('class', 'tr');
        rule_row.append('div').attr('class', 'td')
            .text("Direction");
        rule_cell = rule_row.append('div').attr('class', 'td');
        let select = rule_cell.append('select')
            .attr("class", "property-value")
            .attr("id", "direction" + rule_num)
            .on("change", function() {
                access_rule.direction = this.options[this.selectedIndex].value;
                $(jqId('source_type_tr' + rule_num)).addClass('collapsed');
                $(jqId('source_tr' + rule_num)).addClass('collapsed');
                $(jqId('destination_type_tr' + rule_num)).addClass('collapsed');
                $(jqId('destination_tr' + rule_num)).addClass('collapsed');
                if (access_rule.direction === 'INGRESS') {
                    $(jqId('source_type_tr' + rule_num)).removeClass('collapsed');
                    $(jqId('source_tr' + rule_num)).removeClass('collapsed');
                } else {
                    $(jqId('destination_type_tr' + rule_num)).removeClass('collapsed');
                    $(jqId('destination_tr' + rule_num)).removeClass('collapsed');
                }
                displayOkitJson();
            });
        select.append('option')
            .attr("value", 'INGRESS')
            .text('Ingress');
        select.append('option')
            .attr("value", 'EGRESS')
            .text('Egress');
        select.node().value = access_rule.direction;
        // Stateful
        rule_row = rule_table.append('div').attr('class', 'tr');
        rule_row.append('div').attr('class', 'td');
        rule_cell = rule_row.append('div').attr('class', 'td');
        rule_cell.append('input')
            .attr("type", "checkbox")
            .attr("id", "is_stateless" + rule_num)
            .attr("name", "is_stateless")
            .on("change", function() {
                access_rule.is_stateless = this.checked;
                console.info('Changed is_stateless: ' + this.checked);
                displayOkitJson();
            });
        $(jqId("is_stateless" + rule_num)).prop('checked', access_rule.is_stateless);
        rule_cell.append('label')
            .attr('for', "is_stateless" + rule_num)
            .attr("class", "property-value")
            .text('Stateless');

        // Source Type
        rule_row = rule_table.append('div')
            .attr('class', 'tr collapsed')
            .attr("id", 'source_type_tr' + rule_num);
        rule_row.append('div').attr('class', 'td')
            .text("Source Type");
        rule_cell = rule_row.append('div').attr('class', 'td');
        select = rule_cell.append('select')
            .attr("class", "property-value")
            .attr("id", "source_type" + rule_num)
            .on("change", function() {
                access_rule.source_type = this.options[this.selectedIndex].value;
                displayOkitJson();
            });
        select.append('option')
            .attr("value", 'CIDR_BLOCK')
            .text('CIDR');
        select.append('option')
            .attr("value", 'SERVICE_CIDR_BLOCK')
            .text('Service');
        select.node().value = access_rule.source_type;
        // Source
        rule_row = rule_table.append('div')
            .attr('class', 'tr collapsed')
            .attr("id", 'source_tr' + rule_num);
        rule_row.append('div').attr('class', 'td')
            .text('Source');
        rule_cell = rule_row.append('div').attr('class', 'td');
        rule_cell.append('input')
            .attr("type", "text")
            .attr("class", "property-value")
            .attr("id", 'source' + rule_num)
            .attr("name", 'source' + rule_num)
            .attr("value", access_rule.source)
            .on("change", function() {
                access_rule.source = this.value;
                console.info('Changed destination: ' + this.value);
                displayOkitJson();
            });

        // Destination Type
        rule_row = rule_table.append('div')
            .attr('class', 'tr collapsed')
            .attr("id", 'destination_type_tr' + rule_num);
        rule_row.append('div').attr('class', 'td')
            .text("Destination Type");
        rule_cell = rule_row.append('div').attr('class', 'td');
        select = rule_cell.append('select')
            .attr("class", "property-value")
            .attr("id", "destination_type" + rule_num)
            .on("change", function() {
                access_rule.destination_type = this.options[this.selectedIndex].value;
                displayOkitJson();
            });
        select.append('option')
            .attr("value", 'CIDR_BLOCK')
            .text('CIDR');
        select.append('option')
            .attr("value", 'SERVICE_CIDR_BLOCK')
            .text('Service');
        select.node().value = access_rule.destination_type;
        // Destination
        rule_row = rule_table.append('div')
            .attr('class', 'tr collapsed')
            .attr("id", 'destination_tr' + rule_num);
        rule_row.append('div').attr('class', 'td')
            .text('Destination');
        rule_cell = rule_row.append('div').attr('class', 'td');
        rule_cell.append('input')
            .attr("type", "text")
            .attr("class", "property-value")
            .attr("id", 'destination' + rule_num)
            .attr("name", 'destination' + rule_num)
            .attr("value", access_rule.destination)
            .on("change", function() {
                access_rule.destination = this.value;
                console.info('Changed destination: ' + this.value);
                displayOkitJson();
            });

        // Add Protocol
        rule_row = rule_table.append('div').attr('class', 'tr');
        rule_row.append('div').attr('class', 'td')
            .text("Protocol");
        rule_cell = rule_row.append('div').attr('class', 'td');
        let protocol_select = rule_cell.append('select')
            .attr("class", "property-value")
            .attr("id", "protocol" + rule_num)
            .on("change", function() {
                access_rule['protocol'] = this.options[this.selectedIndex].value;
                console.info('Changed network_entity_id ' + this.selectedIndex);
                // Hide
                // IMCP
                $(jqId('imcp_code_' + rule_num)).addClass('collapsed');
                $(jqId('imcp_type_' + rule_num)).addClass('collapsed');
                // TCP
                $(jqId('tcp_source_port_' + rule_num)).addClass('collapsed');
                $(jqId('tcp_destination_port_' + rule_num)).addClass('collapsed');
                // UDP
                $(jqId('udp_source_port_' + rule_num)).addClass('collapsed');
                $(jqId('udp_destination_port_' + rule_num)).addClass('collapsed');
                // Show
                if (access_rule.protocol == '1') {
                    // IMCP
                    $(jqId('imcp_code_' + rule_num)).removeClass('collapsed');
                    $(jqId('imcp_type_' + rule_num)).removeClass('collapsed');
                } else if (access_rule.protocol == '6') {
                    // TCP
                    $(jqId('tcp_source_port_' + rule_num)).removeClass('collapsed');
                    $(jqId('tcp_destination_port_' + rule_num)).removeClass('collapsed');
                } else if (access_rule.protocol == '17') {
                    // UDP
                    $(jqId('udp_source_port_' + rule_num)).removeClass('collapsed');
                    $(jqId('udp_destination_port_' + rule_num)).removeClass('collapsed');
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
        this.addPortRangeHtml('tcp', access_rule, rule_num, rule_table);
        // UDP Options
        this.addPortRangeHtml('udp', access_rule, rule_num, rule_table);
        // IMCP Options
        this.addImcpHtml(access_rule, rule_num, rule_table);
        // Description
        rule_row = rule_table.append('div').attr('class', 'tr');
        rule_row.append('div').attr('class', 'td')
            .text("Description");
        rule_cell = rule_row.append('div').attr('class', 'td');
        rule_cell.append('input')
            .attr("type", "text")
            .attr("class", "property-value")
            .attr("id", "description" + rule_num)
            .attr("name", "description")
            .attr("value", access_rule['description'])
            .on("change", function() {
                access_rule['description'] = this.value;
                console.info('Changed description: ' + this.value);
                displayOkitJson();
            });
        // Show Appropriate Source/Destination Rows
        if (access_rule.direction === 'INGRESS') {
            $(jqId('source_type_tr' + rule_num)).removeClass('collapsed');
            $(jqId('source_tr' + rule_num)).removeClass('collapsed');
        } else {
            $(jqId('destination_type_tr' + rule_num)).removeClass('collapsed');
            $(jqId('destination_tr' + rule_num)).removeClass('collapsed');
        }
        // Show Appropriate Protocol rows
        if (access_rule.protocol == '1') {
            // IMCP
            $(jqId('imcp_code_' + rule_num)).removeClass('collapsed');
            $(jqId('imcp_type_' + rule_num)).removeClass('collapsed');
        } else if (access_rule.protocol == '6') {
            // TCP
            $(jqId('tcp_source_port_' + rule_num)).removeClass('collapsed');
            $(jqId('tcp_destination_port_' + rule_num)).removeClass('collapsed');
        } else if (access_rule.protocol == '17') {
            // UDP
            $(jqId('udp_source_port_' + rule_num)).removeClass('collapsed');
            $(jqId('udp_destination_port_' + rule_num)).removeClass('collapsed');
        }
    }

    addPortRangeHtml(type, access_rule, rule_num, rule_table) {
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
            .attr('id', type + '_source_port_' + rule_num);
        rule_row.append('div').attr('class', 'td')
            .text("Source Port Range");
        let rule_cell = rule_row.append('div').attr('class', 'td property-min-max-range');
        let cell_div = rule_cell.append('div');
        cell_div.append('label').text('Min:');
        cell_div.append('input')
            .attr("type", "text")
            .attr("class", "property-value property-min-max")
            .attr("id", type + '_source_port_min_' + rule_num)
            .attr("name", "source_port_min")
            .attr("value", access_rule[options].source_port_range.min)
            .on("change", function() {
                access_rule[options].source_port_range.min = this.value;
                console.info('Changed min source port: ' + this.value);
                displayOkitJson();
            });
        cell_div = rule_cell.append('div');
        cell_div.append('label').text('Max:');
        cell_div.append('input')
            .attr("type", "text")
            .attr("class", "property-value property-min-max")
            .attr("id", type + '_source_port_max_' + rule_num)
            .attr("name", "source_port_max")
            .attr("value", access_rule[options].source_port_range.max)
            .on("change", function() {
                access_rule[options].source_port_range.max = this.value;
                console.info('Changed max source port: ' + this.value);
                displayOkitJson();
            });
        // Destination Port
        rule_row = rule_table.append('div')
            .attr('class', 'tr collapsed')
            .attr('id', type + '_destination_port_' + rule_num);
        rule_row.append('div').attr('class', 'td')
            .text("Destination Port Range");
        rule_cell = rule_row.append('div').attr('class', 'td property-min-max-range');
        cell_div = rule_cell.append('div');
        cell_div.append('label').text('Min:');
        cell_div.append('input')
            .attr("type", "text")
            .attr("class", "property-value property-min-max")
            .attr("id", type + '_destination_port_min_' + rule_num)
            .attr("name", "destination_port_min")
            .attr("value", access_rule[options].destination_port_range.min)
            .on("change", function() {
                access_rule[options].destination_port_range.min = this.value;
                console.info('Changed min destination port: ' + this.value);
                displayOkitJson();
            });
        cell_div = rule_cell.append('div');
        cell_div.append('label').text('Max:');
        cell_div.append('input')
            .attr("type", "text")
            .attr("class", "property-value property-min-max")
            .attr("id", type + '_destination_port_max_' + rule_num)
            .attr("name", "destination_port_max")
            .attr("value", access_rule[options].destination_port_range.max)
            .on("change", function() {
                access_rule[options].destination_port_range.max = this.value;
                console.info('Changed max destination port: ' + this.value);
                displayOkitJson();
            });
    }

    addImcpHtml(access_rule, rule_num, rule_table) {
        // Check if values are null and if so define empty
        if (access_rule.icmp_options == null) {
            access_rule.icmp_options = {code: '', type: ''};
        }
        // Code
        let rule_row = rule_table.append('div')
            .attr('class', 'tr collapsed')
            .attr('id', 'imcp_code_' + rule_num);
        rule_row.append('div').attr('class', 'td')
            .text('Code');
        let rule_cell = rule_row.append('div').attr('class', 'td');
        let code_select = rule_cell.append('select')
            .attr("class", "property-value")
            .attr("id", "code" + rule_num)
            .on("change", function() {
                access_rule.icmp_options.code = this.options[this.selectedIndex].value;
                console.info('Changed IMCP Code ' + this.selectedIndex);
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
        // Type
        rule_row = rule_table.append('div')
            .attr('class', 'tr collapsed')
            .attr('id', 'imcp_type_' + rule_num);
        rule_row.append('div').attr('class', 'td')
            .text('Type');
        rule_cell = rule_row.append('div').attr('class', 'td');
        let type_select = rule_cell.append('select')
            .attr("class", "property-value")
            .attr("id", "type" + rule_num)
            .on("change", function() {
                access_rule.icmp_options.type = this.options[this.selectedIndex].value;
                console.info('Changed IMCP Type ' + this.selectedIndex);
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
    }

    /*
    ** Load and display Value Proposition
     */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/network_security_group.html");
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return NetworkSecurityGroup.getArtifactReference();
    }

    static getDropTargets() {
        return [VirtualCloudNetwork.getArtifactReference()];
    }

}