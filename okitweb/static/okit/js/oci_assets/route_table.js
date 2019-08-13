console.log('Loaded Route Table Javascript');

/*
** Set Valid drop Targets
 */

asset_drop_targets["Route Table"] = ["Virtual Cloud Network"];
asset_connect_targets["Route Table"] = ["Subnet"];
asset_add_functions["Route Table"] = "addRouteTable";

var route_table_ids = [];
var route_table_count = 0;
var route_table_prefix = 'rt';
var propertires_route_table = {}

/*
** Reset variables
 */

function clearRouteTableVariables() {
    route_table_ids = [];
    route_table_count = 0;
}

/*
** Add Asset to JSON Model
 */
function addRouteTable(vcnid) {
    var id = 'okit-rt-' + uuidv4();

    // Add Virtual Cloud Network to JSON

    if (!('route_tables' in OKITJsonObj['compartment'])) {
        OKITJsonObj['compartment']['route_tables'] = [];
    }

    // Add id & empty name to id JSON
    okitIdsJsonObj[id] = '';
    route_table_ids.push(id);

    // Increment Count
    route_table_count += 1;
    var route_table = {};
    route_table['vcn_id'] = vcnid;
    route_table['virtual_cloud_network'] = '';
    route_table['id'] = id;
    route_table['display_name'] = generateDefaultName(route_table_prefix, route_table_count);
    route_table['route_rules'] = []
    OKITJsonObj['compartment']['route_tables'].push(route_table);
    okitIdsJsonObj[id] = route_table['display_name'];
    //console.log(JSON.stringify(OKITJsonObj, null, 2));
    displayOkitJson();
    drawRouteTableSVG(route_table);
}

/*
** SVG Creation
 */
