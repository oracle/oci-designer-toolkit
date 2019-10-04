console.log('Loaded Route Table Javascript');

/*
** Set Valid drop Targets
 */
asset_drop_targets[route_table_artifact] = [virtual_cloud_network_artifact];
asset_connect_targets[route_table_artifact] = [subnet_artifact];
asset_add_functions[route_table_artifact] = "addRouteTable";
asset_delete_functions[route_table_artifact] = "deleteRouteTable";
asset_clear_functions.push("clearRouteTableVariables");

const route_table_stroke_colour = "#F80000";
const route_table_query_cb = "route-table-query-cb";
let route_table_ids = [];
let route_table_count = 0;
let propertires_route_table = {}

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
function addRouteTable(vcn_id, compartment_id) {
    let id = 'okit-' + route_table_prefix + '-' + uuidv4();
    console.log('Adding Route Table : ' + id);

    // Add Virtual Cloud Network to JSON

    if (!OKITJsonObj.hasOwnProperty('route_tables')) {
        OKITJsonObj['route_tables'] = [];
    }

    // Add id & empty name to id JSON
    okitIdsJsonObj[id] = '';
    route_table_ids.push(id);

    // Increment Count
    route_table_count += 1;
    let route_table = {};
    route_table['vcn_id'] = vcn_id;
    route_table['virtual_cloud_network'] = '';
    route_table['compartment_id'] = compartment_id;
    route_table['id'] = id;
    route_table['display_name'] = generateDefaultName(route_table_prefix, route_table_count);
    route_table['route_rules'] = []
    OKITJsonObj['route_tables'].push(route_table);
    okitIdsJsonObj[id] = route_table['display_name'];
    //console.log(JSON.stringify(OKITJsonObj, null, 2));
    displayOkitJson();
    drawRouteTableSVG(route_table);
    loadRouteTableProperties(id);
}

/*
** Delete From JSON Model
 */

function deleteRouteTable(id) {
    console.log('Delete Route Table ' + id);
    // Remove SVG Element
    d3.select("#" + id + "-svg").remove()
    // Remove Data Entry
    for (let i=0; i < OKITJsonObj['route_tables'].length; i++) {
        if (OKITJsonObj['route_tables'][i]['id'] == id) {
            OKITJsonObj['route_tables'].splice(i, 1);
        }
    }
    // Remove Subnet references
    if ('subnets' in OKITJsonObj) {
        for (subnet of OKITJsonObj['subnets']) {
            if (subnet['route_table_id'] == id) {
                subnet['route_table_id'] = '';
            }
        }
    }
}

/*
** SVG Creation
 */
function drawRouteTableSVG(artifact) {
    // Check if this Route Table has been attached to a Subnet and if so do not draw because it will be done as part of
    // the subnet draw.
    if (OKITJsonObj.hasOwnProperty('subnets')) {
        for (let subnet of OKITJsonObj['subnets']) {
            if (subnet['route_table_id'] == artifact['id']) {
                console.log(artifact['display_name'] + ' attached to subnet '+ subnet['display_name']);
                return;
            }
        }
    }
    let parent_id = artifact['vcn_id'];
    artifact['parent_id'] = parent_id;
    let id = artifact['id'];
    let compartment_id = artifact['compartment_id'];
    console.log('Drawing ' + route_table_artifact + ' : ' + id + ' [' + parent_id + ']');

    if (!virtual_cloud_network_bui_sub_artifacts.hasOwnProperty(parent_id)) {
        virtual_cloud_network_bui_sub_artifacts[parent_id] = {};
    }

    if (virtual_cloud_network_bui_sub_artifacts.hasOwnProperty(parent_id)) {
        if (!virtual_cloud_network_bui_sub_artifacts[parent_id].hasOwnProperty('element_position')) {
            virtual_cloud_network_bui_sub_artifacts[parent_id]['element_position'] = 0;
        }
        // Calculate Position
        let position = virtual_cloud_network_bui_sub_artifacts[parent_id]['element_position'];
        // Increment Icon Position
        virtual_cloud_network_bui_sub_artifacts[parent_id]['element_position'] += 1;

        let artifact_definition = newArtifactSVGDefinition(artifact, route_table_artifact);
        artifact_definition['svg']['x'] = Math.round(icon_width + (icon_width * position) + (icon_spacing * position));
        artifact_definition['svg']['y'] = Math.round(icon_height * 3 / 2);
        artifact_definition['svg']['width'] = icon_width;
        artifact_definition['svg']['height'] = icon_height;
        artifact_definition['rect']['stroke']['colour'] = route_table_stroke_colour;
        artifact_definition['rect']['stroke']['dash'] = 1;

        let svg = drawArtifact(artifact_definition);

        let rect = d3.select('#' + id);
        let boundingClientRect = rect.node().getBoundingClientRect();
        /*
         Add click event to display properties
         Add Drag Event to allow connector (Currently done a mouse events because SVG does not have drag version)
         Add dragevent versions
         Set common attributes on svg element and children
         */
        svg.on("click", function () {
            loadRouteTableProperties(id);
            d3.event.stopPropagation();
        });
    } else {
        console.log(parent_id + ' was not found in virtual cloud network sub artifacts : ' + JSON.stringify(virtual_cloud_network_bui_sub_artifacts));
    }
}

