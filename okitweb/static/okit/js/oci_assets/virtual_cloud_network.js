console.info('Loaded Virtual Cloud Network Javascript');

/*
** Set Valid drop Targets
 */
asset_drop_targets[virtual_cloud_network_artifact] = [compartment_artifact];
asset_connect_targets[virtual_cloud_network_artifact] = [];
asset_add_functions[virtual_cloud_network_artifact] = "addVirtualCloudNetwork";
asset_delete_functions[virtual_cloud_network_artifact] = "deleteVirtualCloudNetwork";
asset_clear_functions.push("clearVirtualCloudNetworkVariables");

const virtual_cloud_network_stroke_colour = "purple";
const virtual_cloud_network_query_cb = "virtual-cloud-network-query-cb";
const min_virtual_cloud_network_dimensions = {width:400, height:300};
let virtual_network_ids = [];
let virtual_cloud_network_count = 0;
let virtual_cloud_network_cidr = {};
let virtual_cloud_network_bui_sub_artifacts = {};

/*
** Reset variables
 */

function clearVirtualCloudNetworkVariables() {
    virtual_network_ids = [];
    virtual_cloud_network_count = 0;
    virtual_cloud_network_cidr = {};
    virtual_cloud_network_bui_sub_artifacts = {};
}

/*
** Add Asset to JSON Model
 */
function addVirtualCloudNetwork(compartment_id, comp_id) {
    let id = 'okit-' + virtual_cloud_network_prefix + '-' + uuidv4();
    console.groupCollapsed('Adding ' + virtual_cloud_network_artifact + ' : ' + id);

    // Add Virtual Cloud Network to JSON

    if (!okitJson.hasOwnProperty('virtual_cloud_networks')) {
        okitJson['virtual_cloud_networks'] = [];
    }

    // Add id & empty name to id JSON
    okitIdsJsonObj[id] = '';
    virtual_network_ids.push(id);

    // Increment Count
    virtual_cloud_network_count += 1;
    // Build Virtual Cloud Network Object
    let virtual_cloud_network = {};
    virtual_cloud_network['compartment_id'] = compartment_id;
    virtual_cloud_network['id'] = id;
    virtual_cloud_network['display_name'] = generateDefaultName(virtual_cloud_network_prefix, virtual_cloud_network_count);
    // Generate Cidr
    virtual_cloud_network['cidr_block'] = '10.' + (virtual_cloud_network_count - 1) + '.0.0/16';
    virtual_cloud_network['dns_label'] = virtual_cloud_network['display_name'].toLowerCase().slice(-6);
    okitJson['virtual_cloud_networks'].push(virtual_cloud_network);
    okitIdsJsonObj[id] = virtual_cloud_network['display_name'];
    //console.info(JSON.stringify(okitJson, null, 2));
    //drawVirtualCloudNetworkSVG(virtual_cloud_network);
    drawSVGforJson();
    loadVirtualCloudNetworkProperties(id);
    console.groupEnd();
}

function initialiseVirtualCloudNetworkChildData(id) {
    // Add Sub Component positional data
    virtual_cloud_network_bui_sub_artifacts[id] = {
        "gateway_position": 0,
        "element_position": 0,
        "subnet_position": 0
    };
}

/*
** Delete From JSON Model
 */

function deleteVirtualCloudNetwork(id) {
    console.groupCollapsed('Delete ' + virtual_cloud_network_artifact + ' : ' + id);
    // Remove SVG Element
    d3.select("#" + id + "-svg").remove()
    // Remove Data Entry
    for (let i=0; i < okitJson['virtual_cloud_networks'].length; i++) {
        if (okitJson['virtual_cloud_networks'][i]['id'] == id) {
            okitJson['virtual_cloud_networks'].splice(i, 1);
        }
    }
    // Remove Sub Components
    if ('internet_gateways' in okitJson) {
        for (let i = okitJson['internet_gateways'].length - 1; i >= 0; i--) {
            let internet_gateway = okitJson['internet_gateways'][i];
            if (internet_gateway['vcn_id'] == id) {
                deleteInternetGateway(internet_gateway['id']);
            }
        }
    }
    if ('subnets' in okitJson) {
        for (let i = okitJson['subnets'].length - 1; i >= 0; i--) {
            let subnet = okitJson['subnets'][i];
            if (subnet['vcn_id'] == id) {
                deleteSubnet(subnet['id']);
            }
        }
    }
    if ('route_tables' in okitJson) {
        for (let i = okitJson['route_tables'].length - 1; i >= 0; i--) {
            let route_table = okitJson['route_tables'][i];
            if (route_table['vcn_id'] == id) {
                deleteRouteTable(route_table['id']);
            }
        }
    }
    if ('security_lists' in okitJson) {
        for (let i = okitJson['security_lists'].length - 1; i >= 0; i--) {
            let security_list = okitJson['security_lists'][i];
            if (security_list['vcn_id'] == id) {
                deleteSecurityList(security_list['id']);
            }
        }
    }
    console.groupEnd();
}
/*
** Tests
 */
