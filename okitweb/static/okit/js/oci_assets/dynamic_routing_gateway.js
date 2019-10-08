console.log('Loaded Dynamic Routing Gateway Javascript');

/*
** Set Valid drop Targets
 */
asset_drop_targets[dynamic_routing_gateway_artifact] = [virtual_cloud_network_artifact];
asset_connect_targets[dynamic_routing_gateway_artifact] = [];
asset_add_functions[dynamic_routing_gateway_artifact] = "addDynamicRoutingGateway";
asset_delete_functions[dynamic_routing_gateway_artifact] = "deleteDynamicRoutingGateway";
asset_clear_functions.push("clearDynamicRoutingGatewayVariables");

const dynamic_routing_gateway_stroke_colour = "purple";
const dynamic_routing_gateway_query_cb = "dynamic_routing-gateway-query-cb";
let dynamic_routing_gateway_ids = [];
let dynamic_routing_gateway_count = 0;

/*
** Reset variables
 */

function clearDynamicRoutingGatewayVariables() {
    dynamic_routing_gateway_ids = [];
    dynamic_routing_gateway_count = 0;
}

/*
** Add Asset to JSON Model
 */
function addDynamicRoutingGateway(vcn_id, compartment_id) {
    let id = 'okit-' + dynamic_routing_gateway_prefix + '-' + uuidv4();
    console.log('Adding Dynamic Routing Gateway : ' + id);

    // Add Virtual Cloud Network to JSON

    if (!okitJson.hasOwnProperty('dynamic_routing_gateways')) {
        okitJson['dynamic_routing_gateways'] = [];
    }

    // Add id & empty name to id JSON
    okitIdsJsonObj[id] = '';
    dynamic_routing_gateway_ids.push(id);

    // Increment Count
    dynamic_routing_gateway_count += 1;
    let dynamic_routing_gateway = {};
    dynamic_routing_gateway['vcn_id'] = vcn_id;
    dynamic_routing_gateway['virtual_cloud_network'] = '';
    dynamic_routing_gateway['compartment_id'] = compartment_id;
    dynamic_routing_gateway['id'] = id;
    dynamic_routing_gateway['display_name'] = generateDefaultName(dynamic_routing_gateway_prefix, dynamic_routing_gateway_count);
    okitJson['dynamic_routing_gateways'].push(dynamic_routing_gateway);
    okitIdsJsonObj[id] = dynamic_routing_gateway['display_name'];
    //console.log(JSON.stringify(okitJson, null, 2));
    displayOkitJson();
    drawDynamicRoutingGatewaySVG(dynamic_routing_gateway);
    loadDynamicRoutingGatewayProperties(id);
}

/*
** Delete From JSON Model
 */

function deleteDynamicRoutingGateway(id) {
    console.log('Delete DynamicRouting Gateway ' + id);
    // Remove SVG Element
    d3.select("#" + id + "-svg").remove()
    // Remove Data Entry
    for (let i=0; i < okitJson['dynamic_routing_gateways'].length; i++) {
        if (okitJson['dynamic_routing_gateways'][i]['id'] == id) {
            okitJson['dynamic_routing_gateways'].splice(i, 1);
        }
    }
    // Remove Subnet references
    if ('route_tables' in okitJson) {
        for (route_table of okitJson['route_tables']) {
            for (let i = 0; i < route_table['route_rules'].length; i++) {
                if (route_table['route_rules'][i]['network_entity_id'] == id) {
                    route_table['route_rules'].splice(i, 1);
                }
            }
        }
    }
}

/*
** SVG Creation
 */
function getDynamicRoutingGatewayDimensions(id='') {
    return {width:icon_width, height:icon_height};
}

function newDynamicRoutingGatewayDefinition(artifact, position=0) {
    let definition = newArtifactSVGDefinition(artifact, dynamic_routing_gateway_artifact);
    let dimensions = getDynamicRoutingGatewayDimensions();
    definition['svg']['x'] = Math.round(icon_width * 2 + (icon_width * position) + (icon_spacing * position));
    definition['svg']['y'] = 0;
    definition['svg']['width'] = dimensions['width'];
    definition['svg']['height'] = dimensions['height'];
    definition['rect']['stroke']['colour'] = dynamic_routing_gateway_stroke_colour;
    definition['rect']['stroke']['dash'] = 1;
    return definition;
}

