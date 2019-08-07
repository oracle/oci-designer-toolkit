console.log('Loaded Load Balancer Javascript');

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
function addLoadBalancer(vcnid) {
    var id = 'okit-lb-' + uuidv4();

    // Add Virtual Cloud Network to JSON

    if (!('load_balancers' in OKITJsonObj['compartment'])) {
        OKITJsonObj['compartment']['load_balancers'] = [];
    }

    // Add id & empty name to id JSON
    okitIdsJsonObj[id] = '';
    load_balancer_ids.push(id);

    // Increment Count
    load_balancer_count += 1;
    var load_balancer = {};
    load_balancer['vcn_id'] = vcnid;
    load_balancer['virtual_cloud_network'] = '';
    load_balancer['id'] = id;
    load_balancer['display_name'] = generateDefaultName('lb', load_balancer_count);
    load_balancer['is_private'] = false;
    load_balancer['shape'] = '100Mbps';
    OKITJsonObj['compartment']['load_balancers'].push(load_balancer);
    okitIdsJsonObj[id] = load_balancer['display_name'];
    console.log(JSON.stringify(OKITJsonObj, null, 2));
    displayOkitJson();
    drawLoadBalancerSVG(load_balancer);
}

/*
** SVG Creation
 */
function drawLoadBalancerSVG(load_balancer) {
    var vcnid = load_balancer['vcn_id'];
    var id = load_balancer['id'];
    var position = vcn_element_icon_position;
    var translate_x = icon_translate_x_start + icon_width * position + vcn_icon_spacing * position;
    var translate_y = icon_translate_y_start;
    var svg_x = (icon_width / 2) + (icon_width * position) + (vcn_icon_spacing * position);
    var svg_y = (icon_height / 4) * 3;
    var data_type = "Route Table";

    // Increment Icon Position
    vcn_element_icon_position += 1;

    var okitcanvas_svg = d3.select('#' + vcnid + "-svg");
    var svg = okitcanvas_svg.append("svg")
        .attr("id", id + '-svg')
        .attr("data-type", data_type)
        .attr("data-vcnid", vcnid)
        .attr("title", load_balancer['display_name'])
        .attr("x", svg_x)
        .attr("y", svg_y)
        .attr("width", "100")
        .attr("height", "100");
    var rect = svg.append("rect")
        .attr("id", id)
        .attr("data-type", data_type)
        .attr("data-vcnid", vcnid)
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
        .text("Load Balancer: "+ load_balancer['display_name']);
    var g = svg.append("g")
        .attr("transform", "translate(5, 5) scale(0.3, 0.3)");
    g.append("path")
        .attr("class", "st0")
        .attr("d", "M194.6,81.8H93.4c-3.5,0-6.3,2.8-6.3,6.3v54.3h18.2v-23.9c0-5.2,4.2-9.3,9.3-9.3h20.1c5.2,0,9.3,4.2,9.3,9.3v20.9l22.7-21.8l-3-3.1l12.7-3.1l-3.6,12.6l-3-3.1l-22.4,21.6h28.7v-4.4l11.3,6.5l-11.3,6.5v-4.4h-28.7l22.4,21.6l3-3.1l3.6,12.6l-12.7-3.1l3-3.1l-22.7-21.8v20.9c0,5.2-4.2,9.3-9.3,9.3h-20.1c-5.2,0-9.3-4.2-9.3-9.3v-23.9H87.1v53c0,3.5,2.8,6.3,6.3,6.3h101.1c3.5,0,6.3-2.8,6.3-6.3V88.1C200.9,84.7,198,81.8,194.6,81.8z")
    g.append("path")
        .attr("class", "st0")
        .attr("d", "M109.8,146.8v23.9c0,2.7,2.2,5,5,5h20.1c2.7,0,5-2.2,5-5v-52.1c0-2.7-2.2-5-5-5h-20.1c-2.7,0-5,2.2-5,5v23.9h16.1v-4.4l11.3,6.5l-11.3,6.5v-4.4H109.8z")

    //var igelem = document.querySelector('#' + id);
    //igelem.addEventListener("click", function() { assetSelected('LoadBalancer', id) });

    // Add click event to display properties
    $('#' + id).on("click", function() { assetSelected('LoadBalancer', id) });
    d3.select('svg#' + id + '-svg').selectAll('path')
        .on("click", function() { assetSelected('LoadBalancer', id) });
    assetSelected('LoadBalancer', id);

    // Add Drag Event to allow connector (Currently done a mouse events because SVG does not have drag version)
    $('#' + id).on("mousedown", handleConnectorDragStart);
    $('#' + id).on("mousemove", handleConnectorDrag);
    $('#' + id).on("mouseup", handleConnectorDrop);
    $('#' + id).on("mouseover", handleConnectorDragEnter);
    $('#' + id).on("mouseout", handleConnectorDragLeave);
    // Add dragevent versions
    $('#' + id).on("dragstart", handleConnectorDragStart);
    $('#' + id).on("drop", handleConnectorDrop);
    $('#' + id).on("dragenter", handleConnectorDragEnter);
    $('#' + id).on("dragleave", handleConnectorDragLeave);
    d3.select('#' + id)
        .attr("dragable", true);
}

/*
** Property Sheet Load function
 */
function loadLoadBalancerProperties(id) {
    $("#properties").load("propertysheets/load_balancer.html", function () {
        if ('compartment' in OKITJsonObj && 'load_balancers' in OKITJsonObj['compartment']) {
            console.log('Loading Load Balancer: ' + id);
            var json = OKITJsonObj['compartment']['load_balancers'];
            for (var i = 0; i < json.length; i++) {
                load_balancer = json[i];
                //console.log(JSON.stringify(load_balancer, null, 2));
                if (load_balancer['id'] == id) {
                    //console.log('Found Route Table: ' + id);
                    load_balancer['virtual_cloud_network'] = okitIdsJsonObj[load_balancer['vcn_id']];
                    $("#virtual_cloud_network").html(load_balancer['virtual_cloud_network']);
                    $('#display_name').val(load_balancer['display_name']);
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

clearLoadBalancerVariables();
