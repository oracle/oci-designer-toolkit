console.log('Loaded Internet Gateway Javascript');

/*
** Set Valid drop Targets
 */
asset_drop_targets[subnet_artifact] = [virtual_cloud_network_artifact];
asset_connect_targets[subnet_artifact] = [];
asset_add_functions[subnet_artifact] = "addSubnet";
asset_update_functions[subnet_artifact] = "updateSubnet";
asset_delete_functions[subnet_artifact] = "deleteSubnet";
asset_clear_functions.push("clearSubnetVariables");

const subnet_stroke_colour = "orange";
const subnet_query_cb = "subnet-query-cb";
let subnet_svg_height = 300;
let subnet_svg_width = 1500;
let subnet_ids = [];
let subnet_count = 0;
let subnet_bui_sub_artifacts = {};
let subnet_cidr = {};

/*
** Reset variables
 */

function clearSubnetVariables() {
    subnet_ids = [];
    subnet_count = 0;
    subnet_bui_sub_artifacts = {};
    subnet_cidr = {};
}

/*
** Add Asset to JSON Model
 */
function addSubnet(vcn_id, compartment_id) {
    let id = 'okit-' + subnet_prefix + '-' + uuidv4();
    console.log('Adding Subnet : ' + id);

    // Add Virtual Cloud Network to JSON

    if (!OKITJsonObj.hasOwnProperty('subnets')) {
        OKITJsonObj['subnets'] = [];
    }

    // Add id & empty name to id JSON
    okitIdsJsonObj[id] = '';
    subnet_ids.push(id);

    // Increment Count
    subnet_count += 1;
    // Generate Cidr
    let vcn_cidr = '10.0.0.0/16';
    for (let virtual_cloud_network of OKITJsonObj['virtual_cloud_networks']) {
        if (virtual_cloud_network['id'] == vcn_id) {
            vcn_cidr = virtual_cloud_network['cidr_block'];
            break;
        }
    }
    let vcn_octets = vcn_cidr.split('/')[0].split('.');
    subnet_cidr[id] = vcn_octets[0] + '.' + vcn_octets[1] + '.' + (subnet_count - 1) + '.' + vcn_octets[3] + '/24';
    // Build Subnet Object
    let subnet = {};
    subnet['vcn_id'] = vcn_id;
    subnet['virtual_cloud_network'] = '';
    subnet['compartment_id'] = compartment_id;
    subnet['id'] = id;
    subnet['display_name'] = generateDefaultName(subnet_prefix, subnet_count);
    subnet['cidr_block'] = subnet_cidr[id];
    subnet['dns_label'] = subnet['display_name'].toLowerCase().slice(-5);
    subnet['route_table'] = '';
    subnet['route_table_id'] = '';
    subnet['security_lists'] = [];
    subnet['security_list_ids'] = [];
    OKITJsonObj['subnets'].push(subnet);
    //console.log(JSON.stringify(OKITJsonObj, null, 2));
    okitIdsJsonObj[id] = subnet['display_name'];

    //initialiseSubnetChildData(id);

    displayOkitJson();
    //drawSubnetSVG(subnet);
    drawSVGforJson();
    loadSubnetProperties(id);
}

function initialiseSubnetChildData(id) {
    // Set subnet specific positioning variables
    //subnet_bui_sub_artifacts[id] = {}
    //subnet_bui_sub_artifacts[id]['load_balancer_count'] = 0;
    //subnet_bui_sub_artifacts[id]['load_balancer_position'] = 0;
    //subnet_bui_sub_artifacts[id]['instance_count'] = 0;
    //subnet_bui_sub_artifacts[id]['instance_position'] = 0;
    // Add Sub Component positional data
    subnet_bui_sub_artifacts[id] = {
        "load_balancer_position": 0,
        "instance_position": 0
    };
}

/*
** Delete From JSON Model
 */

