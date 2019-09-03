console.log('Loaded Load Balancer Javascript');

/*
** Set Valid drop Targets
 */
asset_drop_targets[load_balancer_artifact] = [subnet_artifact];
asset_connect_targets[load_balancer_artifact] = [];
asset_add_functions[load_balancer_artifact] = "addLoadBalancer";
asset_update_functions[load_balancer_artifact] = "updateLoadBalancer";
asset_delete_functions[load_balancer_artifact] = "deleteLoadBalancer";

let load_balancer_ids = [];
let load_balancer_count = 0;

/*
** Reset variables
 */

function clearLoadBalancerVariables() {
    load_balancer_ids = [];
    load_balancer_count = 0;
}

/*
** Add Asset to JSON Model
 */
function addLoadBalancer(subnet_id, compartment_id) {
    let id = 'okit-' + load_balancer_prefix + '-' + uuidv4();
    console.log('Adding Load Balancer : ' + id);

    // Add Virtual Cloud Network to JSON

    if (!OKITJsonObj.hasOwnProperty('load_balancers')) {
        OKITJsonObj['load_balancers'] = [];
    }

    // Add id & empty name to id JSON
    okitIdsJsonObj[id] = '';
    load_balancer_ids.push(id);

    // Increment Count
    load_balancer_count += 1;
    let load_balancer = {};
    load_balancer['subnet_ids'] = [subnet_id];
    load_balancer['subnets'] = [''];
    load_balancer['compartment_id'] = compartment_id;
    load_balancer['id'] = id;
    load_balancer['display_name'] = generateDefaultName(load_balancer_prefix, load_balancer_count);
    load_balancer['is_private'] = false;
    load_balancer['shape_name'] = '100Mbps';
    load_balancer['instances'] = [];
    load_balancer['instance_ids'] = [];
    OKITJsonObj['load_balancers'].push(load_balancer);
    okitIdsJsonObj[id] = load_balancer['display_name'];
    //console.log(JSON.stringify(OKITJsonObj, null, 2));
    displayOkitJson();
    drawLoadBalancerSVG(load_balancer);
    loadLoadBalancerProperties(id);
}

/*
** Delete From JSON Model
 */

function deleteLoadBalancer(id) {
    console.log('Delete Load Balancer ' + id);
    // Remove SVG Element
    d3.select("#" + id + "-svg").remove()
    // Remove Data Entry
    for (let i=0; i < OKITJsonObj['load_balancers'].length; i++) {
        if (OKITJsonObj['load_balancers'][i]['id'] == id) {
            OKITJsonObj['load_balancers'].splice(i, 1);
        }
    }
}

/*
** SVG Creation
 */
