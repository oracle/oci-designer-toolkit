console.log('Loaded Virtual Cloud Network Javascript');

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
let vcn_svg_width = "99%"
let vcn_svg_height = "70%"
let vcn_rect_width = "95%"
let vcn_rect_height = "85%"
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
    console.log('Adding Virtual Cloud Network : ' + id);

    // Add Virtual Cloud Network to JSON

    if (!OKITJsonObj.hasOwnProperty('virtual_cloud_networks')) {
        OKITJsonObj['virtual_cloud_networks'] = [];
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
    OKITJsonObj['virtual_cloud_networks'].push(virtual_cloud_network);
    okitIdsJsonObj[id] = virtual_cloud_network['display_name'];
    //console.log(JSON.stringify(OKITJsonObj, null, 2));
    displayOkitJson();
    drawVirtualCloudNetworkSVG(virtual_cloud_network);
    loadVirtualCloudNetworkProperties(id);
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
    console.log('Delete Virtual Cloud Network ' + id);
    // Remove SVG Element
    d3.select("#" + id + "-svg").remove()
    // Remove Data Entry
    for (let i=0; i < OKITJsonObj['virtual_cloud_networks'].length; i++) {
        if (OKITJsonObj['virtual_cloud_networks'][i]['id'] == id) {
            OKITJsonObj['virtual_cloud_networks'].splice(i, 1);
        }
    }
    // Remove Sub Components
    if ('internet_gateways' in OKITJsonObj) {
        for (let i = OKITJsonObj['internet_gateways'].length - 1; i >= 0; i--) {
            let internet_gateway = OKITJsonObj['internet_gateways'][i];
            if (internet_gateway['vcn_id'] == id) {
                deleteInternetGateway(internet_gateway['id']);
            }
        }
    }
    if ('subnets' in OKITJsonObj) {
        for (let i = OKITJsonObj['subnets'].length - 1; i >= 0; i--) {
            let subnet = OKITJsonObj['subnets'][i];
            if (subnet['vcn_id'] == id) {
                deleteSubnet(subnet['id']);
            }
        }
    }
    if ('route_tables' in OKITJsonObj) {
        for (let i = OKITJsonObj['route_tables'].length - 1; i >= 0; i--) {
            let route_table = OKITJsonObj['route_tables'][i];
            if (route_table['vcn_id'] == id) {
                deleteRouteTable(route_table['id']);
            }
        }
    }
    if ('security_lists' in OKITJsonObj) {
        for (let i = OKITJsonObj['security_lists'].length - 1; i >= 0; i--) {
            let security_list = OKITJsonObj['security_lists'][i];
            if (security_list['vcn_id'] == id) {
                deleteSecurityList(security_list['id']);
            }
        }
    }
}

/*
** SVG Creation
 */
function getVirtualCloudNetworkDimensions(id='') {
    return {width:2000, height:800};
}

function newVirtualCloudNetworkDefinition(artifact, position=0) {
    let dimensions = getVirtualCloudNetworkDimensions();
    let definition = newArtifactSVGDefinition(artifact, virtual_cloud_network_artifact);
    definition['svg']['x'] = Math.round(icon_width * 3 / 2);
    definition['svg']['y'] = Math.round((icon_height * 2) + (icon_height * position) + (icon_spacing * position));
    definition['svg']['width'] = 2000;
    definition['svg']['height'] = 500;
    definition['rect']['stroke']['colour'] = virtual_cloud_network_stroke_colour;
    definition['rect']['stroke']['dash'] = 5;
    definition['icon']['x_translation'] = icon_translate_x_start;
    definition['icon']['y_translation'] = icon_translate_y_start;
    definition['name']['show'] = true;
    definition['label']['show'] = true;
    return definition;
}

function drawVirtualCloudNetworkSVG(artifact) {
    let parent_id = artifact['compartment_id'];
    artifact['parent_id'] = parent_id;
    let id = artifact['id'];
    let compartment_id = artifact['compartment_id'];
    console.log('Drawing Virtual Cloud Network : ' + id + ' [' + parent_id + ']');
    console.log(JSON.stringify(compartment_bui_sub_artifacts));

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

        /*
        let artifact_definition = newArtifactSVGDefinition(artifact, virtual_cloud_network_artifact);
        artifact_definition['svg']['x'] = Math.round(icon_width * 3 / 2);
        artifact_definition['svg']['y'] = Math.round((icon_height * 2) + (icon_height * position) + (icon_spacing * position));
        artifact_definition['svg']['width'] = 2000;
        artifact_definition['svg']['height'] = 500;
        artifact_definition['rect']['stroke']['colour'] = virtual_cloud_network_stroke_colour;
        artifact_definition['rect']['stroke']['dash'] = 5;
        artifact_definition['icon']['x_translation'] = icon_translate_x_start;
        artifact_definition['icon']['y_translation'] = icon_translate_y_start;
        artifact_definition['name']['show'] = true;
        artifact_definition['label']['show'] = true;
        */

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
        console.log(parent_id + ' was not found in compartment sub artifacts : ' + JSON.stringify(compartment_bui_sub_artifacts));
    }
}

/*
** Property Sheet Load function
 */
function loadVirtualCloudNetworkProperties(id) {
    $("#properties").load("propertysheets/virtual_cloud_network.html", function () {
        if ('virtual_cloud_networks' in OKITJsonObj) {
            console.log('Loading Virtual Cloud Network: ' + id);
            let json = OKITJsonObj['virtual_cloud_networks'];
            for (let i = 0; i < json.length; i++) {
                let virtual_cloud_network = json[i];
                //console.log(JSON.stringify(virtual_cloud_network, null, 2));
                if (virtual_cloud_network['id'] == id) {
                    //console.log('Found Virtual Cloud Network: ' + id);
                    $('#display_name').val(virtual_cloud_network['display_name']);
                    $('#cidr_block').val(virtual_cloud_network['cidr_block']);
                    $('#dns_label').val(virtual_cloud_network['dns_label']);
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
    console.log('------------- queryVirtualCloudNetworkAjax --------------------');
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
            OKITJsonObj['virtual_cloud_networks'] = response_json;
            let len =  response_json.length;
            for(let i=0;i<len;i++ ) {
                console.log('queryVirtualCloudNetworkAjax : ' + response_json[i]['display_name']);
                virtual_cloud_network_count += 1;
                queryInternetGatewayAjax(compartment_id, response_json[i]['id']);
                queryNATGatewayAjax(compartment_id, response_json[i]['id']);
                queryRouteTableAjax(compartment_id, response_json[i]['id']);
                querySecurityListAjax(compartment_id, response_json[i]['id']);
                querySubnetAjax(compartment_id, response_json[i]['id']);
            }
            redrawSVGCanvas();
            $('#' + virtual_cloud_network_query_cb).prop('checked', true);
            hideQueryProgressIfComplete();
        },
        error: function(xhr, status, error) {
            console.log('Status : '+ status)
            console.log('Error : '+ error)
        }
    });
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