function deleteSubnet(id) {
    console.log('Delete Subnet ' + id);
    // Remove SVG Element
    d3.select("#" + id + "-svg").remove()
    // Remove Data Entry
    for (let i = 0; i < OKITJsonObj['subnets'].length; i++) {
        if (OKITJsonObj['subnets'][i]['id'] == id) {
            OKITJsonObj['subnets'].splice(i, 1);
        }
    }
    // Remove Sub Components
    if ('instances' in OKITJsonObj) {
        for (let i = OKITJsonObj['instances'].length - 1; i >= 0; i--) {
            let instance = OKITJsonObj['instances'][i];
            if (instance['subnet_id'] == id) {
                deleteInstance(instance['id']);
            }
        }
    }
    if ('load_balancers' in OKITJsonObj) {
        for (let i = OKITJsonObj['load_balancers'].length - 1; i >= 0; i--) {
            let load_balancer = OKITJsonObj['load_balancers'][i];
            if (load_balancer['subnet_ids'].length > 0 && load_balancer['subnet_ids'][0] == id) {
                deleteLoadBalancer(load_balancer['id']);
            }
        }
    }
}

/*
** SVG Creation
 */
function drawSubnetSVG(artifact) {
    let parent_id = artifact['vcn_id'];
    artifact['parent_id'] = parent_id;
    let id = artifact['id'];
    let compartment_id = artifact['compartment_id'];
    console.log('Drawing ' + subnet_artifact + ' : ' + id + ' [' + parent_id + ']');

    if (!virtual_cloud_network_bui_sub_artifacts.hasOwnProperty(parent_id)) {
        virtual_cloud_network_bui_sub_artifacts[parent_id] = {};
    }

    if (virtual_cloud_network_bui_sub_artifacts.hasOwnProperty(parent_id)) {
        if (!virtual_cloud_network_bui_sub_artifacts[parent_id].hasOwnProperty('subnet_position')) {
            virtual_cloud_network_bui_sub_artifacts[parent_id]['subnet_position'] = 0;
        }
        // Calculate Position
        let position = virtual_cloud_network_bui_sub_artifacts[parent_id]['subnet_position'];
        // Increment Icon Position
        virtual_cloud_network_bui_sub_artifacts[parent_id]['subnet_position'] += 1;

        let svg_x = Math.round(icon_width);
        let svg_y = Math.round((icon_height * 3) + (icon_height * position) + (icon_spacing * position));
        let svg_width = subnet_svg_width;
        let svg_height = subnet_svg_height;
        let data_type = subnet_artifact;
        let stroke_colour = subnet_stroke_colour;
        let stroke_dash = 5;

        let svg = drawArtifactSVG(artifact, data_type, svg_x, svg_y, svg_width, svg_height, stroke_colour,
            stroke_dash, true, true, icon_translate_x_start, icon_translate_y_start);

        //loadSubnetProperties(id);
        let rect = d3.select('#' + id);
        let boundingClientRect = rect.node().getBoundingClientRect();
        // Add click event to display properties
        // Add Drag Event to allow connector (Currently done a mouse events because SVG does not have drag version)
        // Add dragevent versions
        // Set common attributes on svg element and children
        svg.on("click", function () {
            loadSubnetProperties(id);
            d3.event.stopPropagation();
        });
        /*
            .on("mousedown", handleConnectorDragStart)
            .on("mousemove", handleConnectorDrag)
            .on("mouseup", handleConnectorDrop)
            .on("mouseover", handleConnectorDragEnter)
            .on("mouseout", handleConnectorDragLeave)
            .on("dragstart", handleConnectorDragStart)
            .on("drop", handleConnectorDrop)
            .on("dragenter", handleConnectorDragEnter)
            .on("dragleave", handleConnectorDragLeave)
            .on("contextmenu", handleContextMenu)
            .attr("data-connector-start-y", boundingClientRect.y + boundingClientRect.height)
            .attr("data-connector-start-x", boundingClientRect.x + (boundingClientRect.width / 2))
            .attr("data-connector-end-y", boundingClientRect.y)
            .attr("data-connector-end-x", boundingClientRect.x + (boundingClientRect.width / 2))
            .attr("data-connector-id", id)
            .attr("dragable", true)
            .selectAll("*")
            .attr("data-connector-start-y", boundingClientRect.y + boundingClientRect.height)
            .attr("data-connector-start-x", boundingClientRect.x + (boundingClientRect.width / 2))
            .attr("data-connector-end-y", boundingClientRect.y)
            .attr("data-connector-end-x", boundingClientRect.x + (boundingClientRect.width / 2))
            .attr("data-connector-id", id)
            .attr("dragable", true);
        */

        initialiseSubnetChildData(id);
    } else {
        console.log(parent_id + ' was not found in virtual cloud network sub artifacts : ' + JSON.stringify(virtual_cloud_network_bui_sub_artifacts));
    }
    // Draw any connected artifacts
    drawSubnetAttachmentsSVG(artifact);
}

