console.log('Loaded Internet Gateway Javascript');

/*
** Set Valid drop Targets
 */
asset_drop_targets[subnet_artifact] = [virtual_cloud_network_artifact];
asset_connect_targets[subnet_artifact] = [];
asset_add_functions[subnet_artifact] = "addSubnet";
asset_update_functions[subnet_artifact] = "updateSubnet";
asset_delete_functions[subnet_artifact] = "deleteSubnet";

let subnet_svg_height = 200;
let subnet_svg_width = "95%";
let subnet_rect_height = "85%";
let subnet_rect_width = "95%";
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
    vcn_cidr = virtual_cloud_network_cidr[vcn_id].split('/')[0].split('.');
    subnet_cidr[id] = vcn_cidr[0] + '.' + vcn_cidr[1] + '.' + (subnet_count - 1) + '.' + vcn_cidr[3] + '/24';
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
    drawSubnetSVG(subnet);
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
    for (let i=0; i < OKITJsonObj['subnets'].length; i++) {
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
function drawSubnetSVG(subnet) {
    let parent_id = subnet['vcn_id'];
    let id = subnet['id'];
    let compartment_id = subnet['compartment_id'];
    console.log('Drawing Subnet : ' + id);
    if (virtual_cloud_network_bui_sub_artifacts.hasOwnProperty(parent_id)) {
        let position_x = 0;
        let position = virtual_cloud_network_bui_sub_artifacts[parent_id]['subnet_position'];
        let vcn_offset_x = (icon_width / 2);
        let vcn_offset_y = ((icon_height / 4) * 8) + ((icon_height + vcn_icon_spacing) * 1);
        let count_offset_x = (icon_width * position_x) + (vcn_icon_spacing * position_x);
        let count_offset_y = ((subnet_svg_height + vcn_icon_spacing) * position);
        let svg_x = vcn_offset_x + count_offset_x;
        let svg_y = vcn_offset_y + count_offset_y;
        let data_type = subnet_artifact;

        // Increment Icon Position
        virtual_cloud_network_bui_sub_artifacts[parent_id]['subnet_position'] += 1;

        let parent_svg = d3.select('#' + parent_id + "-svg");
        let asset_svg = parent_svg.append("svg")
            .attr("id", id + '-svg')
            .attr("data-type", data_type)
            .attr("data-parentid", parent_id)
            .attr("title", subnet['display_name'])
            .attr("x", svg_x)
            .attr("y", svg_y)
            .attr("width", subnet_svg_width)
            .attr("height", subnet_svg_height);
        let svg = asset_svg.append("svg")
            .attr("id", id + '-svg')
            .attr("data-type", data_type)
            .attr("data-parentid", parent_id)
            .attr("title", subnet['display_name'])
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", "100%")
            .attr("height", "100%");
        let rect = svg.append("rect")
            .attr("id", id)
            .attr("data-type", data_type)
            .attr("data-parentid", parent_id)
            .attr("title", subnet['display_name'])
            .attr("x", icon_x)
            .attr("y", icon_y)
            //.attr("width", vcn_width - (icon_width * 2))
            .attr("width", subnet_rect_width)
            .attr("height", subnet_rect_height)
            .attr("stroke-dasharray", "5, 5")
            .attr("stroke", "orange")
            //.attr("stroke", subnet_stroke_colour[(subnet_count % 3)])
            //.attr("fill", subnet_stroke_colour[(subnet_count % 3)])
            .attr("fill", "white")
            .attr("style", "fill-opacity: .25;");
        rect.append("title")
            .attr("id", id + '-title')
            .attr("data-type", data_type)
            .attr("data-parentid", parent_id)
            .text("Subnet: " + subnet['display_name']);
        let text = svg.append("text")
            .attr("id", id + '-display-name')
            .attr("data-type", data_type)
            .attr("data-parentid", parent_id)
            .attr("x", icon_x + icon_width / 3)
            .attr("y", icon_y + icon_height / 3)
            .text(subnet['display_name']);
        let g = svg.append("g")
            .attr("data-type", data_type)
            .attr("data-parentid", parent_id)
            .attr("transform", "translate(-20, -20) scale(0.3, 0.3)");
        g.append("path")
            .attr("data-type", data_type)
            .attr("data-parentid", parent_id)
            .attr("class", "st0")
            .attr("d", "M142.7,138v-13.5h-8.4v-20.8h20.8v20.8h-8.4V138h52.8c-3-27.4-26.2-48.8-54.4-48.8c-28.2,0-51.4,21.3-54.4,48.8H142.7z")
        g.append("path")
            .attr("data-type", data_type)
            .attr("data-parentid", parent_id)
            .attr("class", "st0")
            .attr("d", "M170,142v14.6h8.4v20.8h-20.8v-20.8h8.4V142h-41.5v14.6h8.4v20.8H112v-20.8h8.4V142H90.5c0,0.7-0.1,1.3-0.1,2c0,30.2,24.5,54.7,54.7,54.7c30.2,0,54.7-24.5,54.7-54.7c0-0.7-0.1-1.3-0.1-2H170z")

        //loadSubnetProperties(id);
        let boundingClientRect = rect.node().getBoundingClientRect();
        // Add click event to display properties
        // Add Drag Event to allow connector (Currently done a mouse events because SVG does not have drag version)
        // Add dragevent versions
        // Set common attributes on svg element and children
        svg.on("click", function () {
            loadSubnetProperties(id);
            d3.event.stopPropagation();
        })
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
            .attr("data-type", data_type)
            .attr("data-okit-id", id)
            .attr("data-parentid", parent_id)
            .attr("data-compartment-id", compartment_id)
            .attr("data-connector-start-y", boundingClientRect.y + boundingClientRect.height)
            .attr("data-connector-start-x", boundingClientRect.x + (boundingClientRect.width / 2))
            .attr("data-connector-end-y", boundingClientRect.y)
            .attr("data-connector-end-x", boundingClientRect.x + (boundingClientRect.width / 2))
            .attr("data-connector-id", id)
            .attr("dragable", true)
            .selectAll("*")
                .attr("data-type", data_type)
                .attr("data-okit-id", id)
                .attr("data-parentid", parent_id)
                .attr("data-compartment-id", compartment_id)
                .attr("data-connector-start-y", boundingClientRect.y + boundingClientRect.height)
                .attr("data-connector-start-x", boundingClientRect.x + (boundingClientRect.width / 2))
                .attr("data-connector-end-y", boundingClientRect.y)
                .attr("data-connector-end-x", boundingClientRect.x + (boundingClientRect.width / 2))
                .attr("data-connector-id", id)
                .attr("dragable", true);

        initialiseSubnetChildData(id);
    } else {
        console.log(parent_id + ' was not found in virtual cloud network sub artifacts : ' + JSON.stringify(virtual_cloud_network_bui_sub_artifacts));
    }
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

/*
** Property Sheet Load function
 */
function loadSubnetProperties(id) {
    $("#properties").load("propertysheets/subnet.html", function () {
        let name_id_mapping = {"security_lists": "security_list_ids",
                                "security_list_ids": "security_lists",
                                "route_table": "route_table_id",
                                "route_table_id": "route_table"};
        if ('subnets' in OKITJsonObj) {
            console.log('Loading Subnet: ' + id);
            let json = OKITJsonObj['subnets'];
            for (let i = 0; i < json.length; i++) {
                subnet = json[i];
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
                    for (let rtcnt = 0; rtcnt < route_table_ids.length; rtcnt++) {
                        let rtid = route_table_ids[rtcnt];
                        if (rtid == subnet['route_table_id']) {
                            route_table_select.append($('<option>').attr('value', rtid).attr('selected', 'selected').text(okitIdsJsonObj[rtid]));
                        } else {
                            route_table_select.append($('<option>').attr('value', rtid).text(okitIdsJsonObj[rtid]));
                        }

                    }
                    let security_lists_select = $('#security_list_ids');
                    //console.log('Security List Ids: ' + security_list_ids);
                    for (let slcnt = 0; slcnt < security_list_ids.length; slcnt++) {
                        let slid = security_list_ids[slcnt];
                        if (subnet['security_list_ids'].indexOf(slid) >= 0) {
                            security_lists_select.append($('<option>').attr('value', slid).attr('selected', 'selected').text(okitIdsJsonObj[slid]));
                        } else {
                            security_lists_select.append($('<option>').attr('value', slid).text(okitIdsJsonObj[slid]));
                        }
                    }
                    // Add Event Listeners
                    addPropertiesEventListeners(subnet, [clearSubnetConnectorsSVG, drawSubnetConnectorsSVG]);
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
            if (sourcetype == 'Route Table') {
                if (subnet['route_table_id'] != '') {
                    // Only single Route Table allow so delete existing line.
                    console.log('Deleting Connector : ' + generateConnectorId(subnet['route_table_id'], id));
                    d3.select("#" + generateConnectorId(subnet['route_table_id'], id)).remove();
                }
                subnet['route_table_id'] = sourceid;
                subnet['route_table'] = okitIdsJsonObj[sourceid];
            } else if (sourcetype == 'Security List') {
                if (subnet['security_list_ids'].indexOf(sourceid) > 0 ) {
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

clearSubnetVariables();
