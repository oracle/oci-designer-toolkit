console.info('Loaded Subnet Javascript');

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
const min_subnet_dimensions = {width:400, height:300};
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
    console.groupCollapsed('Adding ' + subnet_artifact + ' : ' + id);

    // Add Virtual Cloud Network to JSON

    if (!okitJson.hasOwnProperty('subnets')) {
        okitJson['subnets'] = [];
    }

    // Add id & empty name to id JSON
    okitIdsJsonObj[id] = '';
    subnet_ids.push(id);

    // Increment Count
    subnet_count += 1;
    // Generate Cidr
    let vcn_cidr = '10.0.0.0/16';
    for (let virtual_cloud_network of okitJson['virtual_cloud_networks']) {
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
    subnet['prohibit_public_ip_on_vnic'] = false;
    subnet['route_table'] = '';
    subnet['route_table_id'] = '';
    subnet['security_lists'] = [];
    subnet['security_list_ids'] = [];
    okitJson['subnets'].push(subnet);
    //console.info(JSON.stringify(okitJson, null, 2));
    okitIdsJsonObj[id] = subnet['display_name'];

    //initialiseSubnetChildData(id);
    //drawSubnetSVG(subnet);
    drawSVGforJson();
    loadSubnetProperties(id);
    console.groupEnd();
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
    console.groupCollapsed('Delete ' + subnet_artifact + ' : ' + id);
    // Remove SVG Element
    d3.select("#" + id + "-svg").remove()
    // Remove Data Entry
    for (let i = 0; i < okitJson['subnets'].length; i++) {
        if (okitJson['subnets'][i]['id'] == id) {
            okitJson['subnets'].splice(i, 1);
        }
    }
    // Remove Sub Components
    if ('instances' in okitJson) {
        for (let i = okitJson['instances'].length - 1; i >= 0; i--) {
            let instance = okitJson['instances'][i];
            if (instance['subnet_id'] == id) {
                deleteInstance(instance['id']);
            }
        }
    }
    if ('load_balancers' in okitJson) {
        for (let i = okitJson['load_balancers'].length - 1; i >= 0; i--) {
            let load_balancer = okitJson['load_balancers'][i];
            if (load_balancer['subnet_ids'].length > 0 && load_balancer['subnet_ids'][0] == id) {
                deleteLoadBalancer(load_balancer['id']);
            }
        }
    }
    console.groupEnd();
}

/*
** SVG Creation
 */
function getSubnetDimensions(id='') {
    console.groupCollapsed('Getting Dimensions of ' + subnet_artifact + ' : ' + id);
    let dimensions = {width:container_artifact_x_padding * 2, height:container_artifact_y_padding * 2};
    let max_load_balancer_dimensions = {width:0, height: 0, count:0};
    let max_instance_dimensions = {width:0, height: 0, count:0};
    let max_edge_dimensions = {width:0, height: 0, count:0};
    // Get Subnet Details
    let subnet = {};
    for (subnet of okitJson['subnets']) {
        if (id == subnet['id']) {
            break;
        }
    }
    // Process Edge Artifacts
    if (okitJson.hasOwnProperty('security_lists')) {
        for (let security_list of okitJson['security_lists']) {
            if (subnet['security_list_ids'].indexOf(security_list['id']) >= 0) {
                let edge_dimensions = getSecurityListDimensions(security_list['id']);
                max_edge_dimensions['width'] += edge_dimensions['width'];
                max_edge_dimensions['height'] = Math.max(max_edge_dimensions['height'], edge_dimensions['height']);
                max_edge_dimensions['count'] += 1;
            }
        }
    }
    if (okitJson.hasOwnProperty('route_tables')) {
        for (let route_table of okitJson['route_tables']) {
            if (subnet['route_table_id'] == route_table['id']) {
                let edge_dimensions = getRouteTableDimensions(route_table['id']);
                max_edge_dimensions['width'] += edge_dimensions['width'];
                max_edge_dimensions['height'] = Math.max(max_edge_dimensions['height'], edge_dimensions['height']);
                max_edge_dimensions['count'] += 1;
            }
        }
    }
    // Process Load Balancers
    if (okitJson.hasOwnProperty('load_balancers')) {
        for (let load_balancer of okitJson['load_balancers']) {
            if (load_balancer['subnet_ids'][0] == id) {
                let load_balancer_dimensions = getLoadBalancerDimensions(load_balancer['id']);
                max_load_balancer_dimensions['width'] += load_balancer_dimensions['width'];
                max_load_balancer_dimensions['height'] = Math.max(max_load_balancer_dimensions['height'], load_balancer_dimensions['height']);
                max_load_balancer_dimensions['count'] += 1;
            }
        }
    }
    // Process Instances
    if (okitJson.hasOwnProperty('instances')) {
        for (let instance of okitJson['instances']) {
            if (instance['subnet_id'] == id) {
                let instance_dimensions = getInstanceDimensions(instance['id']);
                max_instance_dimensions['width'] += instance_dimensions['width'];
                max_instance_dimensions['height'] = Math.max(max_instance_dimensions['height'], instance_dimensions['height']);
                max_instance_dimensions['count'] += 1;
            }
        }
    }
    // Calculate Width which will be the largest based on load balancers or instances
    dimensions['width'] += Math.max((max_instance_dimensions['width'] + icon_spacing * max_instance_dimensions['count']),
        (max_load_balancer_dimensions['width'] + icon_spacing * max_load_balancer_dimensions['count']),
        (max_edge_dimensions['width'] + icon_spacing * max_edge_dimensions['count']));
    // Add load balancer and instance height to size of subnet
    dimensions['height'] += max_load_balancer_dimensions['height'];
    dimensions['height'] += max_instance_dimensions['height'];
    dimensions['height'] += icon_height;
    // Check size against minimum
    dimensions['width'] = Math.max(dimensions['width'], min_subnet_dimensions['width']);
    dimensions['height'] = Math.max(dimensions['height'], min_subnet_dimensions['height']);

    console.info('Load Balancer Dimensions : ' + JSON.stringify(max_load_balancer_dimensions));
    console.info('Instance Dimensions      : ' + JSON.stringify(max_instance_dimensions));
    console.info('Edges Dimensions         : ' + JSON.stringify(max_edge_dimensions));
    console.info('Overall Dimensions       : ' + JSON.stringify(dimensions));

    console.groupEnd();
    return dimensions;
}