function drawRouteTableSVG(route_table) {
    var parent_id = route_table['vcn_id'];
    var id = route_table['id'];
    var position = vcn_element_icon_position;
    var translate_x = icon_translate_x_start + icon_width * position + vcn_icon_spacing * position;
    var translate_y = icon_translate_y_start;
    var svg_x = (icon_width / 2) + (icon_width * position) + (vcn_icon_spacing * position);
    var svg_y = (icon_height / 4) * 3;
    var data_type = "Route Table";

    // Increment Icon Position
    vcn_element_icon_position += 1;

    var parent_svg = d3.select('#' + parent_id + "-svg");
    var svg = parent_svg.append("svg")
        .attr("id", id + '-svg')
        .attr("data-type", data_type)
        .attr("data-parentid", parent_id)
        .attr("title", route_table['display_name'])
        .attr("x", svg_x)
        .attr("y", svg_y)
        .attr("width", "100")
        .attr("height", "100");
    var rect = svg.append("rect")
        .attr("id", id)
        .attr("data-type", data_type)
        .attr("data-parentid", parent_id)
        .attr("title", route_table['display_name'])
        .attr("x", icon_x)
        .attr("y", icon_y)
        .attr("width", icon_width)
        .attr("height", icon_height)
        .attr("stroke", icon_stroke_colour)
        .attr("stroke-dasharray", "1, 1")
        .attr("fill", "white")
        .attr("style", "fill-opacity: .25;");
    rect.append("title")
        .attr("data-type", data_type)
        .attr("data-parentid", parent_id)
        .text("Route Tablet: "+ route_table['display_name']);
    var g = svg.append("g")
        .attr("data-type", data_type)
        .attr("data-parentid", parent_id)
        .attr("transform", "translate(5, 5) scale(0.3, 0.3)");
    g.append("rect")
        .attr("data-type", data_type)
        .attr("data-parentid", parent_id)
        .attr("x", "99.6")
        .attr("y", "100.3")
        .attr("class", "st0")
        .attr("width", "22.1")
        .attr("height", "22.9");
    g.append("path")
        .attr("data-type", data_type)
        .attr("data-parentid", parent_id)
        .attr("class", "st0")
        .attr("d", "M188.4,123.3v-22.9h-59.6v22.9H188.4z M171.1,109.2h3.2l1.8,3.1l1.8-3.1h2.8l-3,4.6l3.1,4.8h-3.2l-1.9-3.4l-1.9,3.4H171l3.1-5L171.1,109.2z M166.1,116.1h2.3v2.5h-2.3V116.1z M153.8,109.2h3.2l1.8,3.1l1.8-3.1h2.8l-3,4.6l3.1,4.8h-3.2l-1.9-3.4l-1.9,3.4h-2.9l3.1-5L153.8,109.2z M148.8,116.1h2.3v2.5h-2.3V116.1z M139.8,109.2l1.8,3.1l1.8-3.1h2.8l-3,4.6l3.1,4.8h-3.2l-1.9-3.4l-1.9,3.4h-2.9l3.1-5l-3-4.3H139.8z")
    g.append("rect")
        .attr("data-type", data_type)
        .attr("data-parentid", parent_id)
        .attr("x", "99.6")
        .attr("y", "132.5")
        .attr("class", "st0")
        .attr("width", "22.1")
        .attr("height", "22.9");
    g.append("path")
        .attr("data-type", data_type)
        .attr("data-parentid", parent_id)
        .attr("class", "st0")
        .attr("d", "M188.4,155.5v-22.9h-59.6v22.9H188.4z M171.1,140.2h3.2l1.8,3.1l1.8-3.1h2.8l-3,4.6l3.1,4.8h-3.2l-1.9-3.4l-1.9,3.4H171l3.1-5L171.1,140.2z M166.1,147.1h2.3v2.5h-2.3V147.1z M153.8,140.2h3.2l1.8,3.1l1.8-3.1h2.8l-3,4.6l3.1,4.8h-3.2l-1.9-3.4l-1.9,3.4h-2.9l3.1-5L153.8,140.2z M148.8,147.1h2.3v2.5h-2.3V147.1z M139.8,140.2l1.8,3.1l1.8-3.1h2.8l-3,4.6l3.1,4.8h-3.2l-1.9-3.4l-1.9,3.4h-2.9l3.1-5l-3-4.3H139.8z")
    g.append("rect")
        .attr("data-type", data_type)
        .attr("data-parentid", parent_id)
        .attr("x", "99.6")
        .attr("y", "164.7")
        .attr("class", "st0")
        .attr("width", "22.1")
        .attr("height", "22.9");
    g.append("path")
        .attr("data-type", data_type)
        .attr("data-parentid", parent_id)
        .attr("class", "st0")
        .attr("d", "M188.4,187.7v-22.9h-59.6v22.9H188.4z M171.1,171.2h3.2l1.8,3.1l1.8-3.1h2.8l-3,4.6l3.1,4.8h-3.2l-1.9-3.4l-1.9,3.4H171l3.1-5L171.1,171.2z M166.1,178.1h2.3v2.5h-2.3V178.1z M153.8,171.2h3.2l1.8,3.1l1.8-3.1h2.8l-3,4.6l3.1,4.8h-3.2l-1.9-3.4l-1.9,3.4h-2.9l3.1-5L153.8,171.2z M148.8,178.1h2.3v2.5h-2.3V178.1z M139.8,171.2l1.8,3.1l1.8-3.1h2.8l-3,4.6l3.1,4.8h-3.2l-1.9-3.4l-1.9,3.4h-2.9l3.1-5l-3-4.3H139.8z")

    loadRouteTableProperties(id);
    var boundingClientRect = rect.node().getBoundingClientRect();
    // Add click event to display properties
    // Add Drag Event to allow connector (Currently done a mouse events because SVG does not have drag version)
    // Add dragevent versions
    // Set common attributes on svg element and children
    svg.on("click", function() { loadRouteTableProperties(id); })
        .on("mousedown", handleConnectorDragStart)
        .on("mousemove", handleConnectorDrag)
        .on("mouseup", handleConnectorDrop)
        .on("mouseover", handleConnectorDragEnter)
        .on("mouseout", handleConnectorDragLeave)
        .on("dragstart", handleConnectorDragStart)
        .on("drop", handleConnectorDrop)
        .on("dragenter", handleConnectorDragEnter)
        .on("dragleave", handleConnectorDragLeave)
        .attr("data-type", data_type)
        .attr("data-parentid", parent_id)
        .attr("data-connector-start-y", boundingClientRect.y + boundingClientRect.height)
        .attr("data-connector-start-x", boundingClientRect.x + (boundingClientRect.width/2))
        .attr("data-connector-end-y", boundingClientRect.y + boundingClientRect.height)
        .attr("data-connector-end-x", boundingClientRect.x + (boundingClientRect.width/2))
        .attr("data-connector-id", id)
        .attr("dragable", true)
        .selectAll("*")
           .attr("data-type", data_type)
           .attr("data-parentid", parent_id)
           .attr("data-connector-start-y", boundingClientRect.y + boundingClientRect.height)
           .attr("data-connector-start-x", boundingClientRect.x + (boundingClientRect.width/2))
           .attr("data-connector-end-y", boundingClientRect.y)
           .attr("data-connector-end-x", boundingClientRect.x + (boundingClientRect.width/2))
           .attr("data-connector-id", id)
           .attr("dragable", true);
}

/*
** Property Sheet Load function
 */
