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
            for (let subnet of this.getOkitJson().getSubnets()) {
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
            target_type: "internet_gateway",
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
        const self = this;
        let me = this;
        let vcn_id = '';
        if (this.parent.getArtifactReference() === VirtualCloudNetwork.getArtifactReference()) {
            vcn_id = this.parent_id;
        } else {
            // Must be a child of the Virtual Cloud Network
            vcn_id = this.parent.parent_id;
        }

        const loadNetworkEntityIds = (rule_num, target_type) => {
            const select = $(`#network_entity_id${rule_num}`)
            select.empty();
            const getListFunction = self.getArrayFunction(target_type.split('_').join(' '))
            console.info('getListFunction', getListFunction)
            const gateways = self.getJsonView()[getListFunction]().filter((g) => g.vcn_id === vcn_id)
            let gateway_id = ''
            gateways.forEach((gateway) => {
                gateway_id = gateway.id
                let text = gateway.display_name
                if (target_type === 'drg_attachment') {
                    const drg = self.getJsonView().getDrg(gateway.drg_id)
                    gateway_id = drg.id
                    text = drg.display_name
                }
                select.append($('<option>').attr('value', gateway_id).text(text));
            })
            // return gateways.length ? gateways[0].id : ''
            return gateway_id
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
        // const target_types_map = new Map([
        //     ['Internet Gateway', 'internet_gateways'],
        //     ['NAT Gateway', 'nat_gateways'],
        //     ['Local Peering Gateway', 'local_peering_gateways'],
        //     ['Dynamic Routing Gateway', 'drgs'],
        //     // ['Dynamic Routing Gateway', 'dynamic_routing_gateways'], // Needed when PCA is available
        //     ['Private IP', 'private_ips'],
        //     ['Service Gateway', 'service_gateways'],
        // ]);
        const target_types_map = new Map([
            ['Internet Gateway', 'internet_gateway'],
            ['NAT Gateway', 'nat_gateway'],
            ['Local Peering Gateway', 'local_peering_gateway'],
            ['Dynamic Routing Gateway', 'drg_attachment'],
            // ['Dynamic Routing Gateway', 'dynamic_routing_gateways'], // Needed when PCA is available
            ['Private IP', 'private_ip'],
            ['Service Gateway', 'service_gateway'],
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
                if (target_type !== 'private_ip') {
                    $(jqId("destination_type_row" + rule_num)).addClass('collapsed');
                    if (target_type !== 'service_gateway') {
                        $(jqId("destination_type" + rule_num)).val('CIDR_BLOCK');
                        route_rule['destination_type'] = 'CIDR_BLOCK';
                        $(jqId("destination_row" + rule_num)).removeClass('collapsed');
                    } else {
                        $(jqId("destination_type" + rule_num)).val('SERVICE_CIDR_BLOCK');
                        route_rule['destination_type'] = 'SERVICE_CIDR_BLOCK';
                        $(jqId("destination_row" + rule_num)).addClass('collapsed');
                    }
                    // $(jqId("network_entity_id" + rule_num)).empty();
                    // const getListFunction = self.getArrayFunction(target_type.split('_').join(' '))
                    // console.info('getListFunction', getListFunction)
                    // self.getJsonView()[getListFunction]().forEach((gateway) => {
                    //     let value = gateway.id
                    //     let text = gateway.display_name
                    //     if (target_type === 'drg_attachment') {
                    //         const drg = self.getJsonView().getDrg(gateway.drg_id)
                    //         value = drg.id
                    //         text = drg.display_name
                    //     }
                    //     $(jqId("network_entity_id" + rule_num)).append($('<option>').attr('value', value).text(text));
                    // })

                    // Load and assign first in list
                    route_rule.network_entity_id = loadNetworkEntityIds(rule_num, target_type) 

                    // if (me.getOkitJson()[target_type]) {
                    //     for (let gateway of me.getOkitJson()[target_type]) {
                    //         if (gateway.vcn_id === vcn_id) {
                    //             $(jqId("network_entity_id" + rule_num)).append($('<option>').attr('value', gateway.id).text(gateway.display_name));
                    //             if (route_rule.network_entity_id === '') {
                    //                 // No Network Entity Specified will assume the first of "Target Type"
                    //                 route_rule.network_entity_id = gateway.id;
                    //             }
                    //         }
                    //     }
                    //     $(jqId("network_entity_id" + rule_num)).val(route_rule.network_entity_id);
                    // }
                    if (route_rule.target_type === 'service_gateway' && route_rule.network_entity_id !== '') {
                        const sg = self.getOkitJson().getServiceGateway(route_rule.network_entity_id)
                        route_rule.destination = sg ? sg.service_name : ''
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
            route_rule.target_type = 'internet_gateway';
        }
        $(jqId("target_type" + rule_num)).val(route_rule.target_type);
        if (route_rule.target_type === 'service_gateway') {
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
                if (route_rule.target_type === 'service_gateway') {
                    route_rule.destination = me.getOkitJson().getServiceGateway(route_rule.network_entity_id).service_name;
                }
                displayOkitJson();
            });
        let target_type = $(jqId("target_type" + rule_num)).val();
        // $(jqId("network_entity_id" + rule_num)).empty();
        // // ================================== Need to update
        // if (this.getOkitJson()[target_type]) {
        //     for (let gateway of this.getOkitJson()[target_type]) {
        //         if (gateway.vcn_id === vcn_id) {
        //             $(jqId("network_entity_id" + rule_num)).append($('<option>').attr('value', gateway.id).text(gateway.display_name));
        //             if (route_rule.network_entity_id === '') {
        //                 // No Network Entity Specified will assume the first of "Target Type"
        //                 route_rule.network_entity_id = gateway.id;
        //             }
        //         }
        //     }
        //     $(jqId("network_entity_id" + rule_num)).val(route_rule.network_entity_id);
        // }
        loadNetworkEntityIds(rule_num, target_type)
        $(`#network_entity_id${rule_num}`).val(route_rule.network_entity_id)
        console.info('Network Entity Id', $(`#network_entity_id${rule_num}`).val())
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
        if (route_rule.target_type === 'service_gateway') {
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
OkitJsonView.prototype.loadRouteTablesSelect = function(select_id, vcn_id, empty_option=false) {
    $(jqId(select_id)).empty();
    const mount_target_select = $(jqId(select_id));
    if (empty_option) {
        mount_target_select.append($('<option>').attr('value', '').text(''));
    }
    for (let mount_target of this.getRouteTables().filter((rt) => rt.vcn_id === vcn_id)) {
        mount_target_select.append($('<option>').attr('value', mount_target.id).text(mount_target.display_name));
    }
}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropRouteTableView = function(target) {
    let view_artefact = this.newRouteTable();
    if (target.type === VirtualCloudNetwork.getArtifactReference()) {
        view_artefact.getArtefact().vcn_id = target.id;
        view_artefact.getArtefact().compartment_id = target.compartment_id;
    } else if (target.type === Subnet.getArtifactReference()) {
        const subnet = this.getOkitJson().getSubnet(target.id)
        view_artefact.getArtefact().vcn_id = subnet.vcn_id;
        view_artefact.getArtefact().compartment_id = target.id;
        subnet.route_table_id = view_artefact.id;
    } else if (target.type === Compartment.getArtifactReference()) {
        view_artefact.getArtefact().compartment_id = target.id;
    }
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newRouteTable = function(routetable) {
    this.getRouteTables().push(routetable ? new RouteTableView(routetable, this) : new RouteTableView(this.okitjson.newRouteTable(), this));
    return this.getRouteTables()[this.getRouteTables().length - 1];
}
OkitJsonView.prototype.getRouteTables = function() {
    if (!this.route_tables) this.route_tables = []
    return this.route_tables;
}
OkitJsonView.prototype.getRouteTable = function(id='') {
    for (let artefact of this.getRouteTables()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadRouteTables = function(route_tables) {
    for (const artefact of route_tables) {
        this.getRouteTables().push(new RouteTableView(new RouteTable(artefact, this.okitjson), this));
    }
}