function clearSubnetConnectorsSVG(subnet) {
    let id = subnet['id'];
    d3.selectAll("line[id*='" + id + "']").remove();
}

function drawSubnetConnectorsSVG(subnet) {
    let parent_id = subnet['vcn_id'];
    let id = subnet['id'];
    let boundingClientRect = d3.select("#" + id).node().getBoundingClientRect();
    let parent_svg = d3.select('#' + parent_id + "-svg");
    // Only Draw if parent exists
    if (parent_svg.node()) {
        console.log('Parent SVG : ' + parent_svg.node());
        // Define SVG position manipulation variables
        let svgPoint = parent_svg.node().createSVGPoint();
        let screenCTM = parent_svg.node().getScreenCTM();
        svgPoint.x = boundingClientRect.x + (boundingClientRect.width / 2);
        svgPoint.y = boundingClientRect.y;

        let subnetrelative = svgPoint.matrixTransform(screenCTM.inverse());
        let sourcesvg = null;

        svg = d3.select('#' + parent_id + "-svg");

        if (subnet['route_table_id'] != '') {
            let route_table_svg = d3.select("#" + subnet['route_table_id']);
            if (route_table_svg.node()) {
                boundingClientRect = route_table_svg.node().getBoundingClientRect();
                svgPoint.x = boundingClientRect.x + (boundingClientRect.width / 2);
                svgPoint.y = boundingClientRect.y + boundingClientRect.height;
                sourcesvg = svgPoint.matrixTransform(screenCTM.inverse());
                svg.append('line')
                    .attr("id", generateConnectorId(subnet['route_table_id'], id))
                    .attr("x1", sourcesvg.x)
                    .attr("y1", sourcesvg.y)
                    .attr("x2", subnetrelative.x)
                    .attr("y2", subnetrelative.y)
                    .attr("stroke-width", "2")
                    .attr("stroke", "black");
            }
        }

        if (subnet['security_list_ids'].length > 0) {
            for (let i = 0; i < subnet['security_list_ids'].length; i++) {
                let security_list_svg = d3.select("#" + subnet['security_list_ids'][i]);
                if (security_list_svg.node()) {
                    boundingClientRect = security_list_svg.node().getBoundingClientRect();
                    svgPoint.x = boundingClientRect.x + (boundingClientRect.width / 2);
                    svgPoint.y = boundingClientRect.y + boundingClientRect.height;
                    sourcesvg = svgPoint.matrixTransform(screenCTM.inverse());
                    svg.append('line')
                        .attr("id", generateConnectorId(subnet['security_list_ids'][i], id))
                        .attr("x1", sourcesvg.x)
                        .attr("y1", sourcesvg.y)
                        .attr("x2", subnetrelative.x)
                        .attr("y2", subnetrelative.y)
                        .attr("stroke-width", "2")
                        .attr("stroke", "black");
                }
            }
        }
    }
}