function hasUnattachedSecurityList(id='') {
    if (okitJson.hasOwnProperty('security_lists')) {
        for (let security_list of okitJson['security_lists']) {
            if (security_list['vcn_id'] == id) {
                return true;
            }
        }
    }
    return false;
}

function hasUnattachedRouteTable(id='') {
    if (okitJson.hasOwnProperty('route_tables')) {
        for (let route_table of okitJson['route_tables']) {
            if (route_table['vcn_id'] == id) {
                return true;
            }
        }
    }
    return false;
}

/*
** SVG Creation
 */
function getVirtualCloudNetworkDimensions(id='') {
    console.groupCollapsed('Getting Dimensions of ' + virtual_cloud_network_artifact + ' : ' + id);
    let dimensions = {width:positional_adjustments.padding.x * 2, height:positional_adjustments.padding.y * 2};
    let max_gateway_dimensions = {width:0, height: 0, count:0};
    let max_subnet_dimensions = {width:0, height: 0, count:0};
    let max_edge_dimensions = {width:0, height: 0, count:0};
    // Process Gateways
    if (okitJson.hasOwnProperty('internet_gateways')) {
        for (let internet_gateway of okitJson['internet_gateways']) {
            if (internet_gateway['vcn_id'] == id) {
                let gateway_dimensions = getInternetGatewayDimensions(internet_gateway['id']);
                max_gateway_dimensions['width'] += gateway_dimensions['width'];
                max_gateway_dimensions['height'] = Math.max(max_gateway_dimensions['height'], gateway_dimensions['height']);
                max_gateway_dimensions['count'] += 1;
            }
        }
    }
    if (okitJson.hasOwnProperty('nat_gateways')) {
        for (let nat_gateway of okitJson['nat_gateways']) {
            if (nat_gateway['vcn_id'] == id) {
                let gateway_dimensions = getNATGatewayDimensions(nat_gateway['id']);
                max_gateway_dimensions['width'] += gateway_dimensions['width'];
                max_gateway_dimensions['height'] = Math.max(max_gateway_dimensions['height'], gateway_dimensions['height']);
                max_gateway_dimensions['count'] += 1;
            }
        }
    }
    // Process Edge Artifacts
    if (hasUnattachedSecurityList(id)) {
        for (let security_list of okitJson['security_lists']) {
            if (security_list['vcn_id'] == id) {
                let edge_dimensions = getSecurityListDimensions(security_list['id']);
                max_edge_dimensions['width'] += edge_dimensions['width'];
                max_edge_dimensions['height'] = Math.max(max_edge_dimensions['height'], edge_dimensions['height'] + positional_adjustments.spacing.y);
                max_edge_dimensions['count'] += 1;
            }
        }
    }
    if (hasUnattachedRouteTable(id)) {
        for (let route_table of okitJson['route_tables']) {
            if (route_table['vcn_id'] == id) {
                let edge_dimensions = getRouteTableDimensions(route_table['id']);
                max_edge_dimensions['width'] += edge_dimensions['width'];
                max_edge_dimensions['height'] = Math.max(max_edge_dimensions['height'], edge_dimensions['height'] + positional_adjustments.spacing.y);
                max_edge_dimensions['count'] += 1;
            }
        }
    }
    // Process Subnet Widths
    if (okitJson.hasOwnProperty('subnets')) {
        for (let subnet of okitJson['subnets']) {
            if (subnet['vcn_id'] == id) {
                let subnet_dimensions = getSubnetDimensions(subnet['id']);
                max_subnet_dimensions['width'] = Math.max(max_subnet_dimensions['width'], subnet_dimensions['width']);
                max_subnet_dimensions['height'] += subnet_dimensions['height'];
                max_subnet_dimensions['count'] += 1;
            }
        }
    }
    // Calculate largest Width
    //dimensions['width'] += Math.max((max_subnet_dimensions['width'] + icon_spacing * max_subnet_dimensions['count']),
    dimensions['width'] += Math.max(max_subnet_dimensions['width'],
        (max_gateway_dimensions['width'] + positional_adjustments.spacing.x * max_gateway_dimensions['count']),
        (max_edge_dimensions['width']    + positional_adjustments.spacing.x * max_edge_dimensions['count']));
    // Calculate largest  Height
    dimensions['height'] += max_subnet_dimensions['height'] + positional_adjustments.spacing.y * max_gateway_dimensions['count'];
    dimensions['height'] += icon_height;
    // Check size against minimum
    dimensions['width']  = Math.max(dimensions['width'],  min_virtual_cloud_network_dimensions['width']);
    dimensions['height'] = Math.max(dimensions['height'], min_virtual_cloud_network_dimensions['height']);

    console.info('Gateways Dimensions      : ' + JSON.stringify(max_gateway_dimensions));
    console.info('Subnets Dimensions       : ' + JSON.stringify(max_subnet_dimensions));
    console.info('Overall Dimensions       : ' + JSON.stringify(dimensions));

    console.groupEnd();
    return dimensions;
}