function loadRouteTableProperties(id) {
    $("#properties").load("propertysheets/route_table.html", function () {
        if ('compartment' in OKITJsonObj && 'route_tables' in OKITJsonObj['compartment']) {
            console.log('Loading Route Table: ' + id);
            var json = OKITJsonObj['compartment']['route_tables'];
            for (var i = 0; i < json.length; i++) {
                route_table = json[i];
                //console.log(JSON.stringify(route_table, null, 2));
                if (route_table['id'] == id) {
                    //console.log('Found Route Table: ' + id);
                    route_table['virtual_cloud_network'] = okitIdsJsonObj[route_table['vcn_id']];
                    $("#virtual_cloud_network").html(route_table['virtual_cloud_network']);
                    $('#display_name').val(route_table['display_name']);
                    // Add Change Events to fields
                    var inputfields = document.querySelectorAll('#route_table input');
                    [].forEach.call(inputfields, function (inputfield) {
                        inputfield.addEventListener('change', function () {
                            route_table[inputfield.id] = inputfield.value;
                            // If this is the name field copy to the Ids Map
                            if (inputfield.id == 'display_name') {
                                okitIdsJsonObj[id] = inputfield.value;
                            }
                            displayOkitJson();
                        });
                    });
                    // Route Rules
                    for (var rulecnt = 0; rulecnt < route_table['route_rules'].length; rulecnt++) {
                        addRouteRuleHtml(route_table['route_rules'][rulecnt])
                    }
                    // Add Handler to Add Button
                    document.getElementById('add_button').addEventListener('click', handleAddRouteRule, false);
                    document.getElementById('add_button').route_table = route_table;
                    propertires_route_table = route_table;
                    break;
                }
            }
        }
    });
}

function addRouteRuleHtml(route_rule) {
    var rules_table_body = d3.select('#route_rules_table_body');
    var rules_count = $('#route_rules_table_body > tr').length;
    var rule_num = rules_count + 1;
    var row = rules_table_body.append('tr');
    var cell = row.append('td')
        .attr("id", "rule_" + rule_num)
        .attr("colspan", "2");
    var rule_table = cell.append('table')
        .attr("id", "rule_table_" + rule_num)
        .attr("class", "property-editor-table");
    // First Row with Delete Button
    var rule_row = rule_table.append('tr');
    var rule_cell = rule_row.append('td')
        .attr("colspan", "2");
    rule_cell.append('input')
        .attr("type", "button")
        .attr("class", "delete-button")
        .attr("value", "-")
        .attr("onclick", "handleDeleteRouteRulesRow(this)");
    // Destination Type
    rule_row = rule_table.append('tr');
    rule_cell = rule_row.append('td')
        .text("Destination Type");
    rule_cell = rule_row.append('td');
    rule_cell.append('input')
        .attr("type", "text")
        .attr("class", "property-value")
        .attr("readonly", "readonly")
        .attr("id", "destination_type")
        .attr("name", "destination_type")
        .attr("value", route_rule['destination_type'])
        .on("change", function() {
            route_rule['destination_type'] = this.value;
            displayOkitJson();
        });
    // Destination
    rule_row = rule_table.append('tr');
    rule_cell = rule_row.append('td')
        .text("Destination");
    rule_cell = rule_row.append('td');
    rule_cell.append('input')
        .attr("type", "text")
        .attr("class", "property-value")
        .attr("id", "destination")
        .attr("name", "destination")
        .attr("value", route_rule['destination'])
        .on("change", function() {
            route_rule['destination'] = this.value;
            console.log('Changed destination: ' + this.value);
            displayOkitJson();
        });
    // Network Entity
    rule_row = rule_table.append('tr');
    rule_cell = rule_row.append('td')
        .text("Network Entity");
    rule_cell = rule_row.append('td');
    var network_entity_id_select = rule_cell.append('select')
        .attr("class", "property-value")
        .attr("id", "network_entity_id")
        .on("change", function() {
            route_rule['network_entity_id'] = this.options[this.selectedIndex].value;
            console.log('Changed network_entity_id ' + this.selectedIndex);
            displayOkitJson();
        });
    // Add Internet gateways
    for (var igcnt=0; igcnt < internet_gateway_ids.length; igcnt++) {
        var opt = network_entity_id_select.append('option')
            .attr("value", internet_gateway_ids[igcnt])
            .text(okitIdsJsonObj[internet_gateway_ids[igcnt]]);
        if (route_rule['network_entity_id'] == internet_gateway_ids[igcnt]) {
            opt.attr("selected", "selected");
        }
    }
    //console.log('Selected Index: ' + network_entity_id_select.node().selectedIndex);
    if (route_rule['network_entity_id'] == '') {
        route_rule['network_entity_id'] = network_entity_id_select.node().options[network_entity_id_select.node().selectedIndex].value;
    }
}

function handleAddRouteRule(evt) {
    //route_table = evt.target.route_table;
    console.log('Adding route rule to : ' + route_table);
    var new_rule = {destination_type: "CIDR_BLOCK", destination: "0.0.0.0/0", network_entity_id: ""}
    evt.target.route_table['route_rules'].push(new_rule)
    addRouteRuleHtml(new_rule);
    displayOkitJson();
}

function handleDeleteRouteRulesRow(btn) {
    var row = btn.parentNode.parentNode.parentNode.parentNode.parentNode;
    row.parentNode.removeChild(row);
}


clearRouteTableVariables();