function drawLoadBalancerSVG(load_balancer) {
    let parent_id = load_balancer['subnet_ids'][0];
    let id = load_balancer['id'];
    let compartment_id = load_balancer['compartment_id'];
    console.log('Drawing Load Balancer : ' + id);
    //console.log('Subnet Id : ' + parent_id);
    //console.log('Subnet Content : ' + JSON.stringify(subnet_bui_sub_artifacts));
    // Only draw the instance if the subnet exists
    if (parent_id in subnet_bui_sub_artifacts) {
        let position = subnet_bui_sub_artifacts[parent_id]['load_balancer_position'];
        let translate_x = icon_translate_x_start + icon_width * position + vcn_icon_spacing * position;
        let translate_y = icon_translate_y_start;
        let svg_x = (icon_width / 2) + (icon_width * position) + (vcn_icon_spacing * position);
        let svg_y = (icon_height / 3);
        let data_type = load_balancer_artifact;

        // Increment Icon Position
        subnet_bui_sub_artifacts[parent_id]['load_balancer_position'] += 1;

        let parent_svg = d3.select('#' + parent_id + "-svg");
        let svg = parent_svg.append("svg")
            .attr("id", id + '-svg')
            .attr("data-type", data_type)
            .attr("data-parentid", parent_id)
            .attr("title", load_balancer['display_name'])
            .attr("x", svg_x)
            .attr("y", svg_y)
            .attr("width", "100")
            .attr("height", "100");
        let rect = svg.append("rect")
            .attr("id", id)
            .attr("data-type", data_type)
            .attr("data-parentid", parent_id)
            .attr("title", load_balancer['display_name'])
            .attr("x", icon_x)
            .attr("y", icon_y)
            .attr("width", icon_width)
            .attr("height", icon_height)
            .attr("stroke", icon_stroke_colour)
            .attr("stroke-dasharray", "1, 1")
            .attr("fill", "white")
            .attr("style", "fill-opacity: .25;");
        rect.append("title")
            .attr("id", id + '-title')
            .attr("data-type", data_type)
            .attr("data-parentid", parent_id)
            .text("Load Balancer: " + load_balancer['display_name']);
        let g = svg.append("g")
            .attr("data-type", data_type)
            .attr("data-parentid", parent_id)
            .attr("transform", "translate(5, 5) scale(0.3, 0.3)");
        g.append("path")
            .attr("data-type", data_type)
            .attr("data-parentid", parent_id)
            .attr("class", "st0")
            .attr("d", "M194.6,81.8H93.4c-3.5,0-6.3,2.8-6.3,6.3v54.3h18.2v-23.9c0-5.2,4.2-9.3,9.3-9.3h20.1c5.2,0,9.3,4.2,9.3,9.3v20.9l22.7-21.8l-3-3.1l12.7-3.1l-3.6,12.6l-3-3.1l-22.4,21.6h28.7v-4.4l11.3,6.5l-11.3,6.5v-4.4h-28.7l22.4,21.6l3-3.1l3.6,12.6l-12.7-3.1l3-3.1l-22.7-21.8v20.9c0,5.2-4.2,9.3-9.3,9.3h-20.1c-5.2,0-9.3-4.2-9.3-9.3v-23.9H87.1v53c0,3.5,2.8,6.3,6.3,6.3h101.1c3.5,0,6.3-2.8,6.3-6.3V88.1C200.9,84.7,198,81.8,194.6,81.8z");
        g.append("path")
            .attr("data-type", data_type)
            .attr("data-parentid", parent_id)
            .attr("class", "st0")
            .attr("d", "M109.8,146.8v23.9c0,2.7,2.2,5,5,5h20.1c2.7,0,5-2.2,5-5v-52.1c0-2.7-2.2-5-5-5h-20.1c-2.7,0-5,2.2-5,5v23.9h16.1v-4.4l11.3,6.5l-11.3,6.5v-4.4H109.8z");

        //loadLoadBalancerProperties(id);
        let boundingClientRect = rect.node().getBoundingClientRect();
        // Add click event to display properties
        // Add Drag Event to allow connector (Currently done a mouse events because SVG does not have drag version)
        // Add dragevent versions
        // Set common attributes on svg element and children
        svg.on("click", function () {loadLoadBalancerProperties(id); d3.event.stopPropagation(); })
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
            .attr("data-connector-end-y", boundingClientRect.y + boundingClientRect.height)
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
                .attr("data-connector-end-y", boundingClientRect.y + boundingClientRect.height)
                .attr("data-connector-end-x", boundingClientRect.x + (boundingClientRect.width / 2))
                .attr("data-connector-id", id)
                .attr("dragable", true);
    }
}

function clearLoadBalancerConnectorsSVG(load_balancer) {
    let id = load_balancer['id'];
    d3.selectAll("line[id*='" + id + "']").remove();
}