function newVirtualCloudNetworkDefinition(artifact, position=0) {
    let dimensions = getVirtualCloudNetworkDimensions(artifact['id']);
    let definition = newArtifactSVGDefinition(artifact, virtual_cloud_network_artifact);
    definition['svg']['x'] = Math.round(icon_width * 3 / 2);
    definition['svg']['y'] = Math.round((icon_height * 2) + (icon_height * position) + (icon_spacing * position));
    // Retrieve all Virtual Cloud Networks in the parent svg and calculate vertical position
    $('#' + artifact['parent_id'] + '-svg').children('svg[data-type="' + virtual_cloud_network_artifact + '"]').each(
        function() {
            console.info('Width  : ' + $(this).attr('width'));
            console.info('Height : ' + $(this).attr('height'));
            definition['svg']['y'] += Number($(this).attr('height'));
        });
    definition['svg']['width'] = dimensions['width'];
    definition['svg']['height'] = dimensions['height'];
    definition['rect']['stroke']['colour'] = virtual_cloud_network_stroke_colour;
    definition['rect']['stroke']['dash'] = 5;
    definition['icon']['x_translation'] = icon_translate_x_start;
    definition['icon']['y_translation'] = icon_translate_y_start;
    definition['name']['show'] = true;
    definition['label']['show'] = true;
    definition['info']['show'] = true;
    definition['info']['text'] = artifact['cidr_block'];
    if (!okitJson['canvas']['virtual_cloud_networks'].hasOwnProperty(artifact['id'])) {
        okitJson['canvas']['virtual_cloud_networks'][artifact['id']] = {svg:{x:0, y:0, width:0, height:0}};
    }
    okitJson['canvas']['virtual_cloud_networks'][artifact['id']]['svg'] = definition['svg'];
    return definition;
}

function drawVirtualCloudNetworkSVG(artifact) {
    let parent_id = artifact['compartment_id'];
    artifact['parent_id'] = parent_id;
    let id = artifact['id'];
    let compartment_id = artifact['compartment_id'];
    console.groupCollapsed('Drawing ' + virtual_cloud_network_artifact + ' : ' + id + ' [' + parent_id + ']');
    console.info(JSON.stringify(compartment_bui_sub_artifacts));

    if (!compartment_bui_sub_artifacts.hasOwnProperty(parent_id)) {
        compartment_bui_sub_artifacts[parent_id] = {};
    }

    if (compartment_bui_sub_artifacts.hasOwnProperty(parent_id)) {
        if (!compartment_bui_sub_artifacts[parent_id].hasOwnProperty('virtual_cloud_network_position')) {
            compartment_bui_sub_artifacts[parent_id]['virtual_cloud_network_position'] = 0;
        }
        // Calculate Position
        let position = compartment_bui_sub_artifacts[parent_id]['virtual_cloud_network_position'];
        // Increment Icon Position
        compartment_bui_sub_artifacts[parent_id]['virtual_cloud_network_position'] += 1;

        let svg = drawArtifact(newVirtualCloudNetworkDefinition(artifact, position));

        //loadVirtualCloudNetworkProperties(id);
        // Add click event to display properties
        // Add Drag Event to allow connector (Currently done a mouse events because SVG does not have drag version)
        // Add dragevent versions
        // Set common attributes on svg element and children
        svg.on("click", function () {
            loadVirtualCloudNetworkProperties(id);
            d3.event.stopPropagation();
        });

        initialiseVirtualCloudNetworkChildData(id);
    } else {
        console.info(parent_id + ' was not found in compartment sub artifacts : ' + JSON.stringify(compartment_bui_sub_artifacts));
    }
    console.groupEnd();
}