/*
** Property Sheet Load function
 */
function loadRouteTableProperties(id) {
    $("#properties").load("propertysheets/route_table.html", function () {
        if ('route_tables' in OKITJsonObj) {
            console.log('Loading Route Table: ' + id);
            let json = OKITJsonObj['route_tables'];
            for (let i = 0; i < json.length; i++) {
                let route_table = json[i];
                //console.log(JSON.stringify(route_table, null, 2));
                if (route_table['id'] == id) {
                    //console.log('Found Route Table: ' + id);
                    route_table['virtual_cloud_network'] = okitIdsJsonObj[route_table['vcn_id']];
                    $("#virtual_cloud_network").html(route_table['virtual_cloud_network']);
                    $('#display_name').val(route_table['display_name']);
                    // Add Event Listeners
                    addPropertiesEventListeners(route_table, []);
                    // Route Rules
                    for (let rulecnt = 0; rulecnt < route_table['route_rules'].length; rulecnt++) {
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
    let rules_table_body = d3.select('#route_rules_table_body');
    let rules_count = $('#route_rules_table_body > tr').length;
    let rule_num = rules_count + 1;
    let row = rules_table_body.append('tr');
    let cell = row.append('td')
        .attr("id", "rule_" + rule_num)
        .attr("colspan", "2");
    let rule_table = cell.append('table')
        .attr("id", "rule_table_" + rule_num)
        .attr("class", "property-editor-table");
    // First Row with Delete Button
    let rule_row = rule_table.append('tr');
    let rule_cell = rule_row.append('td')
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
    let network_entity_id_select = rule_cell.append('select')
        .attr("class", "property-value")
        .attr("id", "network_entity_id")
        .on("change", function() {
            route_rule['network_entity_id'] = this.options[this.selectedIndex].value;
            console.log('Changed network_entity_id ' + this.selectedIndex);
            displayOkitJson();
        });
    // Add Internet gateways
    for (let igcnt=0; igcnt < internet_gateway_ids.length; igcnt++) {
        let opt = network_entity_id_select.append('option')
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
    let new_rule = {destination_type: "CIDR_BLOCK", destination: "0.0.0.0/0", network_entity_id: ""}
    evt.target.route_table['route_rules'].push(new_rule)
    addRouteRuleHtml(new_rule);
    displayOkitJson();
}

function handleDeleteRouteRulesRow(btn) {
    let row = btn.parentNode.parentNode.parentNode.parentNode.parentNode;
    row.parentNode.removeChild(row);
}


/*
** Query OCI
 */

function queryRouteTableAjax(compartment_id, vcn_id) {
    console.log('------------- queryRouteTableAjax --------------------');
    let request_json = {};
    request_json['compartment_id'] = compartment_id;
    request_json['vcn_id'] = vcn_id;
    if ('route_table_filter' in okitQueryRequestJson) {
        request_json['route_table_filter'] = okitQueryRequestJson['route_table_filter'];
    }
    $.ajax({
        type: 'get',
        url: 'oci/artifacts/RouteTable',
        dataType: 'text',
        contentType: 'application/json',
        data: JSON.stringify(request_json),
        success: function(resp) {
            let response_json = JSON.parse(resp);
            OKITJsonObj['route_tables'] = response_json;
            let len =  response_json.length;
            for(let i=0;i<len;i++ ){
                console.log('queryRouteTableAjax : ' + response_json[i]['display_name']);
            }
            redrawSVGCanvas();
            $('#' + route_table_query_cb).prop('checked', true);
            hideQueryProgressIfComplete();
        },
        error: function(xhr, status, error) {
            console.log('Status : '+ status)
            console.log('Error : '+ error)
        }
    });
}

$(document).ready(function() {
    clearRouteTableVariables();

    // Setup Search Checkbox
    let body = d3.select('#query-progress-tbody');
    let row = body.append('tr');
    let cell = row.append('td');
    cell.append('input')
        .attr('type', 'checkbox')
        .attr('id', route_table_query_cb);
    cell.append('label').text(route_table_artifact);

    // Setup Query Display Form
    body = d3.select('#query-oci-tbody');
    row = body.append('tr');
    cell = row.append('td')
        .text(route_table_artifact);
    cell = row.append('td');
    let input = cell.append('input')
        .attr('type', 'text')
        .attr('class', 'query-filter')
        .attr('id', 'route_table_name_filter')
        .attr('name', 'route_table_name_filter');
});

