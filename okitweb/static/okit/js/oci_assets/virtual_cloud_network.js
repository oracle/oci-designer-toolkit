console.log('Loaded Virtual Cloud Network Javascript');

/*
** Set Valid drop Targets
 */
asset_drop_targets[virtual_cloud_network_artifact] = [compartment_artifact];
asset_connect_targets[virtual_cloud_network_artifact] = [];
asset_add_functions[virtual_cloud_network_artifact] = "addVirtualCloudNetwork";
asset_delete_functions[virtual_cloud_network_artifact] = "deleteVirtualCloudNetwork";

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
    // Generate Cidr
    virtual_cloud_network_cidr[id] = '10.' + (virtual_cloud_network_count - 1) + '.0.0/16';
    // Build Virtual Cloud Network Object
    let virtual_cloud_network = {};
    virtual_cloud_network['compartment_id'] = compartment_id;
    virtual_cloud_network['id'] = id;
    virtual_cloud_network['display_name'] = generateDefaultName(virtual_cloud_network_prefix, virtual_cloud_network_count);
    virtual_cloud_network['cidr_block'] = virtual_cloud_network_cidr[id];
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
function drawVirtualCloudNetworkSVG(virtual_cloud_network) {
    let parent_id = virtual_cloud_network['compartment_id'];
    let id = virtual_cloud_network['id'];
    let compartment_id = virtual_cloud_network['compartment_id'];
    console.log('Drawing Virtual Cloud Network : ' + id);
    if (compartment_bui_sub_artifacts.hasOwnProperty(parent_id)) {
        if (!compartment_bui_sub_artifacts[parent_id].hasOwnProperty('virtual_cloud_network_position')) {
            compartment_bui_sub_artifacts[parent_id]['virtual_cloud_network_position'] = 0;
        }
        let position = compartment_bui_sub_artifacts[parent_id]['virtual_cloud_network_position'];
        let svg_x = Math.round(icon_width * 3 / 2);
        let svg_y = Math.round((icon_height / 4) * 3 + (icon_height * position) + (vcn_icon_spacing * position));
        let data_type = virtual_cloud_network_artifact;

        // Increment Icon Position
        compartment_bui_sub_artifacts[parent_id]['virtual_cloud_network_position'] += 1;

        //let parent_svg = d3.select(okitcanvas);
        let parent_svg = d3.select('#' + parent_id + "-svg");
        let asset_svg = parent_svg.append("svg")
            .attr("id", id + '-svg')
            .attr("data-type", data_type)
            .attr("title", virtual_cloud_network['display_name'])
            .attr("x", svg_x)
            .attr("y", svg_y)
            .attr("width", vcn_svg_width)
            .attr("height", vcn_svg_height);
        let svg = asset_svg.append("svg")
            .attr("id", id + '-asset-svg')
            .attr("data-type", data_type)
            .attr("title", virtual_cloud_network['display_name'])
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", "100%")
            .attr("height", "100%");
        let rect = svg.append("rect")
            .attr("id", id)
            .attr("data-type", data_type)
            .attr("title", virtual_cloud_network['display_name'])
            .attr("x", icon_width / 2)
            .attr("y", icon_height / 2)
            .attr("width", vcn_rect_width)
            .attr("height", vcn_rect_height)
            .attr("stroke", virtual_cloud_network_stroke_colour)
            .attr("stroke-dasharray", "5, 5")
            .attr("fill", "white");
        rect.append("title")
            .attr("id", id + '-title')
            .text("Virtual Cloud Network: " + virtual_cloud_network['display_name']);
        let text = svg.append("text")
            .attr("id", id + '-display-name')
            .attr("data-type", data_type)
            .attr("data-parentid", parent_id)
            .attr("x", icon_x + icon_width / 3)
            .attr("y", icon_y + icon_height / 3)
            .text(virtual_cloud_network['display_name']);
        let g = svg.append("g")
            .attr("transform", "translate(-20, -20) scale(0.3, 0.3)");
        g.append("path")
            .attr("class", "st0")
            .attr("d", "M143.4,154.1c-0.4,0.8-0.9,1.5-1.5,2l6,15.2c0.1,0,0.2,0,0.3,0c0.9,0,1.8,0.3,2.6,0.7l14.7-14.3c-0.2-0.4-0.4-0.8-0.5-1.3L143.4,154.1z")
        g.append("path")
            .attr("class", "st0")
            .attr("d", "M138.2,157.5c-2.2,0-4-1.2-5-3l-10.2,1.7c0,0.3-0.1,0.5-0.2,0.8l21.6,15.2l-5.8-14.7C138.4,157.4,138.3,157.5,138.2,157.5z")
        g.append("path")
            .attr("class", "st0")
            .attr("d", "M134.4,147.7l-8.6-18.7c-0.1,0-0.1,0-0.2,0l-5.2,21.4c0.9,0.5,1.6,1.3,2,2.2l10.2-1.7C132.9,149.7,133.5,148.5,134.4,147.7z")
        g.append("path")
            .attr("class", "st0")
            .attr("d", "M138.2,146.2c0.9,0,1.8,0.2,2.5,0.6l19.9-20c-0.1-0.3-0.3-0.6-0.4-0.9l-29.9-0.6c-0.3,0.9-0.8,1.6-1.5,2.3l8.6,18.7C137.8,146.2,138,146.2,138.2,146.2z")
        g.append("path")
            .attr("class", "st0")
            .attr("d", "M163.2,129.3l-19.9,20c0.2,0.4,0.4,0.9,0.5,1.4l21.7,2.3c0.5-1.2,1.4-2.1,2.6-2.7l-3.2-20.4C164.2,129.7,163.7,129.5,163.2,129.3z")
        g.append("path")
            .attr("class", "st0")
            .attr("d", "M144,87.8c-31,0-56.2,25.2-56.2,56.2c0,31,25.2,56.2,56.2,56.2s56.2-25.2,56.2-56.2C200.2,113,175,87.8,144,87.8z M170.6,160.9c-0.9,0-1.8-0.3-2.6-0.7l-14.7,14.3c0.4,0.7,0.6,1.6,0.6,2.5c0,3.1-2.5,5.6-5.6,5.6s-5.6-2.5-5.6-5.6c0-0.6,0.1-1.1,0.3-1.7l-22-15.5c-0.9,0.7-2.1,1.1-3.4,1.1c-3.1,0-5.6-2.5-5.6-5.6c0-3,2.3-5.4,5.2-5.6l5.2-21.4c-1.6-1-2.7-2.8-2.7-4.8c0-3.1,2.5-5.6,5.6-5.6c2.5,0,4.7,1.7,5.4,4l29.9,0.6c0.8-2.2,2.8-3.8,5.3-3.8c3.1,0,5.6,2.5,5.6,5.6c0,2.2-1.3,4.1-3.1,5l3.2,20.4c2.7,0.4,4.7,2.7,4.7,5.6C176.2,158.4,173.7,160.9,170.6,160.9z");

        //loadVirtualCloudNetworkProperties(id);
        // Add click event to display properties
        // Add Drag Event to allow connector (Currently done a mouse events because SVG does not have drag version)
        // Add dragevent versions
        // Set common attributes on svg element and children
        svg.on("click", function () {
            loadVirtualCloudNetworkProperties(id);
            d3.event.stopPropagation();
        })
            .on("mousemove", handleConnectorDrag)
            .on("mouseup", handleConnectorDrop)
            .on("dragenter", handleConnectorDragEnter)
            .on("dragleave", handleConnectorDragLeave)
            .on("contextmenu", handleContextMenu)
            .attr("data-type", data_type)
            .attr("data-okit-id", id)
            .attr("data-parentid", parent_id)
            .attr("data-compartment-id", compartment_id)
            .selectAll("*")
                .attr("data-type", data_type)
                .attr("data-okit-id", id)
                .attr("data-parentid", parent_id)
                .attr("data-compartment-id", compartment_id);

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
            for(let i=0;i<len;i++ ){
                console.log('queryVirtualCloudNetworkAjax : ' + response_json[i]['display_name']);
                queryInternetGatewayAjax(compartment_id, response_json[i]['id']);
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

    let body = d3.select('#query-progress-tbody');
    let row = body.append('tr');
    let cell = row.append('td');
    cell.append('input')
        .attr('type', 'checkbox')
        .attr('id', virtual_cloud_network_query_cb);
    cell.append('label').text(virtual_cloud_network_artifact);
});

