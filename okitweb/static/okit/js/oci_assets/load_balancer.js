console.log('Loaded Load Balancer Javascript');

/*
** Set Valid drop Targets
 */
asset_drop_targets[load_balancer_artifact] = [subnet_artifact];
asset_connect_targets[load_balancer_artifact] = [];
asset_add_functions[load_balancer_artifact] = "addLoadBalancer";
asset_update_functions[load_balancer_artifact] = "updateLoadBalancer";
asset_delete_functions[load_balancer_artifact] = "deleteLoadBalancer";
asset_clear_functions.push("clearLoadBalancerVariables");

const load_balancer_stroke_colour = "#F80000";
const load_balancer_query_cb = "load-balancer-query-cb";
const load_balancer_width = Math.round(icon_width * 6);
const load_balancer_height = Math.round(icon_height * 3 / 2);
const load_balancer_svg_width = Math.round(load_balancer_width + icon_x * 2);
const load_balancer_svg_height = Math.round(load_balancer_height + icon_y * 2);
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
    for (let i = 0; i < OKITJsonObj['load_balancers'].length; i++) {
        if (OKITJsonObj['load_balancers'][i]['id'] == id) {
            OKITJsonObj['load_balancers'].splice(i, 1);
        }
    }
}

/*
** SVG Creation
 */
function drawLoadBalancerSVG(artifact) {
    let parent_id = artifact['subnet_ids'][0];
    artifact['parent_id'] = parent_id;
    let id = artifact['id'];
    let compartment_id = artifact['compartment_id'];
    console.log('Drawing ' + load_balancer_artifact + ' : ' + id + ' [' + parent_id + ']');

    if (!subnet_bui_sub_artifacts.hasOwnProperty(parent_id)) {
        subnet_bui_sub_artifacts[parent_id] = {};
    }

    // Only draw the instance if the subnet exists
    if (parent_id in subnet_bui_sub_artifacts) {
        if (!subnet_bui_sub_artifacts[parent_id].hasOwnProperty('load_balancer_position')) {
            subnet_bui_sub_artifacts[parent_id]['load_balancer_position'] = 0;
        }
        // Calculate Position
        let position = subnet_bui_sub_artifacts[parent_id]['load_balancer_position'];
        // Increment Icon Position
        subnet_bui_sub_artifacts[parent_id]['load_balancer_position'] += 1;

        let artifact_definition = newArtifactSVGDefinition(artifact, load_balancer_artifact);
        artifact_definition['svg']['x'] = Math.round((icon_width * 3 / 2) + (load_balancer_width * position) + (icon_spacing * position));
        artifact_definition['svg']['y'] = Math.round(icon_height * 3 / 2);
        artifact_definition['svg']['width'] = load_balancer_width;
        artifact_definition['svg']['height'] = load_balancer_height;
        artifact_definition['rect']['stroke']['colour'] = load_balancer_stroke_colour;
        artifact_definition['rect']['stroke']['dash'] = 1;
        artifact_definition['name']['show'] = true;

        let svg = drawArtifact(artifact_definition);

        /*
        let svg_x = Math.round((icon_width * 3 / 2) + (load_balancer_width * position) + (icon_spacing * position));
        let svg_y = Math.round(icon_height * 3 / 2);
        let svg_width = load_balancer_width;
        let svg_height = load_balancer_height;
        let data_type = load_balancer_artifact;
        let stroke_colour = load_balancer_stroke_colour;
        let stroke_dash = 1;

        let svg = drawArtifactSVG(artifact, data_type,
            svg_x, svg_y, svg_width, svg_height,
            stroke_colour, stroke_dash,
            true,
            false);
        */

        //loadLoadBalancerProperties(id);
        let rect = d3.select('#' + id);
        let boundingClientRect = rect.node().getBoundingClientRect();
        // Add click event to display properties
        // Add Drag Event to allow connector (Currently done a mouse events because SVG does not have drag version)
        // Add dragevent versions
        // Set common attributes on svg element and children
        svg.on("click", function () {
            loadLoadBalancerProperties(id);
            d3.event.stopPropagation();
        });
        svg.attr("data-connector-start-y", boundingClientRect.y + boundingClientRect.height)
            .attr("data-connector-start-x", boundingClientRect.x + (boundingClientRect.width / 2))
            .attr("data-connector-end-y", boundingClientRect.y + boundingClientRect.height)
            .attr("data-connector-end-x", boundingClientRect.x + (boundingClientRect.width / 2))
            .attr("data-connector-id", id)
            .attr("dragable", true)
            .selectAll("*")
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
                    //console.log('Instance Ids: ' + instance_ids);
                    for (let slid of instance_ids) {
                        instances_select.append($('<option>').attr('value', slid).text(okitIdsJsonObj[slid]));
                    }
                    instances_select.val(load_balancer['instance_ids']);
                    // Add Event Listeners
                    //addPropertiesEventListeners(load_balancer, [clearLoadBalancerConnectorsSVG, drawLoadBalancerConnectorsSVG]);
                    //addPropertiesEventListeners(load_balancer, [drawLoadBalancerAttachmentsSVG]);
                    addPropertiesEventListeners(load_balancer, [drawSVGforJson]);
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
                if (load_balancer['instance_ids'].indexOf(source_id) > 0) {
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

/*
** Query OCI
 */

function queryLoadBalancerAjax(compartment_id, subnet_id) {
    console.log('------------- queryLoadBalancerAjax --------------------');
    let request_json = {};
    request_json['compartment_id'] = compartment_id;
    request_json['subnet_id'] = subnet_id;
    if ('load_balancer_filter' in okitQueryRequestJson) {
        request_json['load_balancer_filter'] = okitQueryRequestJson['load_balancer_filter'];
    }
    $.ajax({
        type: 'get',
        url: 'oci/artifacts/LoadBalancer',
        dataType: 'text',
        contentType: 'application/json',
        data: JSON.stringify(request_json),
        success: function (resp) {
            let response_json = JSON.parse(resp);
            OKITJsonObj['load_balancers'] = response_json;
            let len = response_json.length;
            for (let i = 0; i < len; i++) {
                console.log('queryLoadBalancerAjax : ' + response_json[i]['display_name']);
            }
            redrawSVGCanvas();
            $('#' + load_balancer_query_cb).prop('checked', true);
            hideQueryProgressIfComplete();
        },
        error: function (xhr, status, error) {
            console.log('Status : ' + status)
            console.log('Error : ' + error)
        }
    });
}

$(document).ready(function () {
    clearLoadBalancerVariables();

    // Setup Search Checkbox
    let body = d3.select('#query-progress-tbody');
    let row = body.append('tr');
    let cell = row.append('td');
    cell.append('input')
        .attr('type', 'checkbox')
        .attr('id', load_balancer_query_cb);
    cell.append('label').text(load_balancer_artifact);

    // Setup Query Display Form
    body = d3.select('#query-oci-tbody');
    row = body.append('tr');
    cell = row.append('td')
        .text(load_balancer_artifact);
    cell = row.append('td');
    let input = cell.append('input')
        .attr('type', 'text')
        .attr('class', 'query-filter')
        .attr('id', 'load_balancer_name_filter')
        .attr('name', 'load_balancer_name_filter');
});


