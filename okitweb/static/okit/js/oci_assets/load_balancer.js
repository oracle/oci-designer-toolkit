console.log('Loaded Load Balancer Javascript');

/*
** Set Valid drop Targets
 */

asset_drop_targets["Load Balancer"] = ["Subnet"];
//asset_connect_targets["Load Balancer"] = ["Instance"];
asset_add_functions["Load Balancer"] = "addLoadBalancer";
asset_update_functions["Load Balancer"] = "updateLoadBalancer";

var load_balancer_ids = [];
var load_balancer_count = 0;

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
function addLoadBalancer(subnetid) {
    var id = 'okit-lb-' + uuidv4();

    // Add Virtual Cloud Network to JSON

    if (!('loadbalancers' in OKITJsonObj['compartment'])) {
        OKITJsonObj['compartment']['loadbalancers'] = [];
    }

    // Add id & empty name to id JSON
    okitIdsJsonObj[id] = '';
    load_balancer_ids.push(id);

    // Increment Count
    load_balancer_count += 1;
    var load_balancer = {};
    load_balancer['subnet_ids'] = [subnetid];
    load_balancer['subnets'] = [''];
    load_balancer['id'] = id;
    load_balancer['display_name'] = generateDefaultName('lb', load_balancer_count);
    load_balancer['is_private'] = false;
    load_balancer['shape_name'] = '100Mbps';
    load_balancer['instances'] = [];
    load_balancer['instance_ids'] = [];
    OKITJsonObj['compartment']['loadbalancers'].push(load_balancer);
    okitIdsJsonObj[id] = load_balancer['display_name'];
    //console.log(JSON.stringify(OKITJsonObj, null, 2));
    displayOkitJson();
    drawLoadBalancerSVG(load_balancer);
}

/*
** SVG Creation
 */
function drawLoadBalancerSVG(load_balancer) {
    console.log(JSON.stringify(subnet_content));
    var parent_id = load_balancer['subnet_ids'][0];
    console.log('VCN Id : ' + parent_id);
    var id = load_balancer['id'];
    var position = subnet_content[parent_id]['load_balancer_position'];
    var translate_x = icon_translate_x_start + icon_width * position + vcn_icon_spacing * position;
    var translate_y = icon_translate_y_start;
    var svg_x = (icon_width / 2) + (icon_width * position) + (vcn_icon_spacing * position);
    var svg_y = (icon_height / 4);
    var data_type = "Load Balancer";

    // Increment Icon Position
    subnet_content[parent_id]['load_balancer_position'] += 1;

    var parent_svg = d3.select('#' + parent_id + "-svg");
    var svg = parent_svg.append("svg")
        .attr("id", id + '-svg')
        .attr("data-type", data_type)
        .attr("data-parentid", parent_id)
        .attr("title", load_balancer['display_name'])
        .attr("x", svg_x)
        .attr("y", svg_y)
        .attr("width", "100")
        .attr("height", "100");
    var rect = svg.append("rect")
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
        .attr("data-type", data_type)
        .attr("data-parentid", parent_id)
        .text("Load Balancer: "+ load_balancer['display_name']);
    var g = svg.append("g")
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

    loadLoadBalancerProperties(id);
    var boundingClientRect = rect.node().getBoundingClientRect();
    // Add click event to display properties
    // Add Drag Event to allow connector (Currently done a mouse events because SVG does not have drag version)
    // Add dragevent versions
    // Set common attributes on svg element and children
    svg.on("click", function() { loadLoadBalancerProperties(id); })
        .on("mousedown", handleConnectorDragStart)
        .on("mousemove", handleConnectorDrag)
        .on("mouseup", handleConnectorDrop)
        .on("mouseover", handleConnectorDragEnter)
        .on("mouseout", handleConnectorDragLeave)
        .on("dragstart", handleConnectorDragStart)
        .on("drop", handleConnectorDrop)
        .on("dragenter", handleConnectorDragEnter)
        .on("dragleave", handleConnectorDragLeave)
        .attr("data-type", data_type)
        .attr("data-okit-id", id)
        .attr("data-parentid", parent_id)
        .attr("data-connector-start-y", boundingClientRect.y + boundingClientRect.height)
        .attr("data-connector-start-x", boundingClientRect.x + (boundingClientRect.width/2))
        .attr("data-connector-end-y", boundingClientRect.y + boundingClientRect.height)
        .attr("data-connector-end-x", boundingClientRect.x + (boundingClientRect.width/2))
        .attr("data-connector-id", id)
        .attr("dragable", true)
        .selectAll("*")
            .attr("data-type", data_type)
            .attr("data-okit-id", id)
            .attr("data-parentid", parent_id)
            .attr("data-connector-start-y", boundingClientRect.y + boundingClientRect.height)
            .attr("data-connector-start-x", boundingClientRect.x + (boundingClientRect.width/2))
            .attr("data-connector-end-y", boundingClientRect.y + boundingClientRect.height)
            .attr("data-connector-end-x", boundingClientRect.x + (boundingClientRect.width/2))
            .attr("data-connector-id", id)
            .attr("dragable", true);
}