function drawSubnetAttachmentsSVG(subnet) {
    let id = subnet['id'];
    console.log('Drawing ' + subnet_artifact + ' : ' + id + ' Attachments');
    let attachment_count = 0;
    // Draw Route Table
    if (!OKITJsonObj.hasOwnProperty('route_tables')) {
        OKITJsonObj['route_tables'] = [];
    }
    if (OKITJsonObj.hasOwnProperty('route_tables')) {
        for (let route_table of OKITJsonObj['route_tables']) {
            if (subnet['route_table_id'] == route_table['id']) {
                let artifact_clone = JSON.parse(JSON.stringify(route_table));
                artifact_clone['parent_id'] = subnet['id'];
                drawAttachedRouteTable(artifact_clone, attachment_count);
            }
        }
    }
    attachment_count += 1;
    // Security Lists
    if (!OKITJsonObj.hasOwnProperty('security_lists')) {
        OKITJsonObj['security_lists'] = [];
    }
    for (let security_list_id of subnet['security_list_ids']) {
        for (let security_list of OKITJsonObj['security_lists']) {
            if (security_list_id == security_list['id']) {
                let artifact_clone = JSON.parse(JSON.stringify(security_list));
                artifact_clone['parent_id'] = subnet['id'];
                drawAttachedSecurityList(artifact_clone, attachment_count);
            }
        }
        attachment_count += 1;
    }
}

function drawAttachedRouteTable(artifact, attachment_count) {
    console.log('Drawing ' + subnet_artifact + ' Route Table : ' + artifact['display_name']);
    let svg_x = (icon_width * 2) + (icon_width * attachment_count) + (icon_spacing * attachment_count);
    let svg_y = 0;
    let svg_width = icon_width;
    let svg_height = icon_height;
    let data_type = route_table_artifact;
    let stroke_colour = route_table_stroke_colour;
    let stroke_dash = 1;
    // Draw Block Storage Volume
    let svg = drawArtifactSVG(artifact, data_type, svg_x, svg_y, svg_width, svg_height, stroke_colour, stroke_dash);
    // Add click event to display properties
    svg.on("click", function () {
        loadRouteTableProperties(artifact['id']);
        d3.event.stopPropagation();
    });
}

function drawAttachedSecurityList(artifact, attachment_count) {
    console.log('Drawing ' + subnet_artifact + ' Security List : ' + artifact['display_name']);
    let svg_x = (icon_width * 2) + (icon_width * attachment_count) + (icon_spacing * attachment_count);
    let svg_y = 0;
    let svg_width = icon_width;
    let svg_height = icon_height;
    let data_type = security_list_artifact;
    let stroke_colour = security_list_stroke_colour;
    let stroke_dash = 1;
    // Draw Block Storage Volume
    let svg = drawArtifactSVG(artifact, data_type, svg_x, svg_y, svg_width, svg_height, stroke_colour, stroke_dash);
    // Add click event to display properties
    svg.on("click", function () {
        loadSecurityListProperties(artifact['id']);
        d3.event.stopPropagation();
    });
}

/*
** Property Sheet Load function
 */
function loadSubnetProperties(id) {
    $("#properties").load("propertysheets/subnet.html", function () {
        let name_id_mapping = {
            "security_lists": "security_list_ids",
            "security_list_ids": "security_lists",
            "route_table": "route_table_id",
            "route_table_id": "route_table"
        };
        if ('subnets' in OKITJsonObj) {
            console.log('Loading Subnet: ' + id);
            let json = OKITJsonObj['subnets'];
            for (let i = 0; i < json.length; i++) {
                let subnet = json[i];
                //console.log(JSON.stringify(subnet, null, 2));
                if (subnet['id'] == id) {
                    //console.log('Found Subnet: ' + id);
                    subnet['virtual_cloud_network'] = okitIdsJsonObj[subnet['vcn_id']];
                    $("#virtual_cloud_network").html(subnet['virtual_cloud_network']);
                    $('#display_name').val(subnet['display_name']);
                    $('#cidr_block').val(subnet['cidr_block']);
                    $('#dns_label').val(subnet['dns_label']);
                    let route_table_select = $('#route_table_id');
                    //console.log('Route Table Ids: ' + route_table_ids);
                    for (let rtid of route_table_ids) {
                        route_table_select.append($('<option>').attr('value', rtid).text(okitIdsJsonObj[rtid]));
                    }
                    route_table_select.val(subnet['route_table_id']);
                    let security_lists_select = $('#security_list_ids');
                    //console.log('Security List Ids: ' + security_list_ids);
                    for (let slid of security_list_ids) {
                        security_lists_select.append($('<option>').attr('value', slid).text(okitIdsJsonObj[slid]));
                    }
                    security_lists_select.val(subnet['security_list_ids']);
                    // Add Event Listeners
                    //addPropertiesEventListeners(subnet, [clearSubnetConnectorsSVG, drawSubnetConnectorsSVG]);
                    //addPropertiesEventListeners(subnet, [drawSubnetAttachmentsSVG]);
                    addPropertiesEventListeners(subnet, [drawSVGforJson]);
                    break;
                }
            }
        }
    });
}