/*
** Property Sheet Load function
 */
function loadVirtualCloudNetworkProperties(id) {
    $("#properties").load("propertysheets/virtual_cloud_network.html", function () {
        if ('virtual_cloud_networks' in okitJson) {
            console.info('Loading Virtual Cloud Network: ' + id);
            let json = okitJson['virtual_cloud_networks'];
            for (let i = 0; i < json.length; i++) {
                let virtual_cloud_network = json[i];
                //console.info(JSON.stringify(virtual_cloud_network, null, 2));
                if (virtual_cloud_network['id'] == id) {
                    // Load Properties
                    loadProperties(virtual_cloud_network);
                    // Add Event Listeners
                    addPropertiesEventListeners(virtual_cloud_network, []);
                    break;
                }
            }
        }
    });
}

/*
** Query OCI
 */

function queryVirtualCloudNetworkAjax(compartment_id) {
    console.info('------------- queryVirtualCloudNetworkAjax --------------------');
    let request_json = {};
    request_json['compartment_id'] = compartment_id;
    if ('virtual_cloud_network_filter' in okitQueryRequestJson) {
        request_json['virtual_cloud_network_filter'] = okitQueryRequestJson['virtual_cloud_network_filter'];
    }
    $.ajax({
        type: 'get',
        url: 'oci/artifacts/VirtualCloudNetwork',
        dataType: 'text',
        contentType: 'application/json',
        //data: JSON.stringify(okitQueryRequestJson),
        data: JSON.stringify(request_json),
        success: function(resp) {
            let response_json = JSON.parse(resp);
            okitJson['virtual_cloud_networks'] = response_json;
            let len =  response_json.length;
            if (len > 0) {
                for (let i = 0; i < len; i++) {
                    console.info('queryVirtualCloudNetworkAjax : ' + response_json[i]['display_name']);
                    virtual_cloud_network_count += 1;
                    /*
                    queryInternetGatewayAjax(compartment_id, response_json[i]['id']);
                    queryNATGatewayAjax(compartment_id, response_json[i]['id']);
                    queryRouteTableAjax(compartment_id, response_json[i]['id']);
                    querySecurityListAjax(compartment_id, response_json[i]['id']);
                    querySubnetAjax(compartment_id, response_json[i]['id']);
                    */
                    initiateVirtualCloudNetworkSubQueries(compartment_id, response_json[i]['id']);
                }
            } else {
                // Do this to clear check boxes
                initiateVirtualCloudNetworkSubQueries(compartment_id, null);
            }
            redrawSVGCanvas();
            $('#' + virtual_cloud_network_query_cb).prop('checked', true);
            hideQueryProgressIfComplete();
        },
        error: function(xhr, status, error) {
            console.info('Status : '+ status)
            console.info('Error  : '+ error)
        }
    });
}

function initiateVirtualCloudNetworkSubQueries(compartment_id, id='') {
    queryInternetGatewayAjax(compartment_id, id);
    queryNATGatewayAjax(compartment_id, id);
    queryServiceGatewayAjax(compartment_id, id);
    queryRouteTableAjax(compartment_id, id);
    querySecurityListAjax(compartment_id, id);
    querySubnetAjax(compartment_id, id);
}

$(document).ready(function() {
    clearVirtualCloudNetworkVariables();

    // Setup Search Checkbox
    let body = d3.select('#query-progress-tbody');
    let row = body.append('tr');
    let cell = row.append('td');
    cell.append('input')
        .attr('type', 'checkbox')
        .attr('id', virtual_cloud_network_query_cb);
    cell.append('label').text(virtual_cloud_network_artifact);

    // Setup Query Display Form
    body = d3.select('#query-oci-tbody');
    row = body.append('tr');
    cell = row.append('td')
        .text(virtual_cloud_network_artifact);
    cell = row.append('td');
    let input = cell.append('input')
        .attr('type', 'text')
        .attr('class', 'query-filter')
        .attr('id', 'virtual_cloud_network_name_filter')
        .attr('name', 'virtual_cloud_network_name_filter');
});