function newSubnetDefinition(artifact, position=0) {
    let dimensions = getSubnetDimensions(artifact['id']);
    let definition = newArtifactSVGDefinition(artifact, subnet_artifact);
    definition['svg']['x'] = positional_adjustments.padding.x;
    //definition['svg']['y'] = Math.round((icon_height * 3) + ((icon_height / 2) * position) + (icon_spacing * position));
    definition['svg']['y'] = Math.round(positional_adjustments.padding.y  + (positional_adjustments.spacing.y * position));
    // Check if the VCN has Security Lists or Route Tables Attached if so leave space
    if (hasUnattachedSecurityList(artifact['vcn_id']) || hasUnattachedRouteTable(artifact['vcn_id'])) {
        // Add Space for Security List / Route Table
        definition['svg']['y'] += positional_adjustments.padding.y + positional_adjustments.spacing.y;
    }
    // Retrieve all Subnets in the parent svg and calculate vertical position
    $('#' + artifact['parent_id'] + '-svg').children('svg[data-type="' + subnet_artifact + '"]').each(
        function() {
            console.info('Width  : ' + $(this).attr('width'));
            console.info('Height : ' + $(this).attr('height'));
            definition['svg']['y'] += Number($(this).attr('height'));
        });
    definition['svg']['width'] = dimensions['width'];
    definition['svg']['height'] = dimensions['height'];
    definition['rect']['stroke']['colour'] = subnet_stroke_colour;
    definition['rect']['stroke']['dash'] = 5;
    definition['icon']['x_translation'] = icon_translate_x_start;
    definition['icon']['y_translation'] = icon_translate_y_start;
    definition['name']['show'] = true;
    definition['label']['show'] = true;
    if (artifact['prohibit_public_ip_on_vnic']) {
        definition['label']['text'] = 'Private ' + subnet_artifact;
    } else  {
        definition['label']['text'] = 'Public ' + subnet_artifact;
    }
    definition['info']['show'] = true;
    definition['info']['text'] = artifact['cidr_block'];
    if (!okitJson['canvas']['subnets'].hasOwnProperty(artifact['id'])) {
        okitJson['canvas']['subnets'][artifact['id']] = {svg:{x:0, y:0, width:0, height:0}};
    }
    okitJson['canvas']['subnets'][artifact['id']]['svg'] = definition['svg'];
    console.info(JSON.stringify(definition));
    return definition;
}