/*
** OKIT Json Update Function
 */
function updateSubnet(sourcetype, sourceid, id) {
    let subnets = OKITJsonObj['subnets'];
    console.log('Updating Subnet ' + id + ' Adding ' + sourcetype + ' ' + sourceid);
    for (let i = 0; i < subnets.length; i++) {
        subnet = subnets[i];
        //console.log('Before : ' + JSON.stringify(subnet, null, 2));
        if (subnet['id'] == id) {
            if (sourcetype == route_table_artifact) {
                if (subnet['route_table_id'] != '') {
                    // Only single Route Table allow so delete existing line.
                    console.log('Deleting Connector : ' + generateConnectorId(subnet['route_table_id'], id));
                    d3.select("#" + generateConnectorId(subnet['route_table_id'], id)).remove();
                }
                subnet['route_table_id'] = sourceid;
                subnet['route_table'] = okitIdsJsonObj[sourceid];
            } else if (sourcetype == security_list_artifact) {
                if (subnet['security_list_ids'].indexOf(sourceid) > 0) {
                    // Already connected so delete existing line
                    //console.log('Deleting Connector : ' + generateConnectorId(sourceid, id));
                    d3.select("#" + generateConnectorId(sourceid, id)).remove();
                } else {
                    subnet['security_list_ids'].push(sourceid);
                    subnet['security_lists'].push(okitIdsJsonObj[sourceid]);
                }
            }
        }
        //console.log('After : ' + JSON.stringify(subnet, null, 2));
    }
    displayOkitJson();
    loadSubnetProperties(id);
}

/*
** Query OCI
 */

function querySubnetAjax(compartment_id, vcn_id) {
    console.log('------------- querySubnetAjax --------------------');
    let request_json = {};
    request_json['compartment_id'] = compartment_id;
    request_json['vcn_id'] = vcn_id;
    if ('subnet_filter' in okitQueryRequestJson) {
        request_json['subnet_filter'] = okitQueryRequestJson['subnet_filter'];
    }
    $.ajax({
        type: 'get',
        url: 'oci/artifacts/Subnet',
        dataType: 'text',
        contentType: 'application/json',
        data: JSON.stringify(request_json),
        success: function (resp) {
            let response_json = JSON.parse(resp);
            OKITJsonObj['subnets'] = response_json;
            let len = response_json.length;
            for (let i = 0; i < len; i++) {
                console.log('querySubnetAjax : ' + response_json[i]['display_name']);
                queryInstanceAjax(compartment_id, response_json[i]['id']);
                queryLoadBalancerAjax(compartment_id, response_json[i]['id']);
            }
            redrawSVGCanvas();
            $('#' + subnet_query_cb).prop('checked', true);
            hideQueryProgressIfComplete();
        },
        error: function (xhr, status, error) {
            console.log('Status : ' + status)
            console.log('Error : ' + error)
        }
    });
}

$(document).ready(function () {
    clearSubnetVariables();

    let body = d3.select('#query-progress-tbody');
    let row = body.append('tr');
    let cell = row.append('td');
    cell.append('input')
        .attr('type', 'checkbox')
        .attr('id', subnet_query_cb);
    cell.append('label').text(subnet_artifact);
});

