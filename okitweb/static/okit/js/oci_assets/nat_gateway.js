console.info('Loaded NAT Gateway Javascript');

/*
** Set Valid drop Targets
 */
asset_drop_targets[nat_gateway_artifact] = [virtual_cloud_network_artifact];
asset_connect_targets[nat_gateway_artifact] = [];
asset_add_functions[nat_gateway_artifact] = "addNATGateway";
asset_delete_functions[nat_gateway_artifact] = "deleteNATGateway";
asset_clear_functions.push("clearNATGatewayVariables");

const nat_gateway_stroke_colour = "purple";
const nat_gateway_query_cb = "nat-gateway-query-cb";
let nat_gateway_ids = [];
let nat_gateway_count = 0;

/*
** Reset variables
 */

function clearNATGatewayVariables() {
    nat_gateway_ids = [];
    nat_gateway_count = 0;
}

/*
** Add Asset to JSON Model
 */
function addNATGateway(vcn_id, compartment_id) {
    let id = 'okit-' + nat_gateway_prefix + '-' + uuidv4();
    console.info('Adding NAT Gateway : ' + id);

    // Add Virtual Cloud Network to JSON

    if (!okitJson.hasOwnProperty('nat_gateways')) {
        okitJson['nat_gateways'] = [];
    }

    // Add id & empty name to id JSON
    okitIdsJsonObj[id] = '';
    nat_gateway_ids.push(id);

    // Increment Count
    nat_gateway_count += 1;
    let nat_gateway = {};
    nat_gateway['vcn_id'] = vcn_id;
    nat_gateway['virtual_cloud_network'] = '';
    nat_gateway['compartment_id'] = compartment_id;
    nat_gateway['id'] = id;
    nat_gateway['display_name'] = generateDefaultName(nat_gateway_prefix, nat_gateway_count);
    okitJson['nat_gateways'].push(nat_gateway);
    okitIdsJsonObj[id] = nat_gateway['display_name'];
    //console.info(JSON.stringify(okitJson, null, 2));
    //drawNATGatewaySVG(nat_gateway);
    drawSVGforJson();
    loadNATGatewayProperties(id);
}

/*
** Delete From JSON Model
 */

function deleteNATGateway(id) {
    console.info('Delete NAT Gateway ' + id);
    // Remove SVG Element
    d3.select("#" + id + "-svg").remove()
    // Remove Data Entry
    for (let i=0; i < okitJson['nat_gateways'].length; i++) {
        if (okitJson['nat_gateways'][i]['id'] == id) {
            okitJson['nat_gateways'].splice(i, 1);
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
function getNATGatewayDimensions(id='') {
    return {width:icon_width, height:icon_height};
}

function newNATGatewayDefinition(artifact, position=0) {
    let dimensions = getNATGatewayDimensions();
    let definition = newArtifactSVGDefinition(artifact, nat_gateway_artifact);
    definition['svg']['x'] = Math.round(icon_width * 2 + (icon_width * position) + (icon_spacing * position));
    definition['svg']['y'] = 0;
    definition['svg']['width'] = dimensions['width'];
    definition['svg']['height'] = dimensions['height'];
    definition['rect']['stroke']['colour'] = nat_gateway_stroke_colour;
    definition['rect']['stroke']['dash'] = 1;
    return definition;
}

function drawNATGatewaySVG(artifact) {
    let parent_id = artifact['vcn_id'];
    artifact['parent_id'] = parent_id;
    let id = artifact['id'];
    let compartment_id = artifact['compartment_id'];
    console.info('Drawing ' + nat_gateway_artifact + ' : ' + id + ' [' + parent_id + ']');

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

        let svg = drawArtifact(newNATGatewayDefinition(artifact, position));

        //loadNATGatewayProperties(id);
        // Add click event to display properties
        // Add Drag Event to allow connector (Currently done a mouse events because SVG does not have drag version)
        // Add dragevent versions
        // Set common attributes on svg element and children
        svg.on("click", function () {
            loadNATGatewayProperties(id);
            d3.event.stopPropagation();
        });
        //    .on("contextmenu", handleContextMenu);
    } else {
        console.info(parent_id + ' was not found in virtual cloud network sub artifacts : ' + JSON.stringify(virtual_cloud_network_bui_sub_artifacts));
    }
}

/*
** Property Sheet Load function
 */
function loadNATGatewayProperties(id) {
    $("#properties").load("propertysheets/nat_gateway.html", function () {
        if ('nat_gateways' in okitJson) {
            console.info('Loading NAT Gateway: ' + id);
            let json = okitJson['nat_gateways'];
            for (let i = 0; i < json.length; i++) {
                let nat_gateway = json[i];
                //console.info(JSON.stringify(nat_gateway, null, 2));
                if (nat_gateway['id'] == id) {
                    //console.info('Found NAT Gateway: ' + id);
                    nat_gateway['virtual_cloud_network'] = okitIdsJsonObj[nat_gateway['vcn_id']];
                    $("#virtual_cloud_network").html(nat_gateway['virtual_cloud_network']);
                    $('#display_name').val(nat_gateway['display_name']);
                    // Add Event Listeners
                    addPropertiesEventListeners(nat_gateway, []);
                    break;
                }
            }
        }
    });
}

/*
** Query OCI
 */

function queryNATGatewayAjax(compartment_id, vcn_id) {
    console.info('------------- queryNATGatewayAjax --------------------');
    let request_json = {};
    request_json['compartment_id'] = compartment_id;
    request_json['vcn_id'] = vcn_id;
    if ('nat_gateway_filter' in okitQueryRequestJson) {
        request_json['nat_gateway_filter'] = okitQueryRequestJson['nat_gateway_filter'];
    }
    $.ajax({
        type: 'get',
        url: 'oci/artifacts/NATGateway',
        dataType: 'text',
        contentType: 'application/json',
        data: JSON.stringify(request_json),
        success: function(resp) {
            let response_json = JSON.parse(resp);
            okitJson['nat_gateways'] = response_json;
            let len =  response_json.length;
            for(let i=0;i<len;i++ ){
                console.info('queryNATGatewayAjax : ' + response_json[i]['display_name']);
            }
            redrawSVGCanvas();
            $('#' + nat_gateway_query_cb).prop('checked', true);
            hideQueryProgressIfComplete();
        },
        error: function(xhr, status, error) {
            console.info('Status : '+ status)
            console.info('Error : '+ error)
        }
    });
}

$(document).ready(function() {
    clearNATGatewayVariables();

    // Setup Search Checkbox
    let body = d3.select('#query-progress-tbody');
    let row = body.append('tr');
    let cell = row.append('td');
    cell.append('input')
        .attr('type', 'checkbox')
        .attr('id', nat_gateway_query_cb);
    cell.append('label').text(nat_gateway_artifact);

    // Setup Query Display Form
    body = d3.select('#query-oci-tbody');
    row = body.append('tr');
    cell = row.append('td')
        .text(nat_gateway_artifact);
    cell = row.append('td');
    let input = cell.append('input')
        .attr('type', 'text')
        .attr('class', 'query-filter')
        .attr('id', 'nat_gateway_name_filter')
        .attr('name', 'nat_gateway_name_filter');
});