function drawLoadBalancerConnectorsSVG(load_balancer) {
    let parent_id = load_balancer['subnet_ids'][0];
    let id = load_balancer['id'];
    let parent_svg = d3.select('#' + parent_id + "-svg");
    // Only Draw if parent exists
    if (parent_svg.node()) {
        console.log('Parent SVG : ' + parent_svg.node());
        // Define SVG position manipulation variables
        let svgPoint = parent_svg.node().createSVGPoint();
        let screenCTM = parent_svg.node().getScreenCTM();
        svgPoint.x = d3.select('#' + id).attr('data-connector-start-x');
        svgPoint.y = d3.select('#' + id).attr('data-connector-start-y');
        let connector_start = svgPoint.matrixTransform(screenCTM.inverse());

        let connector_end = null;

        if (load_balancer['instance_ids'].length > 0) {
            for (let i = 0; i < load_balancer['instance_ids'].length; i++) {
                let instance_svg = d3.select('#' + load_balancer['instance_ids'][i]);
                if (instance_svg.node()) {
                    svgPoint.x = instance_svg.attr('data-connector-start-x');
                    svgPoint.y = instance_svg.attr('data-connector-start-y');
                    connector_end = svgPoint.matrixTransform(screenCTM.inverse());
                    parent_svg.append('line')
                        .attr("id", generateConnectorId(load_balancer['instance_ids'][i], id))
                        .attr("x1", connector_start.x)
                        .attr("y1", connector_start.y)
                        .attr("x2", connector_end.x)
                        .attr("y2", connector_end.y)
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
function loadLoadBalancerProperties(id) {
    $("#properties").load("propertysheets/load_balancer.html", function () {
        let name_id_mapping = {
            "instances": "instance_ids",
            "instance_ids": "instances"
        };
        if ('load_balancers' in OKITJsonObj) {
            console.log('Loading Load Balancer: ' + id);
            let json = OKITJsonObj['load_balancers'];
            for (let i = 0; i < json.length; i++) {
                let load_balancer = json[i];
                //console.log(JSON.stringify(load_balancer, null, 2));
                if (load_balancer['id'] == id) {
                    load_balancer['virtual_cloud_network'] = okitIdsJsonObj[load_balancer['subnet_ids'][0]];
                    $("#virtual_cloud_network").html(load_balancer['virtual_cloud_network']);
                    $('#display_name').val(load_balancer['display_name']);
                    $('#shape_name').val(load_balancer['shape_name']);
                    $('#is_private').attr('checked', load_balancer['is_private']);
                    let instances_select = $('#instance_ids');
                    console.log('Instance Ids: ' + instance_ids);
                    /*
                    for (let slcnt = 0; slcnt < instance_ids.length; slcnt++) {
                        let slid = instance_ids[slcnt];
                        if (load_balancer['instance_ids'].indexOf(slid) >= 0) {
                            instances_select.append($('<option>').attr('value', slid).attr('selected', 'selected').text(okitIdsJsonObj[slid]));
                        } else {
                            instances_select.append($('<option>').attr('value', slid).text(okitIdsJsonObj[slid]));
                        }
                    }
                     */
                    for (let slid of instance_ids) {
                        instances_select.append($('<option>').attr('value', slid).text(okitIdsJsonObj[slid]));
                    }
                    instances_select.val(load_balancer['instance_ids']);
                    // Add Event Listeners
                    addPropertiesEventListeners(load_balancer, [clearLoadBalancerConnectorsSVG, drawLoadBalancerConnectorsSVG]);
                    break;
                }
            }
        }
    });
}

/*
** OKIT Json Update Function
 */
function updateLoadBalancer(source_type, source_id, id) {
    console.log('Update Load Balancer : ' + id + ' Adding ' + source_type + ' ' + source_id);
    let load_balancers = OKITJsonObj['load_balancers'];
    console.log(JSON.stringify(load_balancers))
    for (let i = 0; i < load_balancers.length; i++) {
        let load_balancer = load_balancers[i];
        console.log(i + ') ' + JSON.stringify(load_balancer))
        if (load_balancer['id'] == id) {
            if (source_type == instance_artifact) {
                if (load_balancer['instance_ids'].indexOf(source_id) > 0 ) {
                    // Already connected so delete existing line
                    d3.select("#" + generateConnectorId(source_id, id)).remove();
                } else {
                    load_balancer['instance_ids'].push(source_id);
                    load_balancer['instances'].push(okitIdsJsonObj[source_id]);
                }
            }
        }
    }
    displayOkitJson();
    loadLoadBalancerProperties(id);
}

clearLoadBalancerVariables();
