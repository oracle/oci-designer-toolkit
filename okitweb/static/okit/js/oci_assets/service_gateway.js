console.info('Loaded Service Gateway Javascript');

/*
** Set Valid drop Targets
 */
asset_drop_targets[service_gateway_artifact] = [virtual_cloud_network_artifact];
asset_connect_targets[service_gateway_artifact] = [];
asset_add_functions[service_gateway_artifact] = "addServiceGateway";
asset_delete_functions[service_gateway_artifact] = "deleteServiceGateway";
asset_clear_functions.push("clearServiceGatewayVariables");

const service_gateway_stroke_colour = "purple";
const service_gateway_query_cb = "service-gateway-query-cb";
let service_gateway_ids = [];
let service_gateway_count = 0;

/*
** Reset variables
 */

function clearServiceGatewayVariables() {
    service_gateway_ids = [];
    service_gateway_count = 0;
}

/*
** Add Asset to JSON Model
 */
function addServiceGateway(vcn_id, compartment_id) {
    let id = 'okit-' + service_gateway_prefix + '-' + uuidv4();
    console.groupCollapsed('Adding ' + service_gateway_artifact + ' : ' + id);

    // Add Virtual Cloud Network to JSON

    if (!okitJson.hasOwnProperty('service_gateways')) {
        okitJson['service_gateways'] = [];
    }

    // Add id & empty name to id JSON
    okitIdsJsonObj[id] = '';
    service_gateway_ids.push(id);

    // Increment Count
    service_gateway_count += 1;
    let service_gateway = {};
    service_gateway['vcn_id'] = vcn_id;
    service_gateway['virtual_cloud_network'] = '';
    service_gateway['compartment_id'] = compartment_id;
    service_gateway['id'] = id;
    service_gateway['display_name'] = generateDefaultName(service_gateway_prefix, service_gateway_count);
    okitJson['service_gateways'].push(service_gateway);
    okitIdsJsonObj[id] = service_gateway['display_name'];
    //console.info(JSON.stringify(okitJson, null, 2));
    //drawServiceGatewaySVG(service_gateway);
    drawSVGforJson();
    loadServiceGatewayProperties(id);
    console.groupEnd();
}

/*
** Delete From JSON Model
 */

function deleteServiceGateway(id) {
    console.groupCollapsed('Delete ' + service_gateway_artifact + ' : ' + id);
    // Remove SVG Element
    d3.select("#" + id + "-svg").remove()
    // Remove Data Entry
    for (let i=0; i < okitJson['service_gateways'].length; i++) {
        if (okitJson['service_gateways'][i]['id'] == id) {
            okitJson['service_gateways'].splice(i, 1);
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
    console.groupEnd();
}

/*
** SVG Creation
 */
function getServiceGatewayDimensions(id='') {
    return {width:icon_width, height:icon_height};
}

function newServiceGatewayDefinition(artifact, position=0) {
    let dimensions = getServiceGatewayDimensions();
    let definition = newArtifactSVGDefinition(artifact, service_gateway_artifact);
    definition['svg']['x'] = Math.round(icon_width * 2 + (icon_width * position) + (icon_spacing * position));
    definition['svg']['y'] = 0;
    definition['svg']['width'] = dimensions['width'];
    definition['svg']['height'] = dimensions['height'];
    definition['rect']['stroke']['colour'] = service_gateway_stroke_colour;
    definition['rect']['stroke']['dash'] = 1;
    return definition;
}

function drawServiceGatewaySVG(artifact) {
    let parent_id = artifact['vcn_id'];
    artifact['parent_id'] = parent_id;
    let id = artifact['id'];
    let compartment_id = artifact['compartment_id'];
    console.groupCollapsed('Drawing ' + service_gateway_artifact + ' : ' + id + ' [' + parent_id + ']');

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

        let svg = drawArtifact(newServiceGatewayDefinition(artifact, position));

        //loadServiceGatewayProperties(id);
        // Add click event to display properties
        // Add Drag Event to allow connector (Currently done a mouse events because SVG does not have drag version)
        // Add dragevent versions
        // Set common attributes on svg element and children
        svg.on("click", function () {
            loadServiceGatewayProperties(id);
            d3.event.stopPropagation();
        });
        //    .on("contextmenu", handleContextMenu);
    } else {
        console.warn(parent_id + ' was not found in virtual cloud network sub artifacts : ' + JSON.stringify(virtual_cloud_network_bui_sub_artifacts));
    }
    console.groupEnd();
}

/*
** Property Sheet Load function
 */
function loadServiceGatewayProperties(id) {
    $("#properties").load("propertysheets/service_gateway.html", function () {
        if ('service_gateways' in okitJson) {
            console.info('Loading Service Gateway: ' + id);
            let json = okitJson['service_gateways'];
            for (let i = 0; i < json.length; i++) {
                let service_gateway = json[i];
                //console.info(JSON.stringify(service_gateway, null, 2));
                if (service_gateway['id'] == id) {
                    //console.info('Found Service Gateway: ' + id);
                    service_gateway['virtual_cloud_network'] = okitIdsJsonObj[service_gateway['vcn_id']];
                    $("#virtual_cloud_network").html(service_gateway['virtual_cloud_network']);
                    $('#display_name').val(service_gateway['display_name']);
                    // Add Event Listeners
                    addPropertiesEventListeners(service_gateway, []);
                    break;
                }
            }
        }
    });
}

/*
** Query OCI
 */

function queryServiceGatewayAjax(compartment_id, vcn_id) {
    console.info('------------- queryServiceGatewayAjax --------------------');
    let request_json = {};
    request_json['compartment_id'] = compartment_id;
    request_json['vcn_id'] = vcn_id;
    if ('service_gateway_filter' in okitQueryRequestJson) {
        request_json['service_gateway_filter'] = okitQueryRequestJson['service_gateway_filter'];
    }
    $.ajax({
        type: 'get',
        url: 'oci/artifacts/ServiceGateway',
        dataType: 'text',
        contentType: 'application/json',
        data: JSON.stringify(request_json),
        success: function(resp) {
            let response_json = JSON.parse(resp);
            okitJson['service_gateways'] = response_json;
            let len =  response_json.length;
            for(let i=0;i<len;i++ ){
                console.info('queryServiceGatewayAjax : ' + response_json[i]['display_name']);
            }
            redrawSVGCanvas();
            $('#' + service_gateway_query_cb).prop('checked', true);
            hideQueryProgressIfComplete();
        },
        error: function(xhr, status, error) {
            console.info('Status : '+ status)
            console.info('Error : '+ error)
        }
    });
}

$(document).ready(function() {
    clearServiceGatewayVariables();

    // Setup Search Checkbox
    let body = d3.select('#query-progress-tbody');
    let row = body.append('tr');
    let cell = row.append('td');
    cell.append('input')
        .attr('type', 'checkbox')
        .attr('id', service_gateway_query_cb);
    cell.append('label').text(service_gateway_artifact);

    // Setup Query Display Form
    body = d3.select('#query-oci-tbody');
    row = body.append('tr');
    cell = row.append('td')
        .text(service_gateway_artifact);
    cell = row.append('td');
    let input = cell.append('input')
        .attr('type', 'text')
        .attr('class', 'query-filter')
        .attr('id', 'service_gateway_name_filter')
        .attr('name', 'service_gateway_name_filter');
});

