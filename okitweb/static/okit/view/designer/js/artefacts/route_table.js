/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Designer RouteTable View Javascript');

/*
** Define RouteTable View Artifact Class
 */
class RouteTableView extends OkitDesignerArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
    }

    get attached() {
        if (!this.attached_id) {
            for (let subnet of this.getOkitJson().subnets) {
                if (subnet.route_table_id === this.id) {
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
        let okitJson = this.getOkitJson();
        let me = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/route_table.html", () => {
            // Load Referenced Ids
            // Load Properties
            loadPropertiesSheet(me.artefact);
            // Route Rules
            me.loadRouteRules();
            // Add Handler to Add Button
            $(jqId('add_route_rule')).on('click', () => {me.addRouteRule();});
        });
    }

    loadRouteRules() {
        // Empty Existing Rules
        $(jqId('route_rules_table_body')).empty();
        // Route Rules
        let rule_num = 1;
        for (let route_rule of this.route_rules) {
            this.addRouteRuleHtml(route_rule, rule_num);
            rule_num += 1;
        }
    }

    addRouteRule() {
        let new_rule = {
            target_type: "internet_gateways",
            destination_type: "CIDR_BLOCK",
            destination: "0.0.0.0/0",
            network_entity_id: "",
            description: ""
        };
        this.route_rules.push(new_rule);
        this.loadRouteRules();
        displayOkitJson();
    }

    deleteRouteRule(rule_num) {
        this.route_rules.splice(rule_num, 1);
        this.loadRouteRules();
        displayOkitJson();
    }

    addRouteRuleHtml(route_rule, rule_num=1) {
        let me = this;
        let vcn_id = '';
        if (this.parent.getArtifactReference() === VirtualCloudNetwork.getArtifactReference()) {
            vcn_id = this.parent_id;
        } else {
            // Must be a child of the Virtual Cloud Network
            vcn_id = this.parent.parent_id;
        }

        let rules_table_body = d3.select('#route_rules_table_body');
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
                me.deleteRouteRule(rule_num - 1);
                me.loadRouteRules();
                displayOkitJson();
            });

        // Target Type
        const target_types_map = new Map([
            ['Internet Gateway', 'internet_gateways'],
            ['NAT Gateway', 'nat_gateways'],
            ['Local Peering Gateway', 'local_peering_gateways'],
            ['Dynamic Routing Gateway', 'dynamic_routing_gateways'],
            ['Private IP', 'private_ips'],
            ['Service Gateway', 'service_gateways'],
        ]);
        let rule_row = rule_table.append('div').attr('class', 'tr');
        rule_row.append('div').attr('class', 'td')
            .text("Target Type");
        let target_type_select = rule_row.append('div').attr('class', 'td').append('select')
            .attr("class", "property-value")
            .attr("id", "target_type" + rule_num)
            .on("change", function() {
                let target_type = this.options[this.selectedIndex].value;
                // Reset Network Entity
                route_rule.network_entity_id = '';
                // Get Type
                route_rule['target_type'] = target_type;
                if (target_type !== 'private_ips') {
                    $(jqId("destination_type_row" + rule_num)).addClass('collapsed');
                    if (target_type !== 'service_gateways') {
                        $(jqId("destination_type" + rule_num)).val('CIDR_BLOCK');
                        route_rule['destination_type'] = 'CIDR_BLOCK';
                        $(jqId("destination_row" + rule_num)).removeClass('collapsed');
                    } else {
                        $(jqId("destination_type" + rule_num)).val('SERVICE_CIDR_BLOCK');
                        route_rule['destination_type'] = 'SERVICE_CIDR_BLOCK';
                        $(jqId("destination_row" + rule_num)).addClass('collapsed');
                    }
                    $(jqId("network_entity_id" + rule_num)).empty();
                    if (me.getOkitJson()[target_type]) {
                        for (let gateway of me.getOkitJson()[target_type]) {
                            if (gateway.vcn_id === vcn_id) {
                                $(jqId("network_entity_id" + rule_num)).append($('<option>').attr('value', gateway.id).text(gateway.display_name));
                                if (route_rule.network_entity_id === '') {
                                    // No Network Entity Specified will assume the first of "Target Type"
                                    route_rule.network_entity_id = gateway.id;
                                }
                            }
                        }
                        $(jqId("network_entity_id" + rule_num)).val(route_rule.network_entity_id);
                    }
                    if (route_rule.target_type === 'service_gateways') {
                        route_rule.destination = me.getOkitJson().getServiceGateway(route_rule.network_entity_id).service_name;
                    }
                } else {
                    $(jqId("destination_type_row" + rule_num)).removeClass('collapsed');
                }
                displayOkitJson();
            });
        target_types_map.forEach((value, key) => {
            target_type_select.append('option')
                .attr('value', value)
                .text(key);
        });
        target_type_select.property('value', route_rule.target_type);
        if (!route_rule.target_type || route_rule.target_type === '') {
            route_rule.target_type = 'internet_gateways';
        }
        $(jqId("target_type" + rule_num)).val(route_rule.target_type);
        if (route_rule.target_type === 'service_gateways') {
            route_rule.destination = this.getOkitJson().getServiceGateway(route_rule.network_entity_id).service_name;
        }

        // Destination Type
        const destination_types_map = new Map([
            ['CIDR Block', 'CIDR_BLOCK'],
            ['Service', 'SERVICE_CIDR_BLOCK'],
        ]);
        rule_row = rule_table.append('div').attr('class', 'tr collapsed')
            .attr('id', "destination_type_row" + rule_num);
        rule_row.append('div').attr('class', 'td')
            .text("Destination Type");
        let destination_type = rule_row.append('div').attr('class', 'td').append('select')
            .attr("class", "property-value")
            .attr("id", "destination_type" + rule_num)
            .on("change", function() {
                let destination_type = this.options[this.selectedIndex].value;
                route_rule['destination_type'] = destination_type;
                displayOkitJson();
            });
        destination_types_map.forEach((value, key) => {
            destination_type.append('option')
                .attr('value', value)
                .text(key);
        });
        $(jqId("destination_type" + rule_num)).val(route_rule.destination_type);
        // Destination
        rule_row = rule_table.append('div').attr('class', 'tr').attr('id', 'destination_row' + rule_num);
        rule_row.append('div').attr('class', 'td')
            .text("Destination");
        rule_cell = rule_row.append('div').attr('class', 'td');
        rule_cell.append('input')
            .attr("type", "text")
            .attr("class", "property-value")
            .attr("id", "destination" + rule_num)
            .attr("name", "destination")
            .attr("value", route_rule['destination'])
            .on("change", function() {
                route_rule['destination'] = this.value;
                displayOkitJson();
            });

        // Network Entity
        rule_row = rule_table.append('div').attr('class', 'tr');
        rule_row.append('div').attr('class', 'td')
            .text("Network Entity");
        rule_cell = rule_row.append('div').attr('class', 'td');
        rule_cell.append('select')
            .attr("class", "property-value")
            .attr("id", "network_entity_id" + rule_num)
            .on("change", function() {
                route_rule['network_entity_id'] = this.options[this.selectedIndex].value;
                if (route_rule.target_type === 'service_gateways') {
                    route_rule.destination = me.getOkitJson().getServiceGateway(route_rule.network_entity_id).service_name;
                }
                displayOkitJson();
            });
        let target_type = $(jqId("target_type" + rule_num)).val();
        $(jqId("network_entity_id" + rule_num)).empty();
        if (this.getOkitJson()[target_type]) {
            for (let gateway of this.getOkitJson()[target_type]) {
                if (gateway.vcn_id === vcn_id) {
                    $(jqId("network_entity_id" + rule_num)).append($('<option>').attr('value', gateway.id).text(gateway.display_name));
                    if (route_rule.network_entity_id === '') {
                        // No Network Entity Specified will assume the first of "Target Type"
                        route_rule.network_entity_id = gateway.id;
                    }
                }
            }
            $(jqId("network_entity_id" + rule_num)).val(route_rule.network_entity_id);
        }
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
            .attr("value", route_rule['description'])
            .on("change", function() {
                route_rule['description'] = this.value;
                displayOkitJson();
            });
        // Check if we need to hide destination
        if (route_rule.target_type === 'service_gateways') {
            $(jqId("destination_row" + rule_num)).addClass('collapsed');
            route_rule.destination = me.getOkitJson().getServiceGateway(route_rule.network_entity_id).service_name;
        }
    }

    /*
    ** Load and display Value Proposition
     */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/route_table.html");
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return RouteTable.getArtifactReference();
    }

    static getDropTargets() {
        return [VirtualCloudNetwork.getArtifactReference(), Subnet.getArtifactReference()];
    }

}