function drawSubnetSVG(artifact) {
    let parent_id = artifact['vcn_id'];
    artifact['parent_id'] = parent_id;
    let id = artifact['id'];
    let compartment_id = artifact['compartment_id'];
    console.groupCollapsed('Drawing ' + subnet_artifact + ' : ' + id + ' [' + parent_id + ']');

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

        let svg = drawArtifact(newSubnetDefinition(artifact, position));

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

        initialiseSubnetChildData(id);
    } else {
        console.warn(parent_id + ' was not found in virtual cloud network sub artifacts : ' + JSON.stringify(virtual_cloud_network_bui_sub_artifacts));
    }
    // Draw any connected artifacts
    drawSubnetAttachmentsSVG(artifact);
    console.groupEnd();
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
        console.info('Parent SVG : ' + parent_svg.node());
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
    console.info('Drawing ' + subnet_artifact + ' : ' + id + ' Attachments');
    let attachment_count = 0;
    // Draw Route Table
    if (!okitJson.hasOwnProperty('route_tables')) {
        okitJson['route_tables'] = [];
    }
    if (okitJson.hasOwnProperty('route_tables')) {
        for (let route_table of okitJson['route_tables']) {
            if (subnet['route_table_id'] == route_table['id']) {
                let artifact_clone = JSON.parse(JSON.stringify(route_table));
                artifact_clone['parent_id'] = subnet['id'];
                drawAttachedRouteTable(artifact_clone, attachment_count);
            }
        }
    }
    attachment_count += 1;
    // Security Lists
    if (!okitJson.hasOwnProperty('security_lists')) {
        okitJson['security_lists'] = [];
    }
    for (let security_list_id of subnet['security_list_ids']) {
        for (let security_list of okitJson['security_lists']) {
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
    console.info('Drawing ' + subnet_artifact + ' Route Table : ' + artifact['display_name']);
    let artifact_definition = newRouteTableDefinition(artifact, attachment_count);
    artifact_definition['svg']['x'] = Math.round((icon_width * 2) + (icon_width * attachment_count) + (icon_spacing * attachment_count));
    artifact_definition['svg']['y'] = 0;

    let svg = drawArtifact(artifact_definition);

    /*
    let svg_x = (icon_width * 2) + (icon_width * attachment_count) + (icon_spacing * attachment_count);
    let svg_y = 0;
    let svg_width = icon_width;
    let svg_height = icon_height;
    let data_type = route_table_artifact;
    let stroke_colour = route_table_stroke_colour;
    let stroke_dash = 1;
    // Draw Block Storage Volume
    let svg = drawArtifactSVG(artifact, data_type, svg_x, svg_y, svg_width, svg_height, stroke_colour, stroke_dash);
    */
    // Add click event to display properties
    svg.on("click", function () {
        loadRouteTableProperties(artifact['id']);
        d3.event.stopPropagation();
    });
}

function drawAttachedSecurityList(artifact, attachment_count) {
    console.info('Drawing ' + subnet_artifact + ' Security List : ' + artifact['display_name']);
    let artifact_definition = newSecurityListDefinition(artifact, attachment_count);
    artifact_definition['svg']['x'] = Math.round((icon_width * 2) + (icon_width * attachment_count) + (icon_spacing * attachment_count));
    artifact_definition['svg']['y'] = 0;

    let svg = drawArtifact(artifact_definition);

    /*
    let svg_x = (icon_width * 2) + (icon_width * attachment_count) + (icon_spacing * attachment_count);
    let svg_y = 0;
    let svg_width = icon_width;
    let svg_height = icon_height;
    let data_type = security_list_artifact;
    let stroke_colour = security_list_stroke_colour;
    let stroke_dash = 1;
    // Draw Block Storage Volume
    let svg = drawArtifactSVG(artifact, data_type, svg_x, svg_y, svg_width, svg_height, stroke_colour, stroke_dash);
    */
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
        if ('subnets' in okitJson) {
            console.info('Loading Subnet: ' + id);
            let json = okitJson['subnets'];
            for (let i = 0; i < json.length; i++) {
                let subnet = json[i];
                //console.info(JSON.stringify(subnet, null, 2));
                if (subnet['id'] == id) {
                    //console.info('Found Subnet: ' + id);
                    subnet['virtual_cloud_network'] = okitIdsJsonObj[subnet['vcn_id']];
                    $("#virtual_cloud_network").html(subnet['virtual_cloud_network']);
                    $('#display_name').val(subnet['display_name']);
                    $('#cidr_block').val(subnet['cidr_block']);
                    $('#dns_label').val(subnet['dns_label']);
                    $('#prohibit_public_ip_on_vnic').attr('checked', subnet['prohibit_public_ip_on_vnic']);
                    let route_table_select = $('#route_table_id');
                    //console.info('Route Table Ids: ' + route_table_ids);
                    //for (let rtid of route_table_ids) {
                    //    route_table_select.append($('<option>').attr('value', rtid).text(okitIdsJsonObj[rtid]));
                    //}
                    for (let route_table of okitJson['route_tables']) {
                        route_table_select.append($('<option>').attr('value', route_table['id']).text(route_table['display_name']));
                    }
                    route_table_select.val(subnet['route_table_id']);
                    let security_lists_select = $('#security_list_ids');
                    //console.info('Security List Ids: ' + security_list_ids);
                    //for (let slid of security_list_ids) {
                    //    security_lists_select.append($('<option>').attr('value', slid).text(okitIdsJsonObj[slid]));
                    //}
                    for (let security_list of okitJson['security_lists']) {
                        security_lists_select.append($('<option>').attr('value', security_list['id']).text(security_list['display_name']));
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
    let subnets = okitJson['subnets'];
    console.info('Updating Subnet ' + id + ' Adding ' + sourcetype + ' ' + sourceid);
    for (let i = 0; i < subnets.length; i++) {
        subnet = subnets[i];
        //console.info('Before : ' + JSON.stringify(subnet, null, 2));
        if (subnet['id'] == id) {
            if (sourcetype == route_table_artifact) {
                if (subnet['route_table_id'] != '') {
                    // Only single Route Table allow so delete existing line.
                    console.info('Deleting Connector : ' + generateConnectorId(subnet['route_table_id'], id));
                    d3.select("#" + generateConnectorId(subnet['route_table_id'], id)).remove();
                }
                subnet['route_table_id'] = sourceid;
                subnet['route_table'] = okitIdsJsonObj[sourceid];
            } else if (sourcetype == security_list_artifact) {
                if (subnet['security_list_ids'].indexOf(sourceid) > 0) {
                    // Already connected so delete existing line
                    //console.info('Deleting Connector : ' + generateConnectorId(sourceid, id));
                    d3.select("#" + generateConnectorId(sourceid, id)).remove();
                } else {
                    subnet['security_list_ids'].push(sourceid);
                    subnet['security_lists'].push(okitIdsJsonObj[sourceid]);
                }
            }
        }
        //console.info('After : ' + JSON.stringify(subnet, null, 2));
    }
    displayOkitJson();
    loadSubnetProperties(id);
}

/*
** Query OCI
 */

function querySubnetAjax(compartment_id, vcn_id) {
    console.info('------------- querySubnetAjax --------------------');
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
            okitJson['subnets'] = response_json;
            let len = response_json.length;
            if (len > 0) {
                for (let i = 0; i < len; i++) {
                    console.info('querySubnetAjax : ' + response_json[i]['display_name']);
                    /*
                    queryInstanceAjax(compartment_id, response_json[i]['id']);
                    queryLoadBalancerAjax(compartment_id, response_json[i]['id']);
                    */
                    initiateSubnetSubQueries(compartment_id, response_json[i]['id']);
                }
            } else {
                initiateSubnetSubQueries(compartment_id, null);
            }
            redrawSVGCanvas();
            $('#' + subnet_query_cb).prop('checked', true);
            hideQueryProgressIfComplete();
        },
        error: function (xhr, status, error) {
            console.info('Status : ' + status)
            console.info('Error : ' + error)
        }
    });
}

function initiateSubnetSubQueries(compartment_id, id='') {
    queryInstanceAjax(compartment_id, id);
    queryLoadBalancerAjax(compartment_id, id);
}

$(document).ready(function () {
    clearSubnetVariables();

    // Setup Search Checkbox
    let body = d3.select('#query-progress-tbody');
    let row = body.append('tr');
    let cell = row.append('td');
    cell.append('input')
        .attr('type', 'checkbox')
        .attr('id', subnet_query_cb);
    cell.append('label').text(subnet_artifact);

    // Setup Query Display Form
    body = d3.select('#query-oci-tbody');
    row = body.append('tr');
    cell = row.append('td')
        .text(subnet_artifact);
    cell = row.append('td');
    let input = cell.append('input')
        .attr('type', 'text')
        .attr('class', 'query-filter')
        .attr('id', 'subnet_name_filter')
        .attr('name', 'subnet_name_filter');
});

