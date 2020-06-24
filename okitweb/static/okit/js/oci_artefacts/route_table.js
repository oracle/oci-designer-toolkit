/*
** Copyright (c) 2020, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Route Table Javascript');

const route_table_query_cb = "route-table-query-cb";

/*
** Define Route Table Class
 */
class RouteTable extends OkitArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}, parent=null) {
        super(okitjson);
        this.parent_id = data.parent_id;
        // Configure default values
        this.display_name = this.generateDefaultName(okitjson.route_tables.length + 1);
        this.compartment_id = '';
        this.vcn_id = data.parent_id;
        this.route_rules = [];
        // Update with any passed data
        this.merge(data);
        this.convert();
        // Add Get Parent function
        if (parent !== null) {
            this.getParent = () => {return parent};
        }
    }


    /*
    ** Clone Functionality
     */
    clone() {
        return new RouteTable(this, this.getOkitJson());
    }


    /*
    ** Delete Processing
     */
    deleteChildren() {
        // Remove Subnet references
        for (let subnet of this.getOkitJson().subnets) {
            if (subnet.route_table_id === this.id) {
                subnet.route_table_id = '';
            }
        }
    }


    /*
     ** SVG Processing
     */
    draw() {
        console.groupCollapsed('Drawing ' + this.getArtifactReference() + ' : ' + this.id + ' [' + this.parent_id + ']');
        if (this.isAttached()) {
            console.groupEnd();
            return;
        }
        let me = this;
        let svg = super.draw();
        console.groupEnd();
    }

    // Return Artifact Specific Definition.
    getSvgDefinition() {
        console.groupCollapsed('Getting Definition of ' + this.getArtifactReference() + ' : ' + this.id);
        let definition = this.newSVGDefinition(this, this.getArtifactReference());
        let dimensions = this.getDimensions();
        let first_child = this.getParent().getChildOffset(this.getArtifactReference());
        definition['svg']['x'] = first_child.dx;
        definition['svg']['y'] = first_child.dy;
        definition['svg']['width'] = dimensions['width'];
        definition['svg']['height'] = dimensions['height'];
        definition['rect']['stroke']['colour'] = stroke_colours.bark;
        definition['rect']['stroke']['dash'] = 1;
        console.info(JSON.stringify(definition, null, 2));
        console.groupEnd();
        return definition;
    }

    // Return Artifact Dimensions
    getDimensions() {
        console.groupCollapsed('Getting Dimensions of ' + this.getArtifactReference() + ' : ' + this.id);
        let dimensions = this.getMinimumDimensions();
        // Calculate Size based on Child Artifacts
        // Check size against minimum
        dimensions.width  = Math.max(dimensions.width,  this.getMinimumDimensions().width);
        dimensions.height = Math.max(dimensions.height, this.getMinimumDimensions().height);
        console.info('Overall Dimensions       : ' + JSON.stringify(dimensions));
        console.groupEnd();
        return dimensions;
    }

    getMinimumDimensions() {
        return {width: icon_width, height:icon_height};
    }

    isAttached() {
        // Check if this is attached but exclude when parent is the attachment type.
        if (this.getParent().getArtifactReference() !== Subnet.getArtifactReference()) {
            for (let subnet of this.getOkitJson().subnets) {
                if (subnet.route_table_id === this.id) {
                    console.info(this.display_name + ' attached to subnet ' + subnet.display_name);
                    return true;
                }
            }
        }
        return false;
    }


    /*
    ** Property Sheet Load function
     */
    loadProperties() {
        let okitJson = this.getOkitJson();
        let me = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/route_table.html", () => {
            // Load Referenced Ids
            // Load Properties
            loadPropertiesSheet(me);
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
        if (this.getParent().getArtifactReference() === VirtualCloudNetwork.getArtifactReference()) {
            vcn_id = this.getParent().id;
        } else {
            // Must be a child of the Virtual Cloud Network
            vcn_id = this.getParent().getParent().id;
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
                console.info('Selected ' + target_type);
                // Reset Network Entity
                route_rule.network_entity_id = '';
                // Get Type
                route_rule['target_type'] = target_type;
                if (target_type !== 'private_ips') {
                    $(jqId("destination_type_row" + rule_num)).addClass('collapsed');
                    if (target_type !== 'service_gateways') {
                        $(jqId("destination_type" + rule_num)).val('CIDR_BLOCK');
                        route_rule['destination_type'] = 'CIDR_BLOCK';
                    } else {
                        $(jqId("destination_type" + rule_num)).val('SERVICE_CIDR_BLOCK');
                        route_rule['destination_type'] = 'SERVICE_CIDR_BLOCK';
                    }
                    console.info('Processing list ' + JSON.stringify(me.getOkitJson()[target_type]));
                    $(jqId("network_entity_id" + rule_num)).empty();
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
                console.info('Selected ' + destination_type);
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
        rule_row = rule_table.append('div').attr('class', 'tr');
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
                console.info('Changed destination: ' + this.value);
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
                console.info('Changed Network Entity: ' + this.value);
                displayOkitJson();
            });
        let target_type = $(jqId("target_type" + rule_num)).val();
        $(jqId("network_entity_id" + rule_num)).empty();
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
                console.info('Changed description: ' + this.value);
                displayOkitJson();
            });
    }



    getNamePrefix() {
        return super.getNamePrefix() + 'rt';
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return 'Route Table';
    }

    static getDropTargets() {
        return [VirtualCloudNetwork.getArtifactReference()];
    }

    static query(request = {}, region='') {
        console.info('------------- Route Table Query --------------------');
        console.info('------------- Compartment           : ' + request.compartment_id);
        console.info('------------- Virtual Cloud Network : ' + request.vcn_id);
        let me = this;
        queryCount++;
        $.ajax({
            type: 'get',
            url: 'oci/artifacts/RouteTable',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(request),
            success: function(resp) {
                let response_json = JSON.parse(resp);
                regionOkitJson[region].load({route_tables: response_json});
                for (let artifact of response_json) {
                    console.info(me.getArtifactReference() + ' Query : ' + artifact.display_name);
                }
                redrawSVGCanvas(region);
                $('#' + route_table_query_cb).prop('checked', true);
                queryCount--;
                hideQueryProgressIfComplete();
            },
            error: function(xhr, status, error) {
                console.info('Status : ' + status)
                console.info('Error : ' + error)
                $('#' + route_table_query_cb).prop('checked', true);
                queryCount--;
                hideQueryProgressIfComplete();
            }
        });
    }
}

$(document).ready(function() {
    // Setup Search Checkbox
    let body = d3.select('#query-progress-tbody');
    let row = body.append('tr');
    let cell = row.append('td');
    cell.append('input')
        .attr('type', 'checkbox')
        .attr('id', route_table_query_cb);
    cell.append('label').text(RouteTable.getArtifactReference());

    // Setup Query Display Form
    body = d3.select('#query-oci-tbody');
    row = body.append('tr');
    cell = row.append('td')
        .text(RouteTable.getArtifactReference());
    cell = row.append('td');
    let input = cell.append('input')
        .attr('type', 'text')
        .attr('class', 'query-filter')
        .attr('id', 'route_table_name_filter')
        .attr('name', 'route_table_name_filter');
});