function drawLoadBalancerConnectorsSVG(load_balancer) {
    var parent_id = load_balancer['subnet_ids'][0];
    var id = load_balancer['id'];
    var parent_svg = d3.select('#' + parent_id + "-svg");
    // Define SVG position manipulation variables
    var svgPoint = parent_svg.node().createSVGPoint();
    var screenCTM = parent_svg.node().getScreenCTM();
    svgPoint.x = d3.select('#' + id).attr('data-connector-start-x');
    svgPoint.y = d3.select('#' + id).attr('data-connector-start-y');
    var connector_start = svgPoint.matrixTransform(screenCTM.inverse());

    var connector_end = null;

    if (load_balancer['instance_ids'].length > 0) {
        for (var i = 0; i < load_balancer['instance_ids'].length; i++) {
            svgPoint.x = d3.select('#' + load_balancer['instance_ids'][i]).attr('data-connector-start-x');
            svgPoint.y = d3.select('#' + load_balancer['instance_ids'][i]).attr('data-connector-start-y');
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

/*
** Property Sheet Load function
 */
function loadLoadBalancerProperties(id) {
    $("#properties").load("propertysheets/load_balancer.html", function () {
        if ('compartment' in OKITJsonObj && 'loadbalancers' in OKITJsonObj['compartment']) {
            console.log('Loading Load Balancer: ' + id);
            var json = OKITJsonObj['compartment']['loadbalancers'];
            for (var i = 0; i < json.length; i++) {
                load_balancer = json[i];
                //console.log(JSON.stringify(load_balancer, null, 2));
                if (load_balancer['id'] == id) {
                    //console.log('Found Route Table: ' + id);
                    load_balancer['virtual_cloud_network'] = okitIdsJsonObj[load_balancer['subnet_ids'][0]];
                    $("#virtual_cloud_network").html(load_balancer['virtual_cloud_network']);
                    $('#display_name').val(load_balancer['display_name']);
                    var instances_select = $('#instance_ids');
                    //console.log('Security List Ids: ' + security_list_ids);
                    for (var slcnt = 0; slcnt < instance_ids.length; slcnt++) {
                        var slid = instance_ids[slcnt];
                        if (load_balancer['instance_ids'].indexOf(slid) >= 0) {
                            instances_select.append($('<option>').attr('value', slid).attr('selected', 'selected').text(okitIdsJsonObj[slid]));
                        } else {
                            instances_select.append($('<option>').attr('value', slid).text(okitIdsJsonObj[slid]));
                        }
                    }
                    // Add Event Listeners
                    var inputfields = document.querySelectorAll('.property-editor-table input');
                    [].forEach.call(inputfields, function (inputfield) {
                        inputfield.addEventListener('change', function () {
                            load_balancer[inputfield.id] = inputfield.value;
                            // If this is the name field copy to the Ids Map
                            if (inputfield.id == 'display_name') {
                                okitIdsJsonObj[id] = inputfield.value;
                            }
                            displayOkitJson();
                        });
                    });
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
    var load_balancers = OKITJsonObj['compartment']['loadbalancers'];
    console.log(JSON.stringify(load_balancers))
    for (var i = 0; i < load_balancers.length; i++) {
        var load_balancer = load_balancers[i];
        console.log(i + ') ' + JSON.stringify(load_balancer))
        if (load_balancer['id'] == id) {
            if (source_type == 'Instance') {
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