function drawDynamicRoutingGatewaySVG(artifact) {
    let parent_id = artifact['vcn_id'];
    artifact['parent_id'] = parent_id;
    let id = artifact['id'];
    let compartment_id = artifact['compartment_id'];
    console.log('Drawing ' + dynamic_routing_gateway_artifact + ' : ' + id + ' [' + parent_id + ']');

    if (!virtual_cloud_network_bui_sub_artifacts.hasOwnProperty(parent_id)) {
        virtual_cloud_network_bui_sub_artifacts[parent_id] = {};
    }

    if (virtual_cloud_network_bui_sub_artifacts.hasOwnProperty(parent_id)) {
        if (!virtual_cloud_network_bui_sub_artifacts[parent_id].hasOwnProperty('gateway_position')) {
            virtual_cloud_network_bui_sub_artifacts[parent_id]['gateway_position'] = 0;
        }
        // Calculate Position
        let position = virtual_cloud_network_bui_sub_artifacts[parent_id]['gateway_position'];
        // Increment Icon Position
        virtual_cloud_network_bui_sub_artifacts[parent_id]['gateway_position'] += 1;

        let svg = drawArtifact(newDynamicRoutingGatewayDefinition(artifact, position));

        //loadDynamicRoutingGatewayProperties(id);
        // Add click event to display properties
        // Add Drag Event to allow connector (Currently done a mouse events because SVG does not have drag version)
        // Add dragevent versions
        // Set common attributes on svg element and children
        svg.on("click", function () {
            loadDynamicRoutingGatewayProperties(id);
            d3.event.stopPropagation();
        });
        //    .on("contextmenu", handleContextMenu);
    } else {
        console.log(parent_id + ' was not found in virtual cloud network sub artifacts : ' + JSON.stringify(virtual_cloud_network_bui_sub_artifacts));
    }
}

/*
** Property Sheet Load function
 */
function loadDynamicRoutingGatewayProperties(id) {
    $("#properties").load("propertysheets/dynamic_routing_gateway.html", function () {
        if ('dynamic_routing_gateways' in okitJson) {
            console.log('Loading DynamicRouting Gateway: ' + id);
            let json = okitJson['dynamic_routing_gateways'];
            for (let i = 0; i < json.length; i++) {
                let dynamic_routing_gateway = json[i];
                //console.log(JSON.stringify(dynamic_routing_gateway, null, 2));
                if (dynamic_routing_gateway['id'] == id) {
                    //console.log('Found DynamicRouting Gateway: ' + id);
                    dynamic_routing_gateway['virtual_cloud_network'] = okitIdsJsonObj[dynamic_routing_gateway['vcn_id']];
                    $("#virtual_cloud_network").html(dynamic_routing_gateway['virtual_cloud_network']);
                    $('#display_name').val(dynamic_routing_gateway['display_name']);
                    // Add Event Listeners
                    addPropertiesEventListeners(dynamic_routing_gateway, []);
                    break;
                }
            }
        }
    });
}

/*
** Query OCI
 */

function queryDynamicRoutingGatewayAjax(compartment_id) {
    console.log('------------- queryDynamicRoutingGatewayAjax --------------------');
    let request_json = {};
    request_json['compartment_id'] = compartment_id;
    if ('dynamic_routing_gateway_filter' in okitQueryRequestJson) {
        request_json['dynamic_routing_gateway_filter'] = okitQueryRequestJson['dynamic_routing_gateway_filter'];
    }
    $.ajax({
        type: 'get',
        url: 'oci/artifacts/DynamicRoutingGateway',
        dataType: 'text',
        contentType: 'application/json',
        data: JSON.stringify(request_json),
        success: function(resp) {
            let response_json = JSON.parse(resp);
            okitJson['dynamic_routing_gateways'] = response_json;
            let len =  response_json.length;
            for(let i=0;i<len;i++ ){
                console.log('queryDynamicRoutingGatewayAjax : ' + response_json[i]['display_name']);
            }
            redrawSVGCanvas();
            $('#' + dynamic_routing_gateway_query_cb).prop('checked', true);
            hideQueryProgressIfComplete();
        },
        error: function(xhr, status, error) {
            console.log('Status : '+ status)
            console.log('Error : '+ error)
        }
    });
}

$(document).ready(function() {
    clearDynamicRoutingGatewayVariables();

    // Setup Search Checkbox
    let body = d3.select('#query-progress-tbody');
    let row = body.append('tr');
    let cell = row.append('td');
    cell.append('input')
        .attr('type', 'checkbox')
        .attr('id', dynamic_routing_gateway_query_cb);
    cell.append('label').text(dynamic_routing_gateway_artifact);

    // Setup Query Display Form
    body = d3.select('#query-oci-tbody');
    row = body.append('tr');
    cell = row.append('td')
        .text(dynamic_routing_gateway_artifact);
    cell = row.append('td');
    let input = cell.append('input')
        .attr('type', 'text')
        .attr('class', 'query-filter')
        .attr('id', 'dynamic_routing_gateway_name_filter')
        .attr('name', 'dynamic_routing_gateway_name_filter');
});

