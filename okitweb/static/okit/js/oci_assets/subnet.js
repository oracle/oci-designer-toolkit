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

const subnet_stroke_colour = "#ff6600";
const subnet_query_cb = "subnet-query-cb";
const min_subnet_dimensions = {width:400, height:150};
let subnet_ids = [];
let subnet_bui_sub_artifacts = {};
let subnet_cidr = {};

/*
** Reset variables
 */

function clearSubnetVariables() {
    subnet_ids = [];
    subnet_bui_sub_artifacts = {};
    subnet_cidr = {};
}

/*
** Get Artifact by id
 */
function getSubnet(id='') {
    if (!okitJson.hasOwnProperty('subnets')) {
        okitJson['subnets'] = [];
    }

    for (let subnet of okitJson['subnets']) {
        if (subnet['id'] == id) {
            return subnet;
        }
    }
    return null;
}

/*
** Add Asset to JSON Model
 */
// TODO: Delete
function addSubnetDeprecated(vcn_id, compartment_id) {
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
    let subnet_count = okitJson['subnets'].length + 1;
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

// TODO: Delete
function initialiseSubnetChildDataDeprecated(id) {
    // Set subnet specific positioning variables
    // Add Sub Component positional data
    subnet_bui_sub_artifacts[id] = {
        "load_balancer_position": 0,
        "instance_position": 0
    };
}

/*
** Delete From JSON Model
 */

// TODO: Delete
function deleteSubnetDeprecated(id) {
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
    if ('file_storage_systems' in okitJson) {
        for (let i = okitJson['file_storage_systems'].length - 1; i >= 0; i--) {
            let file_storage_system = okitJson['file_storage_systems'][i];
            if (file_storage_system['subnet_id'] == id) {
                deleteFileStorageSystem(file_storage_system['id']);
            }
        }
    }
    console.groupEnd();
}

/*
** Tests
 */
// TODO: Delete
function hasLoadBalancerDeprecated(id='') {
    if (okitJson.hasOwnProperty('load_balancers')) {
        for (let load_balancer of okitJson['load_balancers']) {
            if (load_balancer['subnet_ids'][0] == id) {
                return true;
            }
        }
    }
    return false;
}

// TODO: Delete
function hasFileStorageSystemDeprecated(id='') {
    if (okitJson.hasOwnProperty('file_storage_systems')) {
        for (let file_storage_system of okitJson['file_storage_systems']) {
            if (file_storage_system['subnet_id'] == id) {
                return true;
            }
        }
    }
    return false;
}

/*
** SVG Creation
 */
// TODO: Delete
function getSubnetFirstChildEdgeOffsetDeprecated() {
    let offset = {
        dx: Math.round(positional_adjustments.padding.x * 2 + positional_adjustments.spacing.x * 2),
        dy: 0
    };
    return offset;
}

// TODO: Delete
function getSubnetFirstChildOffsetDeprecated() {
    let offset = {
        dx: Math.round(positional_adjustments.padding.x),
        dy: Math.round(positional_adjustments.padding.y + positional_adjustments.spacing.y * 2)
    };
    return offset;
}

// TODO: Delete
function getSubnetFirstChildLoadBalancerOffsetDeprecated(id='') {
    let offset = getSubnetFirstChildOffset();
    if (hasFileStorageSystem(id)) {
        offset.dx += Math.round(positional_adjustments.padding.x + positional_adjustments.spacing.x);
    }
    /*
    let offset = {
        dx: Math.round(positional_adjustments.padding.x + positional_adjustments.spacing.x),
        dy: Math.round(positional_adjustments.padding.y + positional_adjustments.spacing.y * 2)
    }; */
    return offset;
}

// TODO: Delete
function getSubnetFirstChildInstanceOffsetDeprecated(id='') {
    let offset = getSubnetFirstChildOffset();
    if (hasFileStorageSystem(id)) {
        offset.dx += Math.round(positional_adjustments.padding.x + positional_adjustments.spacing.x);
    }
    /*
    let offset = {
        dx: Math.round(positional_adjustments.padding.x + positional_adjustments.spacing.x),
        dy: Math.round(positional_adjustments.padding.y + positional_adjustments.spacing.y * 2)
    };
    */
    if (hasLoadBalancer(id)) {
        let first_child = getSubnetFirstChildLoadBalancerOffset();
        let dimensions = getLoadBalancerDimensions();
        offset.dy += Math.round(dimensions.height + positional_adjustments.padding.y);
    }
    return offset;
}

// TODO: Delete
function getSubnetDimensionsDeprecated(id='') {
    console.groupCollapsed('Getting Dimensions of ' + subnet_artifact + ' : ' + id);
    let first_edge_child = getSubnetFirstChildEdgeOffset();
    let first_load_balancer_child = getSubnetFirstChildLoadBalancerOffset(id);
    let first_instance_child = getSubnetFirstChildInstanceOffset(id);
    let first_child = getSubnetFirstChildOffset();
    let dimensions = {width:first_instance_child.dx, height:first_instance_child.dy};
    let max_load_balancer_dimensions = {width:0, height: 0, count:0};
    let max_instance_dimensions = {width:0, height: 0, count:0};
    let max_edge_dimensions = {width:0, height: 0, count:0};
    let max_file_storage_dimensions = {width:0, height: 0, count:0};
    // Get Subnet Details
    let subnet = {};
    for (subnet of okitJson['subnets']) {
        if (id == subnet['id']) {
            break;
        }
    }
    console.info('Base Dimensions : '+ JSON.stringify(dimensions));

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
    dimensions['width'] = Math.max(dimensions['width'],
        Math.round(first_edge_child.dx + positional_adjustments.spacing.x + max_edge_dimensions['width'] + (max_edge_dimensions['count'] - 1) * positional_adjustments.spacing.x)
    );
    console.info('Post Edge Dimensions : '+ JSON.stringify(dimensions));

    // Process Load Balancers
    if (okitJson.hasOwnProperty('load_balancers')) {
        for (let load_balancer of okitJson['load_balancers']) {
            if (load_balancer['subnet_ids'][0] == id) {
                let load_balancer_dimensions = getLoadBalancerDimensions(load_balancer['id']);
                max_load_balancer_dimensions['width'] += Math.round(load_balancer_dimensions['width'] + positional_adjustments.spacing.x);
                dimensions['height'] = Math.max(dimensions['height'], (first_load_balancer_child.dy + positional_adjustments.spacing.y + load_balancer_dimensions['height'] + positional_adjustments.padding.y));
            }
        }
    }
    dimensions['width'] = Math.max(dimensions['width'],
        Math.round(first_load_balancer_child.dx + positional_adjustments.spacing.x + max_load_balancer_dimensions['width'] + positional_adjustments.padding.x)
    );
    console.info('Load Balancer Offsets         : '+ JSON.stringify(first_load_balancer_child));
    console.info('Post Load Balancer Dimensions : '+ JSON.stringify(dimensions));

    // Process Instances
    if (okitJson.hasOwnProperty('instances')) {
        for (let instance of okitJson['instances']) {
            if (instance['subnet_id'] == id) {
                let instance_dimensions = getInstanceDimensions(instance['id']);
                max_instance_dimensions['width'] += Math.round(instance_dimensions['width'] + positional_adjustments.spacing.x);
                dimensions['height'] = Math.max(dimensions['height'], (first_instance_child.dy + positional_adjustments.padding.y + instance_dimensions['height']));
            }
        }
    }
    dimensions['width'] = Math.max(dimensions['width'],
        Math.round(first_instance_child.dx + positional_adjustments.spacing.x + max_instance_dimensions['width'] + positional_adjustments.padding.x)
    );
    console.info('Instance Offsets              : '+ JSON.stringify(first_instance_child));
    console.info('Post Instance Dimensions      : '+ JSON.stringify(dimensions));

    // File Storage Systems
    if (okitJson.hasOwnProperty('file_storage_systems')) {
        for (let file_storage_system of okitJson['file_storage_systems']) {
            if (file_storage_system['subnet_id'] == id) {
                let file_storage_dimensions = getFileStorageSystemDimensions(file_storage_system['id']);
                max_file_storage_dimensions['height'] += Math.round(file_storage_dimensions['height'] + positional_adjustments.spacing.y);
            }
        }
    }
    dimensions['height'] = Math.max(dimensions['height'],
        Math.round(first_child.dy + positional_adjustments.spacing.y + max_file_storage_dimensions['height'] + positional_adjustments.padding.y));
    console.info('Post File System Dimensions   : '+ JSON.stringify(dimensions));

    // Check size against minimum
    dimensions['width'] = Math.max(dimensions['width'], min_subnet_dimensions['width']);
    dimensions['height'] = Math.max(dimensions['height'], min_subnet_dimensions['height']);

    console.info('Overall Dimensions       : ' + JSON.stringify(dimensions));

    console.groupEnd();
    return dimensions;
}

// TODO: Delete
function newSubnetDefinitionDeprecated(artifact, position=0) {
    let dimensions = getSubnetDimensions(artifact['id']);
    let definition = newArtifactSVGDefinition(artifact, subnet_artifact);
    // Get Parents First Child Container Offset
    let parent_first_child = getVirtualCloudNetworkFirstChildContainerOffset(artifact['vcn_id']);
    definition['svg']['x'] = parent_first_child.dx;
    definition['svg']['y'] = parent_first_child.dy;
    // Add positioning offset
    definition['svg']['y'] += Math.round(positional_adjustments.spacing.y * position);

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
    /*
    if (!okitJson['canvas']['subnets'].hasOwnProperty(artifact['id'])) {
        okitJson['canvas']['subnets'][artifact['id']] = {svg:{x:0, y:0, width:0, height:0}};
    }
    okitJson['canvas']['subnets'][artifact['id']]['svg'] = definition['svg'];
    */
    console.info(JSON.stringify(definition));
    return definition;
}

// TODO: Delete
function drawSubnetSVGDeprecated(artifact) {
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
        let fill = d3.select('#' + id).attr('fill');
        svg.on("mouseover", function () {
            d3.selectAll('#' + id + '-vnic').attr('fill', svg_highlight_colour);
            d3.event.stopPropagation();
        });
        svg.on("mouseout", function () {
            d3.selectAll('#' + id + '-vnic').attr('fill', fill);
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

// TODO: Delete
function clearSubnetConnectorsSVG(subnet) {
    let id = subnet['id'];
    d3.selectAll("line[id*='" + id + "']").remove();
}

// TODO: Delete
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

// TODO: Delete
function drawSubnetAttachmentsSVGDeprecated(subnet) {
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

// TODO: Delete
function drawAttachedRouteTableDeprecated(artifact, attachment_count) {
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

// TODO: Delete
function drawAttachedSecurityListDeprecated(artifact, attachment_count) {
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
// TODO: Delete
function loadSubnetPropertiesDeprecated(id) {
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
                    let route_table_select = $('#route_table_id');
                    for (let route_table of okitJson['route_tables']) {
                        if (subnet.vcn_id == route_table.vcn_id) {
                            route_table_select.append($('<option>').attr('value', route_table['id']).text(route_table['display_name']));
                        }
                    }
                    let security_lists_select = $('#security_list_ids');
                    for (let security_list of okitJson['security_lists']) {
                        if (subnet.vcn_id == security_list.vcn_id) {
                            security_lists_select.append($('<option>').attr('value', security_list['id']).text(security_list['display_name']));
                        }
                    }
                    // Load Properties
                    loadProperties(subnet);
                    // Add Event Listeners
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
    queryFileStorageSystemAjax(compartment_id, id);
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















/*
** Define Subnet Artifact Class
 */
class Subnet extends OkitContainerArtifact {
    /*
    ** Create
     */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        this.id = 'okit-' + subnet_prefix + '-' + uuidv4();
        this.display_name = generateDefaultName(subnet_prefix, okitjson.subnets.length + 1);
        this.compartment_id = '';
        this.vcn_id = data.parent_id;
        this.cidr_block = this.generateCIDR(this.vcn_id);
        this.dns_label = this.display_name.toLowerCase().slice(-5);
        this.prohibit_public_ip_on_vnic = false;
        this.route_table = '';
        this.route_table_id = '';
        this.security_lists = [];
        this.security_list_ids = [];
        // Update with any passed data
        for (let key in data) {
            this[key] = data[key];
        }
        // Add Get Parent function
        this.parent_id = this.vcn_id;
        for (let parent of okitjson.virtual_cloud_networks) {
            if (parent.id === this.parent_id) {
                this.getParent = function() {return parent};
                break;
            }
        }
    }


    /*
    ** Clone Functionality
     */
    clone() {
        return new Subnet(this, this.getOkitJson());
    }


    /*
    ** Get the Artifact name this Artifact will be know by.
     */
    getArtifactReference() {
        return subnet_artifact;
    }


    /*
    ** Delete Processing
     */
    delete() {
        console.groupCollapsed('Delete ' + this.getArtifactReference() + ' : ' + id);
        // Delete Child Artifacts
        this.deleteChildren();
        // Remove SVG Element
        d3.select("#" + this.id + "-svg").remove()
        console.groupEnd();
    }

    deleteChildren() {
        // Remove Instances
        for (let child of this.getOkitJson().instances) {
            if (child.subnet_id === this.id) {
                child.delete();
            }
        }
        // Remove Load Balancers
        for (let child of this.getOkitJson().load_balancers) {
            if (child.subnet_id === this.id) {
                child.delete();
            }
        }
        // Remove File Storage Systems
        for (let child of this.getOkitJson().file_storage_systems) {
            if (child.subnet_id === this.id) {
                child.delete();
            }
        }
    }

    getChildren(artifact) {
        let children = [];
        for (let child of this.getOkitJson()[artifact]) {
            if (child.subnet_id === this.id) {
                children.push(child);
            }
        }
        return children;
    }


    /*
     ** SVG Processing
     */
    draw() {
        this.parent_id = this.vcn_id;
        let id = this.id;
        console.groupCollapsed('Drawing ' + subnet_artifact + ' : ' + this.id + ' [' + this.parent_id + ']');
        let svg = drawArtifact(this.getSvgDefinition());

        // Add Properties Load Event to created svg
        let me = this;
        svg.on("click", function () {
            me.loadProperties();
            d3.event.stopPropagation();
        });
        let fill = d3.select('#' + this.id).attr('fill');
        svg.on("mouseover", function () {
            d3.selectAll('#' + me.id + '-vnic').attr('fill', svg_highlight_colour);
            d3.event.stopPropagation();
        });
        svg.on("mouseout", function () {
            d3.selectAll('#' + me.id + '-vnic').attr('fill', fill);
            d3.event.stopPropagation();
        });
        this.drawAttachments();
        console.groupEnd();
    }

    drawAttachments() {
        console.info('Drawing ' + subnet_artifact + ' : ' + this.id + ' Attachments');
        let attachment_count = 0;
        // Draw Route Table
        for (let route_table of this.getOkitJson()['route_tables']) {
            if (this.route_table_id === route_table['id']) {
                let artifact_clone = new RouteTable(route_table, this.getOkitJson(), this);
                artifact_clone['parent_id'] = this.id;
                console.info('Drawing ' + this.getArtifactReference() + ' Route Table : ' + artifact_clone.display_name);
                artifact_clone.draw();
            }
        }
        attachment_count += 1;
        // Security Lists
        for (let security_list_id of this.security_list_ids) {
            for (let security_list of this.getOkitJson()['security_lists']) {
                if (security_list_id == security_list['id']) {
                    let artifact_clone = new SecurityList(security_list, this.getOkitJson(), this);
                    artifact_clone['parent_id'] = this.id;
                    console.info('Drawing ' + this.getArtifactReference() + ' Security List : ' + artifact_clone.display_name);
                    artifact_clone.draw();
                }
            }
            attachment_count += 1;
        }
    }

    getSvgDefinition() {
        console.groupCollapsed('Getting Definition of ' + this.getArtifactReference() + ' : ' + this.id);
        let dimensions = this.getDimensions(this.id);
        let definition = this.newSVGDefinition(this, subnet_artifact);
        // Get Parents First Child Container Offset
        let parent_first_child = this.getParent().getChildOffset(this.getArtifactReference());
        definition['svg']['x'] = parent_first_child.dx;
        definition['svg']['y'] = parent_first_child.dy;
        definition['svg']['width'] = dimensions['width'];
        definition['svg']['height'] = dimensions['height'];
        definition['rect']['stroke']['colour'] = subnet_stroke_colour;
        definition['rect']['stroke']['dash'] = 5;
        definition['icon']['x_translation'] = icon_translate_x_start;
        definition['icon']['y_translation'] = icon_translate_y_start;
        definition['name']['show'] = true;
        definition['label']['show'] = true;
        if (this.prohibit_public_ip_on_vnic) {
            definition['label']['text'] = 'Private ' + subnet_artifact;
        } else  {
            definition['label']['text'] = 'Public ' + subnet_artifact;
        }
        definition['info']['show'] = true;
        definition['info']['text'] = this.cidr_block;
        console.info(JSON.stringify(definition, null, 2));
        console.groupEnd();
        return definition;
    }

    getDimensions() {
        return super.getDimensions('subnet_id');
    }
    // TODO: Delete
    getDimensions1() {
        console.groupCollapsed('Getting Dimensions of ' + subnet_artifact + ' : ' + this.id);
        let first_edge_child = this.getTopEdgeChildOffset();
        let first_load_balancer_child = this.getFirstLoadBalancerChildOffset(this.id);
        let first_instance_child = this.getFirstInstanceChildOffset(this.id);
        let first_child = this.getFirstChildOffset();
        let dimensions = {width:first_instance_child.dx, height:first_instance_child.dy};
        let max_load_balancer_dimensions = {width:0, height: 0, count:0};
        let max_instance_dimensions = {width:0, height: 0, count:0};
        let max_edge_dimensions = {width:0, height: 0, count:0};
        let max_file_storage_dimensions = {width:0, height: 0, count:0};
        // Get Subnet Details
        let subnet = {};
        for (subnet of okitJson['subnets']) {
            if (id == subnet['id']) {
                break;
            }
        }
        console.info('Base Dimensions : '+ JSON.stringify(dimensions));

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
        dimensions['width'] = Math.max(dimensions['width'],
            Math.round(first_edge_child.dx + positional_adjustments.spacing.x + max_edge_dimensions['width'] + (max_edge_dimensions['count'] - 1) * positional_adjustments.spacing.x)
        );
        console.info('Post Edge Dimensions : '+ JSON.stringify(dimensions));

        // Process Load Balancers
        if (okitJson.hasOwnProperty('load_balancers')) {
            for (let load_balancer of okitJson['load_balancers']) {
                if (load_balancer['subnet_ids'][0] == id) {
                    let load_balancer_dimensions = getLoadBalancerDimensions(load_balancer['id']);
                    max_load_balancer_dimensions['width'] += Math.round(load_balancer_dimensions['width'] + positional_adjustments.spacing.x);
                    dimensions['height'] = Math.max(dimensions['height'], (first_load_balancer_child.dy + positional_adjustments.spacing.y + load_balancer_dimensions['height'] + positional_adjustments.padding.y));
                }
            }
        }
        dimensions['width'] = Math.max(dimensions['width'],
            Math.round(first_load_balancer_child.dx + positional_adjustments.spacing.x + max_load_balancer_dimensions['width'] + positional_adjustments.padding.x)
        );
        console.info('Load Balancer Offsets         : '+ JSON.stringify(first_load_balancer_child));
        console.info('Post Load Balancer Dimensions : '+ JSON.stringify(dimensions));

        // Process Instances
        if (okitJson.hasOwnProperty('instances')) {
            for (let instance of okitJson['instances']) {
                if (instance['subnet_id'] == id) {
                    let instance_dimensions = getInstanceDimensions(instance['id']);
                    max_instance_dimensions['width'] += Math.round(instance_dimensions['width'] + positional_adjustments.spacing.x);
                    dimensions['height'] = Math.max(dimensions['height'], (first_instance_child.dy + positional_adjustments.padding.y + instance_dimensions['height']));
                }
            }
        }
        dimensions['width'] = Math.max(dimensions['width'],
            Math.round(first_instance_child.dx + positional_adjustments.spacing.x + max_instance_dimensions['width'] + positional_adjustments.padding.x)
        );
        console.info('Instance Offsets              : '+ JSON.stringify(first_instance_child));
        console.info('Post Instance Dimensions      : '+ JSON.stringify(dimensions));

        // File Storage Systems
        if (okitJson.hasOwnProperty('file_storage_systems')) {
            for (let file_storage_system of okitJson['file_storage_systems']) {
                if (file_storage_system['subnet_id'] == id) {
                    let file_storage_dimensions = getFileStorageSystemDimensions(file_storage_system['id']);
                    max_file_storage_dimensions['height'] += Math.round(file_storage_dimensions['height'] + positional_adjustments.spacing.y);
                }
            }
        }
        dimensions['height'] = Math.max(dimensions['height'],
            Math.round(first_child.dy + positional_adjustments.spacing.y + max_file_storage_dimensions['height'] + positional_adjustments.padding.y));
        console.info('Post File System Dimensions   : '+ JSON.stringify(dimensions));

        // Check size against minimum
        dimensions['width']  = Math.max(dimensions['width'],  this.getMinimumDimensions().width);
        dimensions['height'] = Math.max(dimensions['height'], this.getMinimumDimensions().height);

        console.info('Overall Dimensions       : ' + JSON.stringify(dimensions));

        console.groupEnd();
        return dimensions;
    }

    getMinimumDimensions() {
        return {width: 400, height: 150};
    }


    /*
    ** Property Sheet Load function
     */
    loadProperties() {
        let okitJson = this.getOkitJson();
        let me = this;
        $("#properties").load("propertysheets/subnet.html", function () {
            // Load Referenced Ids
            let route_table_select = $('#route_table_id');
            for (let route_table of okitJson.route_tables) {
                if (me.vcn_id == route_table.vcn_id) {
                    route_table_select.append($('<option>').attr('value', route_table.id).text(route_table.display_name));
                }
            }
            let security_lists_select = $('#security_list_ids');
            for (let security_list of okitJson.security_lists) {
                if (me.vcn_id == security_list.vcn_id) {
                    security_lists_select.append($('<option>').attr('value', security_list.id).text(security_list.display_name));
                }
            }
            // Load Properties
            loadProperties(me);
            // Add Event Listeners
            addPropertiesEventListeners(me, []);
        });
    }


    /*
    ** Utility Methods
     */
    generateCIDR(vcn_id) {
        let vcn_cidr = '10.0.0.0/16';
        for (let virtual_cloud_network of this.getOkitJson()['virtual_cloud_networks']) {
            if (virtual_cloud_network['id'] == vcn_id) {
                vcn_cidr = virtual_cloud_network['cidr_block'];
                break;
            }
        }
        let vcn_octets = vcn_cidr.split('/')[0].split('.');
        return vcn_octets[0] + '.' + vcn_octets[1] + '.' + this.getOkitJson().subnets.length + '.' + vcn_octets[3] + '/24';
    }


    /*
    ** Define Allowable SVG Drop Targets
     */
    getTargets() {
        return [compartment_artifact];
    }


    /*
    ** Artifact Specific Functions
     */
    hasLoadBalancer() {
        for (let load_balancer of this.getOkitJson().load_balancers) {
            if (load_balancer.subnet_ids[0] === this.id) {
                return true;
            }
        }
        return false;
    }

    hasFileStorageSystem() {
        for (let file_storage_system of this.getOkitJson().file_storage_systems) {
            if (file_storage_system.subnet_id === this.id) {
                return true;
            }
        }
        return false;
    }


    /*
    ** Child Artifact Functions
     */
    getTopEdgeArtifacts() {
        return [route_table_artifact, security_list_artifact];
    }

    getTopArtifacts() {
        return [load_balancer_artifact];
    }

    getBottomArtifacts() {
        return [instance_artifact];
    }

    getLeftArtifacts() {
        return [file_storage_system_artifact];
    }
}

